import { ApiError } from '../../utils/ApiError.js';
import { withTransaction } from '../../utils/transaccion.js';
import * as repository from './requerimientos.repository.js';
import * as notificacionesRepository from '../notificaciones/notificaciones.repository.js';

const ESTADOS_VALIDOS = ['pendiente', 'asignado', 'resuelto'];
const DESCRIPCION_MIN = 5;
const DESCRIPCION_MAX = 2000;

// La imagen viaja como data URL base64 (JPG o PNG). 8.000.000 caracteres ≈ 6 MB de archivo.
const IMAGEN_MAX_CARACTERES = 8_000_000;
const IMAGEN_VALIDA = /^data:image\/(png|jpe?g);base64,/;

function puedeVer(requerimiento, usuario) {
  return usuario.rol === 'jefeMantenimiento' || Number(requerimiento.idUsuario) === Number(usuario.id);
}

function validarFecha(valor, nombre) {
  if (valor && Number.isNaN(Date.parse(valor))) {
    throw new ApiError(400, `La fecha "${nombre}" no es válida`);
  }
}

export async function listar(usuario, filtros) {
  if (filtros.estado && !ESTADOS_VALIDOS.includes(filtros.estado)) {
    throw new ApiError(400, `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`);
  }
  validarFecha(filtros.desde, 'desde');
  validarFecha(filtros.hasta, 'hasta');

  return repository.listar({
    idUsuario: usuario.id,
    rol: usuario.rol,
    sector: filtros.sector,
    estado: filtros.estado,
    desde: filtros.desde,
    hasta: filtros.hasta,
    sinTarea: filtros.sinTarea,
  });
}

export async function listarCategorias() {
  return repository.listarCategorias();
}

export async function listarSectores() {
  return repository.listarSectores();
}

export async function obtener(id, usuario) {
  const requerimiento = await repository.obtenerPorId(id);
  // un requerimiento eliminado (baja lógica) se comporta como inexistente
  if (!requerimiento || !requerimiento.activo) throw new ApiError(404, 'Requerimiento no encontrado');
  if (!puedeVer(requerimiento, usuario)) throw new ApiError(403, 'No tenés permisos para ver este requerimiento');
  return requerimiento;
}

export async function crear(datos, usuario) {
  const idCategoria = Number(datos.idCategoria);
  const idSector = Number(datos.idSector);
  const descripcion = String(datos.descripcion ?? '').trim();
  const imagen = datos.imagen || null;

  if (!Number.isInteger(idCategoria) || idCategoria < 1) throw new ApiError(400, 'La categoría es obligatoria');
  if (!Number.isInteger(idSector) || idSector < 1) throw new ApiError(400, 'El sector es obligatorio');
  if (descripcion.length < DESCRIPCION_MIN || descripcion.length > DESCRIPCION_MAX) {
    throw new ApiError(400, `La descripción debe tener entre ${DESCRIPCION_MIN} y ${DESCRIPCION_MAX} caracteres`);
  }
  if (imagen && (typeof imagen !== 'string' || !IMAGEN_VALIDA.test(imagen) || imagen.length > IMAGEN_MAX_CARACTERES)) {
    throw new ApiError(400, 'La imagen debe ser JPG o PNG y no superar los 5 MB');
  }

  // Categorías y sectores son tablas administradas por los Directivos: solo se pueden elegir las existentes
  const [categoria, sector] = await Promise.all([
    repository.obtenerCategoriaPorId(idCategoria),
    repository.obtenerSectorPorId(idSector),
  ]);
  if (!categoria) throw new ApiError(400, 'La categoría seleccionada no existe');
  if (!sector) throw new ApiError(400, 'El sector seleccionado no existe');

  return withTransaction(async (client) => {
    const id = await repository.crear({ descripcion, idSector, idCategoria, imagen, idUsuario: usuario.id }, client);

    await notificacionesRepository.crearParaRol(
      'jefeMantenimiento',
      {
        idRequerimiento: id,
        tipo: 'requerimiento',
        titulo: 'Nuevo requerimiento',
        mensaje: `Se emitió el requerimiento REQ-${String(id).padStart(4, '0')}: ${categoria.nombre} en ${sector.nombre}.`,
      },
      client,
    );
    return repository.obtenerPorId(id, client);
  });
}

export async function eliminar(id) {
  const requerimiento = await repository.obtenerPorId(id);
  if (!requerimiento || !requerimiento.activo) throw new ApiError(404, 'Requerimiento no encontrado');
  // Si ya se creó una tarea con él, esa tarea tiene su historial: el requerimiento no se elimina
  if (await repository.tieneTareas(id)) {
    throw new ApiError(409, 'No se puede eliminar un requerimiento que ya tiene una tarea');
  }
  await repository.desactivar(id);
}