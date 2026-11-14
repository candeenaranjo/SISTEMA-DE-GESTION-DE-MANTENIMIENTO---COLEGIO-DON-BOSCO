import { apiRequest } from '../../../shared/api/apiClient';

// Incluye las cuentas dadas de baja (la pantalla filtra por estado)
export function obtenerUsuarios() {
  return apiRequest('/usuarios', { query: { activo: 'todos' } });
}

export function obtenerUsuario(id) {
  return apiRequest(`/usuarios/${id}`);
}

// [{ id, nombre }] para el select de cargo del Directivo
export function obtenerCargos() {
  return apiRequest('/usuarios/cargos');
}

export function crearUsuario(datos) {
  return apiRequest('/usuarios', { method: 'POST', body: datos });
}

export function actualizarUsuario(id, datos) {
  return apiRequest(`/usuarios/${id}`, { method: 'PUT', body: datos });
}

export function darDeBajaUsuario(id) {
  return apiRequest(`/usuarios/${id}`, { method: 'DELETE' });
}

export function darDeAltaUsuario(id) {
  return apiRequest(`/usuarios/${id}`, { method: 'PUT', body: { activo: true } });
}