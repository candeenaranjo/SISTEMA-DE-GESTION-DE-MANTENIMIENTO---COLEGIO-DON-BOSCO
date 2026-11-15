import { apiRequest } from '../../../shared/api/apiClient';

function formatearFechaHora(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha
    .toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    .replace(/,\s*/, ' ');
}

function mapearRequerimiento(r) {
  return {
    id: r.id,
    idUsuario: r.idUsuario,
    titulo: r.titulo,
    descripcion: r.descripcion,
    sector: r.sector ?? r.lugar ?? '',
    lugar: r.sector ?? r.lugar ?? '',
    reportadoPor: r.reportadoPor,
    rolReportante: r.rolReportante,
    fechaHora: formatearFechaHora(r.fechaHora ?? r.fecha),
    estado: r.estado,
    // La imagen solo viene en el detalle (GET /requerimientos/:id), no en el listado
    imagen: r.imagen ?? null,
    tieneImagen: Boolean(r.imagen ?? r.tieneImagen),
    categoria: r.categoria ?? null,
  };
}

export async function obtenerRequerimientos(filtros = {}) {
  const requerimientos = await apiRequest('/requerimientos', { query: filtros });
  return requerimientos.map(mapearRequerimiento);
}

// Pantalla "Requerimientos" del Jefe: solo los pendientes que todavía no tienen una tarea en curso
export function obtenerRequerimientosPendientes() {
  return obtenerRequerimientos({ estado: 'pendiente', sinTarea: true });
}

// Ordenanza y Directivo: el backend ya devuelve solo los propios, en cualquier estado
export const obtenerMisRequerimientos = () => obtenerRequerimientos();

export const getRequerimientos = obtenerRequerimientos;

// Detalle (solo Jefe): incluye la imagen
export async function obtenerRequerimientoPorId(id) {
  const requerimiento = await apiRequest(`/requerimientos/${id}`);
  return mapearRequerimiento(requerimiento);
}

export async function crearRequerimiento(datos) {
  const requerimiento = await apiRequest('/requerimientos', {
    method: 'POST',
    body: datos,
  });
  return mapearRequerimiento(requerimiento);
}

export const guardarRequerimiento = crearRequerimiento;

export async function eliminarRequerimiento(id) {
  await apiRequest(`/requerimientos/${id}`, { method: 'DELETE' });
}

export async function obtenerCategorias() {
  return apiRequest('/categorias');
}

export async function obtenerSectores() {
  return apiRequest('/sectores');
}