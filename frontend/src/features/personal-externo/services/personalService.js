import { apiRequest } from '../../../shared/api/apiClient';

const BASE = '/personal-externos';

const codigoPersonal = (id) => `EXT-${String(id).padStart(3, '0')}`;

function formatearFecha(valor) {
  if (!valor) return '';
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return fecha.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// El id numérico se mantiene (lo usan las rutas y la API); `codigo` es el texto para mostrar (EXT-001).
function mapearPersonal(p) {
  return { ...p, codigo: codigoPersonal(p.id), fechaAlta: formatearFecha(p.fechaAlta) };
}

// Cuerpo para crear o modificar. DNI, correo y género son opcionales: un texto vacío significa
// "sin dato" y el backend lo guarda como null (así también se puede borrar un dato al editar).
function armarCuerpo(valores) {
  const cuerpo = {
    nombre: (valores.nombre ?? '').trim(),
    apellido: (valores.apellido ?? '').trim(),
    telefono: (valores.telefono ?? '').trim(),
    especialidad: (valores.especialidad ?? '').trim(),
    matricula: (valores.matricula ?? '').trim(),
    dni: (valores.dni ?? '').trim(),
    email: (valores.email ?? '').trim(),
    genero: valores.genero ?? '',
    observaciones: (valores.observaciones ?? '').trim(),
  };
  if (typeof valores.activo === 'boolean') cuerpo.activo = valores.activo;
  return cuerpo;
}

// Listado completo (activos e inactivos): los filtros por estado se aplican en pantalla
export async function obtenerPersonal(filtros = {}) {
  const personal = await apiRequest(BASE, { query: { activo: 'todos', ...filtros } });
  return personal.map(mapearPersonal);
}

export async function obtenerEspecialidades() {
  const personal = await obtenerPersonal();
  return [...new Set(personal.map((p) => p.especialidad))].sort();
}

export async function obtenerPersonalPorId(id) {
  return mapearPersonal(await apiRequest(`${BASE}/${id}`));
}

export async function crearPersonal(valores) {
  const creado = await apiRequest(BASE, { method: 'POST', body: armarCuerpo(valores) });
  return mapearPersonal(creado);
}

export async function actualizarPersonal(id, valores) {
  const actualizado = await apiRequest(`${BASE}/${id}`, { method: 'PUT', body: armarCuerpo(valores) });
  return mapearPersonal(actualizado);
}

// Baja lógica (DELETE): se conserva el registro y el historial de tareas que tuvo asignadas.
// Para volver a darlo de alta se usa actualizarPersonal(id, { ...valores, activo: true }).
export async function eliminarPersonal(id) {
  await apiRequest(`${BASE}/${id}`, { method: 'DELETE' });
}