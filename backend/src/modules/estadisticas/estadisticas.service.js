import { ROLES } from '../../constants/roles.js';
import * as repository from './estadisticas.repository.js';

const ZONA = 'America/Argentina/Buenos_Aires';

// "rechazada" no está acá: un rechazo devuelve la tarea a "en proceso"
// y se cuenta aparte (KPI "Tareas rechazadas") desde el historial.
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

export async function obtener(dias = 30) {
  const { desde, hasta, desdeAnterior } = rango(dias);

  const [
    resumen, sectores, evolucion, personal,
    tiempoResolucion, tiempoResolucionAnterior, estados,
  ] = await Promise.all([
    repository.obtenerResumen(desde, hasta, desdeAnterior),
    repository.obtenerSectores(desde, hasta),
    repository.obtenerEvolucionCompras(desde, hasta, ZONA),
    repository.obtenerPersonal(desde, hasta),
    repository.obtenerTiempoResolucion(desde, hasta),
    repository.obtenerTiempoResolucion(desdeAnterior, desde),
    repository.obtenerEstados(desde, hasta),
  ]);

  const totalGastos = Number(resumen.gastos_compras);
  const totalGastosAnterior = Number(resumen.gastos_compras_anterior);

  const estadosMap = Object.fromEntries(
    estados.map((fila) => [fila.estado, Number(fila.valor)]),
  );

  const meses = clavesDeMeses(desde, hasta);
  const serieMensualTotal = meses.map(({ anio, mes }) => {
    const fila = evolucion.find((item) => item.anio === anio && item.mes === mes);
    return fila ? Number(fila.valor) : 0;
  });

  return {
    periodo: dias,
    kpis: [
      { clave: 'total-requerimientos', etiqueta: 'Total de requerimientos',
        valor: Number(resumen.total_requerimientos),
        variacion: variacion(resumen.total_requerimientos, resumen.total_requerimientos_anterior),
        subeEsBueno: true },
      { clave: 'finalizadas', etiqueta: 'Tareas finalizadas',
        valor: Number(resumen.finalizadas),
        variacion: variacion(resumen.finalizadas, resumen.finalizadas_anterior),
        subeEsBueno: true },
      { clave: 'en-proceso', etiqueta: 'Tareas en proceso',
        valor: Number(resumen.en_proceso), variacion: null, subeEsBueno: false },
      { clave: 'demoradas', etiqueta: 'Tareas demoradas',
        valor: Number(resumen.demoradas), variacion: null, subeEsBueno: false },
      { clave: 'rechazadas', etiqueta: 'Tareas rechazadas',
        valor: Number(resumen.rechazadas),
        variacion: variacion(resumen.rechazadas, resumen.rechazadas_anterior),
        subeEsBueno: false },
      { clave: 'gastos', etiqueta: 'Gastos totales',
        valor: totalGastos,
        variacion: variacion(totalGastos, totalGastosAnterior),
        subeEsBueno: false, formato: 'moneda' },
    ],
    sectores,
    personal: personal.map((fila) => ({
      nombre: fila.nombre,
      realizadas: Number(fila.realizadas),
      tasa: Number(fila.realizadas) === 0
        ? 0
        : Math.round((Number(fila.exitosas) / Number(fila.realizadas)) * 100),
    })),
    evolucionGastos: {
      meses: meses.map((m) => m.etiqueta),
      series: [
        { clave: 'gastos', nombre: 'Gasto total', valores: serieMensualTotal },
      ],
    },
    tiempoResolucion: {
      dias: tiempoResolucion,
      variacion: variacion(tiempoResolucion, tiempoResolucionAnterior),
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
  if (rol === ROLES.JEFE) {
    return {
      requerimientosPendientes: r.requerimientos_pendientes,
      tareasPendientes: r.tareas_pendientes,
      tareasEnProceso: r.en_proceso,
      tareasDemoradas: r.demoradas,
      tareasFinalizadas: r.finalizadas,
      tareasRechazadas: r.rechazadas,
    };
  }
  return {
    pendientesEvaluacion: r.pendientes_evaluacion,
    enProceso: r.en_proceso,
    finalizadas: r.finalizadas,
    rechazadas: r.rechazadas,
  };
}