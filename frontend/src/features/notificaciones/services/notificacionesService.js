import { apiRequest } from '../../../shared/api/apiClient';

// El backend devuelve la fecha en ISO; acá se muestra en la hora del navegador
function formatear(n) {
  const fecha = new Date(n.fecha);
  return {
    ...n,
    fecha: fecha.toLocaleDateString('es-AR'),
    hora: fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }),
  };
}

// Solo trae las notificaciones del usuario logueado (el backend ya filtra por usuario)
export async function obtenerNotificaciones() {
  const lista = await apiRequest('/notificaciones');
  return lista.map(formatear);
}

export async function contarNoLeidas() {
  const lista = await apiRequest('/notificaciones', { query: { leida: false } });
  return lista.length;
}

export async function marcarComoLeida(id) {
  return formatear(await apiRequest(`/notificaciones/${id}`, { method: 'PUT' }));
}

export async function marcarTodasComoLeidas(ids) {
  await Promise.all(ids.map((id) => marcarComoLeida(id)));
}