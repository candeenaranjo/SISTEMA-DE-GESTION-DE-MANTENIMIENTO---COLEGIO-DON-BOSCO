import { ApiError } from '../../utils/ApiError.js';
import { withTransaction } from '../../utils/transaccion.js';
import * as repository from './tareas.repository.js';
import * as requerimientosRepository from '../requerimientos/requerimientos.repository.js';
import * as historialRepository from '../historial/historial.repository.js';
import * as notificacionesRepository from '../notificaciones/notificaciones.repository.js';
import { mapearTarea } from './tareas.mapper.js';
import { ROLES_RESPONSABLES } from '../../constants/roles.js';

const PRIORIDADES = ['baja', 'media', 'alta'];
const ESTADOS = ['pendiente', 'en-proceso', 'demorada', 'cancelada', 'finalizada', 'aprobada'];
const ESTADOS_EVALUACION = ['aprobada', 'rechazada'];

// Cambios que el Jefe puede pedir en PUT /tareas/:id/estado: estado actual -> estados permitidos.
// (cancelar tiene su propio endpoint; aprobar/rechazar es del Directivo)
const TRANSICIONES_JEFE = {
  pendiente: ['en-proceso'],
  'en-proceso': ['demorada', 'finalizada'],
  demorada: ['en-proceso'], // la retoma manualmente cuando se resuelve la gestión externa
};

// El requerimiento sigue el estado de su tarea. Es el ÚNICO lugar donde se define esta correspondencia.
// Los valores son los estados válidos de un requerimiento: pendiente, asignado, resuelto.
const ESTADO_REQUERIMIENTO = {
  pendiente: 'pendiente',
  'en-proceso': 'asignado',
  demorada: 'asignado',
  finalizada: 'asignado',
  aprobada: 'resuelto',
  cancelada: 'pendiente', // al cancelar se crea otra tarea pendiente con el mismo requerimiento
};

const codigoTarea = (id) => `T-${String(id).padStart(4, '0')}`;

function normalizarId(valor) {
  if (valor === undefined || valor === null || valor === '') return null;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new ApiError(400, 'El identificador debe ser un número entero válido');
  }
  return numero;
}

function validarFecha(valor, nombre) {
  if (valor && Number.isNaN(Date.parse(valor))) throw new ApiError(400, `La fecha "${nombre}" no es válida`);
}

async function buscarTarea(id, client) {
  const tarea = client ? await repository.obtenerPorIdBloqueando(id, client) : await repository.obtenerPorId(id);
  if (!tarea) throw new ApiError(404, 'Tarea no encontrada');
  return tarea;
}

// Valida el responsable: interno (Jefe u Ordenanza activo) o externo (activo), nunca ambos.
async function resolverResponsable(datos) {
  const idResponsable = normalizarId(datos.idResponsable);
  const idPersonalExterno = normalizarId(datos.idPersonalExterno);

  if (idResponsable && idPersonalExterno) {
    throw new ApiError(400, 'La tarea tiene un solo responsable: interno o externo, no ambos');
  }
  if (idResponsable) {
    const usuario = await repository.obtenerUsuarioActivo(idResponsable);
    if (!usuario) throw new ApiError(400, 'El responsable indicado no existe o está dado de baja');
    if (!ROLES_RESPONSABLES.includes(usuario.rol)) {
      throw new ApiError(400, 'Solo el Jefe de Mantenimiento o el personal de Ordenanza pueden ser responsables');
    }
  }
  if (idPersonalExterno) {
    const personal = await repository.obtenerPersonalActivo(idPersonalExterno);
    if (!personal) throw new ApiError(400, 'El personal externo indicado no existe o está dado de baja');
  }
  return { idResponsable, idPersonalExterno };
}

export async function listar(filtros) {
  if (filtros.estado && !ESTADOS.includes(filtros.estado)) {
    throw new ApiError(400, `Estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);
  }
  if (filtros.prioridad && !PRIORIDADES.includes(filtros.prioridad)) {
    throw new ApiError(400, 'La prioridad debe ser baja, media o alta');
  }
  validarFecha(filtros.desde, 'desde');
  validarFecha(filtros.hasta, 'hasta');

  const tareas = await repository.listar(filtros);
  return tareas.map(mapearTarea);
}

// GET /tareas/resumen (Jefe): cantidad de tareas por estado para el panel de inicio
export async function resumen() {
  return repository.resumen();
}

export async function obtener(id) {
  return mapearTarea(await buscarTarea(id));
}

// POST /tareas (Jefe): toma un requerimiento pendiente y le asigna responsable.
// La tarea NACE "en proceso": se registra la fecha de inicio y el requerimiento pasa a "asignado".
export async function crear(datos, actor) {
  const idRequerimiento = normalizarId(datos.idRequerimiento);
  if (!idRequerimiento) throw new ApiError(400, 'El requerimiento es obligatorio');
  if (!PRIORIDADES.includes(datos.prioridad)) throw new ApiError(400, 'La prioridad debe ser baja, media o alta');

  const { idResponsable, idPersonalExterno } = await resolverResponsable(datos);
  if (!idResponsable && !idPersonalExterno) throw new ApiError(400, 'Hay que asignar un responsable a la tarea');

  try {
    return await withTransaction(async (client) => {
      const requerimiento = await requerimientosRepository.obtenerPorId(idRequerimiento, client);
      if (!requerimiento || !requerimiento.activo) throw new ApiError(404, 'Requerimiento no encontrado');
      // Un requerimiento resuelto (tarea aprobada) no tiene tarea en curso, pero tampoco se puede volver a tomar
      if (requerimiento.estado !== 'pendiente') throw new ApiError(409, 'El requerimiento no está pendiente');
      if (await repository.existeTareaEnCurso(idRequerimiento, client)) {
        throw new ApiError(409, 'Ya existe una tarea en curso para este requerimiento');
      }

      const id = await repository.crear(
        {
          idRequerimiento,
          prioridad: datos.prioridad,
          estado: 'en-proceso',
          fechaInicio: new Date(), // inicio automático
          observaciones: datos.observaciones ?? null,
          idResponsable,
          idPersonalExterno,
        },
        client,
      );

      await historialRepository.crear(
        id,
        { estado: 'en-proceso', motivo: 'Tarea creada y asignada; se inició automáticamente.', idUsuario: actor.id },
        client,
      );

      await requerimientosRepository.cambiarEstado(idRequerimiento, ESTADO_REQUERIMIENTO['en-proceso'], client);

      return mapearTarea(await repository.obtenerPorId(id, client));
    });
  } catch (err) {
    // Otro usuario creó una tarea para el mismo requerimiento justo al mismo tiempo (índice único)
    if (err.code === '23505') throw new ApiError(409, 'Ya existe una tarea en curso para este requerimiento');
    throw err;
  }
}

export async function actualizar(id, datos, actor) {
  const actual = await buscarTarea(id);
  if (['cancelada', 'aprobada'].includes(actual.estado)) {
    throw new ApiError(409, `La tarea está ${actual.estado} y no se puede modificar`);
  }

  const prioridad = datos.prioridad ?? actual.prioridad;
  if (!PRIORIDADES.includes(prioridad)) throw new ApiError(400, 'La prioridad debe ser baja, media o alta');

  // Si se indica un responsable, reemplaza al anterior (interno o externo): nunca quedan los dos
  let idResponsable = actual.idResponsable;
  let idPersonalExterno = actual.idPersonalExterno;
  if (datos.idResponsable !== undefined || datos.idPersonalExterno !== undefined) {
    ({ idResponsable, idPersonalExterno } = await resolverResponsable(datos));
    if (!idResponsable && !idPersonalExterno) throw new ApiError(400, 'La tarea necesita un responsable');
  }

  await repository.actualizar(id, {
    prioridad,
    observaciones: datos.observaciones !== undefined ? datos.observaciones : actual.observaciones,
    idResponsable,
    idPersonalExterno,
  });

  return obtener(id);
}

// PUT /tareas/:id/estado  (Jefe): en-proceso, demorada, finalizada
export async function cambiarEstado(id, datos, actor) {
  const estado = datos.estado;
  const motivo = String(datos.motivo ?? '').trim();
  if (!Object.values(TRANSICIONES_JEFE).flat().includes(estado)) {
    throw new ApiError(400, 'El estado debe ser en-proceso, demorada o finalizada (para cancelar usá /cancelacion)');
  }
  if (estado === 'demorada' && !motivo) throw new ApiError(400, 'El motivo es obligatorio para demorar una tarea');

  return withTransaction(async (client) => {
    const actual = await buscarTarea(id, client);

    const permitidos = TRANSICIONES_JEFE[actual.estado] ?? [];
    if (!permitidos.includes(estado)) {
      throw new ApiError(409, `No se puede pasar una tarea de "${actual.estado}" a "${estado}"`);
    }
    if (actual.estado === 'pendiente' && !actual.idResponsable && !actual.idPersonalExterno) {
      throw new ApiError(409, 'Asigná un responsable antes de iniciar la tarea');
    }

    const ahora = new Date();
    await repository.cambiarEstado(
      id,
      {
        estado,
        // inicio automático la primera vez que pasa a en-proceso (al retomar una demorada se conserva)
        fechaInicio: actual.fechaInicio ?? (estado === 'en-proceso' ? ahora : null),
        // fin automático al finalizar
        fechaFin: estado === 'finalizada' ? ahora : actual.fechaFin,
        idDirectivo: actual.idDirectivo,
        observaciones: datos.observaciones ?? actual.observaciones,
      },
      client,
    );

    const motivoPorDefecto = {
      'en-proceso': actual.estado === 'demorada' ? 'Se retomó la tarea.' : 'Se inició la tarea.',
      finalizada: 'Tarea finalizada. Pendiente de evaluación del Directivo.',
    };
    await historialRepository.crear(
      id,
      { estado, motivo: motivo || motivoPorDefecto[estado], idUsuario: actor.id },
      client,
    );

    await requerimientosRepository.cambiarEstado(actual.idRequerimiento, ESTADO_REQUERIMIENTO[estado], client);

    // Los Directivos reciben un aviso cada vez que el Jefe da una tarea por finalizada
    if (estado === 'finalizada') {
      await notificacionesRepository.crearParaRol(
        'directivo',
        {
          idRequerimiento: actual.idRequerimiento,
          idTarea: id,
          tipo: 'tarea-finalizada',
          titulo: 'Tarea finalizada',
          mensaje: `La tarea ${codigoTarea(id)}: ${actual.categoria} pasó a finalizada y espera tu aprobación.`,
        },
        client,
      );
    }

    return mapearTarea(await repository.obtenerPorId(id, client));
  });
}

// PUT /tareas/:id/cancelacion  (Jefe): cancela y genera una tarea nueva pendiente para el mismo requerimiento
export async function cancelar(id, datos, actor) {
  const motivo = String(datos.motivo ?? '').trim();
  if (!motivo) throw new ApiError(400, 'El motivo es obligatorio para cancelar una tarea');

  return withTransaction(async (client) => {
    const actual = await buscarTarea(id, client);
    if (!['pendiente', 'en-proceso', 'demorada'].includes(actual.estado)) {
      throw new ApiError(409, 'Solo se puede cancelar una tarea pendiente, en proceso o demorada');
    }

    // 1) La original queda cancelada (se libera el requerimiento para el índice único)
    await repository.cambiarEstado(
      id,
      {
        estado: 'cancelada',
        fechaInicio: actual.fechaInicio,
        fechaFin: new Date(),
        idDirectivo: actual.idDirectivo,
        observaciones: actual.observaciones,
      },
      client,
    );
    await historialRepository.crear(id, { estado: 'cancelada', motivo, idUsuario: actor.id }, client);

    // 2) Tarea nueva: mismo requerimiento, misma prioridad y observaciones, sin responsable (hay que reasignar)
    const idNueva = await repository.crear(
      {
        idRequerimiento: actual.idRequerimiento,
        prioridad: actual.prioridad,
        estado: 'pendiente',
        observaciones: actual.observaciones,
        idTareaOrigen: id,
      },
      client,
    );

    // 3) La nueva hereda el historial (incluye el estado cancelado) y las compras de la original
    await repository.copiarHistorial(id, idNueva, client);
    await historialRepository.crear(
      idNueva,
      {
        estado: 'pendiente',
        motivo: `Tarea generada automáticamente por la cancelación de ${codigoTarea(id)}.`,
        idUsuario: actor.id,
      },
      client,
    );
    await repository.moverCompras(id, idNueva, client);

    // 4) El requerimiento vuelve a pendiente (tarea nueva pendiente)
    await requerimientosRepository.cambiarEstado(actual.idRequerimiento, ESTADO_REQUERIMIENTO.cancelada, client);

    return {
      cancelada: mapearTarea(await repository.obtenerPorId(id, client)),
      nueva: mapearTarea(await repository.obtenerPorId(idNueva, client)),
    };
  });
}

// PUT /tareas/:id/evaluacion  (Directivo): aprobar o rechazar una tarea finalizada
export async function evaluar(id, datos, actor) {
  const estado = datos.estado;
  const motivo = String(datos.motivo ?? '').trim();
  if (!ESTADOS_EVALUACION.includes(estado)) throw new ApiError(400, 'La evaluación debe ser aprobada o rechazada');
  if (estado === 'rechazada' && !motivo) throw new ApiError(400, 'El motivo es obligatorio para rechazar una tarea');

  return withTransaction(async (client) => {
    const actual = await buscarTarea(id, client);
    if (actual.estado !== 'finalizada') throw new ApiError(409, 'Solo se pueden evaluar tareas finalizadas');

    if (estado === 'aprobada') {
      await repository.cambiarEstado(
        id,
        {
          estado: 'aprobada',
          fechaInicio: actual.fechaInicio,
          fechaFin: actual.fechaFin,
          idDirectivo: actor.id,
          observaciones: actual.observaciones,
        },
        client,
      );
      await historialRepository.crear(
        id,
        { estado: 'aprobada', motivo: motivo || 'El Directivo aprobó la tarea.', idUsuario: actor.id },
        client,
      );
      await requerimientosRepository.cambiarEstado(actual.idRequerimiento, ESTADO_REQUERIMIENTO.aprobada, client);
    } else {
      // Rechazo: la tarea vuelve a en-proceso (sin fecha de fin) y el requerimiento sigue asignado.
      // La tarea nunca "queda" rechazada: el rechazo y el motivo quedan en el historial de auditoría.
      await repository.cambiarEstado(
        id,
        {
          estado: 'en-proceso',
          fechaInicio: actual.fechaInicio,
          fechaFin: null,
          idDirectivo: actor.id,
          observaciones: actual.observaciones,
        },
        client,
      );
      await historialRepository.crear(id, { estado: 'rechazada', motivo, idUsuario: actor.id }, client);
      await historialRepository.crear(
        id,
        { estado: 'en-proceso', motivo: 'Tarea retomada tras el rechazo del Directivo.', idUsuario: actor.id },
        client,
      );
      await requerimientosRepository.cambiarEstado(actual.idRequerimiento, ESTADO_REQUERIMIENTO['en-proceso'], client);
    }

    return mapearTarea(await repository.obtenerPorId(id, client));
  });
}