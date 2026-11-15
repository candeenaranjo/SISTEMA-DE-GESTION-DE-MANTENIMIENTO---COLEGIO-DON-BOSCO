// Formatos compartidos entre las pantallas de requerimientos y tareas

export const codigoTarea = (id) => `T-${String(id).padStart(4, '0')}`;
export const codigoRequerimiento = (id) => `REQ-${String(id).padStart(4, '0')}`;

// "15/11/2026 10:30". Si el valor ya viene formateado (o no es una fecha), se devuelve tal cual.
export function formatearFechaHora(valor) {
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

// "aaaa-mm-dd" en hora local, para el valor de un <input type="date">
export function aFechaInput(valor) {
  if (!valor) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  const fecha = new Date(valor);
  if (Number.isNaN(fecha.getTime())) return '';
  const dos = (n) => String(n).padStart(2, '0');
  return `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(fecha.getDate())}`;
}