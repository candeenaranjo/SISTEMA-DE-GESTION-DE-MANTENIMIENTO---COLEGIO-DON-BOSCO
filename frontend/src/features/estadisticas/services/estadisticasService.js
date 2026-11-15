import { apiRequest } from '../../../shared/api/apiClient';

// periodo: cantidad de días hacia atrás (GET /estadisticas?hace=30)
export function obtenerEstadisticas(periodo = 30) {
  return apiRequest('/estadisticas', { query: { hace: periodo } });
}