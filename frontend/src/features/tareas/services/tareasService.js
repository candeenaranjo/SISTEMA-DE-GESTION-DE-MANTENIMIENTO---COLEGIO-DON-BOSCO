import { apiRequest } from '../../../shared/api/apiClient';

const BASE = '/tareas';

export function obtenerTareas(filtros = {}) {
  return apiRequest(BASE, { query: filtros });
}

export function obtenerTareaPorId(id) {
  return apiRequest(`${BASE}/${id}`);
}

// Cantidad de tareas por estado para el panel del Jefe
export function obtenerResumenPanel() {
  return apiRequest(`${BASE}/resumen`);
}

// Crear a partir de requerimiento (la tarea nace "en-proceso"):
// { idRequerimiento, prioridad, observaciones?, idResponsable?, idPersonalExterno? }
export function crearTarea(datos) {
  return apiRequest(BASE, { method: 'POST', body: datos });
}

// Editar datos (NO estado): { prioridad, observaciones, idResponsable?, idPersonalExterno? }
export function actualizarTarea(id, datos) {
  return apiRequest(`${BASE}/${id}`, { method: 'PUT', body: datos });
}

// Cambiar estado (Jefe): { estado: 'en-proceso'|'demorada'|'finalizada', motivo?, observaciones? }
// "demorada" exige motivo.
export function cambiarEstadoTarea(id, datos) {
  return apiRequest(`${BASE}/${id}/estado`, { method: 'PUT', body: datos });
}

// Cancelar: devuelve { cancelada, nueva }
export function cancelarTarea(id, motivo) {
  return apiRequest(`${BASE}/${id}/cancelacion`, { method: 'PUT', body: { motivo } });
}

// Evaluar (Directivo): { estado: 'aprobada'|'rechazada', motivo? }
export function evaluarTarea(id, datos) {
  return apiRequest(`${BASE}/${id}/evaluacion`, { method: 'PUT', body: datos });
}

// Historial de auditoría: [{ id, estado, motivo, fecha, usuario }]
export function obtenerHistorialTarea(id) {
  return apiRequest(`${BASE}/${id}/historial`);
}

// Listas para el selector de responsable (solo el Jefe tiene permiso)
export function obtenerResponsablesInternos() {
  return apiRequest('/usuarios/asignables');
}

export function obtenerPersonalExterno() {
  return apiRequest('/personal-externos');
}