import { ROLES } from '../../constants/roles.js';
import * as repository from './estadisticas.repository.js';

const ZONA = 'America/Argentina/Buenos_Aires';

const ESTADOS = [
  ['pendiente', 'Pendiente'],
  ['en-proceso', 'En proceso'],
  ['demorada', 'Demorada'],
  ['cancelada', 'Cancelada'],
  ['finalizada', 'Finalizada'],
  ['aprobada', 'Aprobada'],
];

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function variacion(actual, anterior) {
  const a = Number(actual) || 0;
  const b = Number(anterior) || 0;
  if (b === 0) return a === 0 ? 0 : 100;
  return Math.round(((a - b) / b) * 100);
}

function rango(dias) {
  const hasta = new Date();
  const desde = new Date(hasta.getTime() - dias * 86400000);
  const desdeAnterior = new Date(desde.getTime() - dias * 86400000);
  return { desde, hasta, desdeAnterior };
}

function anioMes(fecha) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA, year: 'numeric', month: '2-digit',
  }).formatToParts(fecha);
  return {
    anio: Number(partes.find((p) => p.type === 'year').value),
    mes: Number(partes.find((p) => p.type === 'month').value),
  };
}

function clavesDeMeses(desde, hasta) {
  const inicio = anioMes(desde);
  const fin = anioMes(hasta);
  const variosAnios = inicio.anio !== fin.anio;
  const claves = [];
  let { anio, mes } = inicio;
  while (anio < fin.anio || (anio === fin.anio && mes <= fin.mes)) {
    claves.push({
      anio,
      mes,
      etiqueta: MESES[mes - 1] + (variosAnios ? ` ${String(anio).slice(2)}` : ''),
    });
    mes += 1;
    if (mes > 12) { mes = 1; anio += 1; }
  }
  return claves;
}

export async function obtener() {
  // 1. Traemos TODOS los datos de la base de datos de una vez
  const [resumen, sectores, evolucion, personal, tiempoResolucion, estados] = await Promise.all([
    repository.obtenerResumenGeneral(), // <-- Nueva función que crearemos
    repository.obtenerSectores(),
    repository.obtenerEvolucionCompras(),
    repository.obtenerPersonal(),
    repository.obtenerTiempoResolucion(),
    repository.obtenerEstados(),
  ]);

  const totalGastos = Number(resumen.gastos_compras);
  const estadosMap = Object.fromEntries(
    estados.map((fila) => [fila.estado, Number(fila.valor)]),
  );

  // Como ya no hay períodos, mostramos todos los meses que tienen datos
  const meses = evolucion.map(item => MESES[item.mes - 1]);

  return {
    kpis: [
      { clave: 'total-requerimientos', etiqueta: 'Total de requerimientos',
        valor: Number(resumen.total_requerimientos), variacion: null, subeEsBueno: true },
      { clave: 'finalizadas', etiqueta: 'Tareas finalizadas',
        valor: Number(resumen.finalizadas), variacion: null, subeEsBueno: true },
      { clave: 'en-proceso', etiqueta: 'Tareas en proceso',
        valor: Number(resumen.en_proceso), variacion: null, subeEsBueno: false },
      { clave: 'demoradas', etiqueta: 'Tareas demoradas',
        valor: Number(resumen.demoradas), variacion: null, subeEsBueno: false },
      { clave: 'rechazadas', etiqueta: 'Tareas rechazadas',
        valor: Number(resumen.rechazadas), variacion: null, subeEsBueno: false },
      { clave: 'gastos', etiqueta: 'Gastos totales',
        valor: totalGastos, variacion: null, subeEsBueno: false, formato: 'moneda' },
    ],
    sectores,
    personal: personal.map((fila) => ({
      nombre: fila.nombre,
      realizadas: Number(fila.realizadas),
      tasa: Number(fila.realizadas) === 0 ? 0 : Math.round((Number(fila.exitosas) / Number(fila.realizadas)) * 100),
    })),
    evolucionGastos: {
      meses: meses,
      series: [{ clave: 'gastos', nombre: 'Gasto total', valores: evolucion.map(e => Number(e.valor)) }],
    },
    tiempoResolucion: {
      dias: tiempoResolucion,
      variacion: 0,
    },
    estadoTareas: ESTADOS.map(([clave, etiqueta]) => ({
      clave,
      estado: etiqueta,
      valor: estadosMap[clave] ?? 0,
    })),
  };
}

export async function obtenerResumenPanel(rol) {
  const r = await repository.obtenerResumenPanel();
  if (rol === ROLES.JEFE_MANTENIMIENTO) {
    return {
      requerimientosPendientes: r.requerimientos_pendientes,
      tareasPendientes: r.tareas_pendientes,
      tareasEnProceso: r.en_proceso,
      tareasDemoradas: r.demoradas,
      tareasAprobadas: r.aprobadas,
      tareasCanceladas: r.canceladas,
    };
  }
  return {
    requerimientosPendientes: r.requerimientos_pendientes,
    enProceso: r.en_proceso,
    finalizadas: r.pendientes_evaluacion,
    rechazadas: r.rechazadas,
  };
}
export async function listar(filtros, actor) {
  if (filtros.estado && !ESTADOS.includes(filtros.estado)) {
    throw new ApiError(400, `Estado inválido. Valores permitidos: ${ESTADOS.join(', ')}`);
  }
  if (filtros.prioridad && !PRIORIDADES.includes(filtros.prioridad)) {
    throw new ApiError(400, 'La prioridad debe ser baja, media o alta');
  }
  validarFecha(filtros.desde, 'desde');
  validarFecha(filtros.hasta, 'hasta');

  if (actor && actor.rol === 'ordenanza') {
    filtros.idResponsable = actor.id;
  }

  const tareas = await repository.listar(filtros);
  return tareas.map(mapearTarea);
}