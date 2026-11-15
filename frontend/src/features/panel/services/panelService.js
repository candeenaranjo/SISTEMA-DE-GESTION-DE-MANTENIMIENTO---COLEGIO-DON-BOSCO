import { apiRequest } from '../../../shared/api/apiClient';
import { obtenerRequerimientosPendientes } from '../../requerimientos/services/requerimientosService';
import { obtenerTareas as obtenerTareasApi } from '../../tareas/services/tareasService';

// Cards del panel de inicio. El backend devuelve los indicadores del rol de quien consulta:
//  Jefe:      { requerimientosPendientes, tareasPendientes, tareasEnProceso,
//               tareasDemoradas, tareasFinalizadas, tareasRechazadas }
//  Directivo: { pendientesEvaluacion, enProceso, finalizadas, rechazadas }
export function obtenerResumenPanel() {
  return apiRequest('/estadisticas/resumen');
}

// Tabla "Requerimientos recientes" del Jefe: los pendientes que todavía esperan una tarea.
// Viene ya mapeado (fechaHora formateada, lugar, reportadoPor, etc.).
export async function obtenerRequerimientosRecientes() {
  const pendientes = await obtenerRequerimientosPendientes();
  return pendientes.slice(0, 10);
}

export async function obtenerTareas() {
  const tareas = await obtenerTareasApi();
  return { tareas }; // el componente espera { tareas }
}

// Panel del Directivo: cards + tareas finalizadas que esperan su evaluación
export async function obtenerPanelDirectivo() {
  const [resumen, tareasEvaluacion] = await Promise.all([
    obtenerResumenPanel(),
    obtenerTareasApi({ estado: 'finalizada' }),
  ]);

  return { resumen, tareasEvaluacion };
}