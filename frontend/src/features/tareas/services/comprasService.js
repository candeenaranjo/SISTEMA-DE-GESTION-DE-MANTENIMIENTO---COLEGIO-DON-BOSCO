import { apiRequest } from '../../../shared/api/apiClient';

export function crearCompra(idTarea, datos) {
  return apiRequest(`/tareas/${idTarea}/compras`, {
    method: 'POST',
    body: datos,
  });
}

export function actualizarCompra(idCompra, datos) {
  return apiRequest(`/compras/${idCompra}`, {
    method: 'PUT',
    body: datos,
  });
}