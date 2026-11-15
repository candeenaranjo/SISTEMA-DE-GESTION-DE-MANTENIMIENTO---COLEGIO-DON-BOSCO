import { pool } from '../../config/db.js';

const CAMPOS = `
    r.id_requerimiento AS id,
    r.descripcion,
    r.id_sector AS "idSector", -- puede ser NULL si el sector se eliminó (el requerimiento ya estaba resuelto)
    r.sector_nombre AS sector,
    r.sector_nombre AS lugar, -- alias de compatibilidad con el front
    r.estado,
    r.activo,
    r.id_categoria AS "idCategoria", -- puede ser NULL si la categoría se eliminó
    r.categoria_nombre AS categoria,
    r.categoria_nombre AS titulo, -- alias de compatibilidad con el front
    r.id_usuario AS "idUsuario",
    u.nombre || ' ' || u.apellido AS "reportadoPor",
    ro.nombre AS "rolReportante",
    r.fecha_emision AS "fechaHora"`;

const DESDE = `
  FROM requerimientos r
  JOIN usuarios u ON u.id_usuario = r.id_usuario
  JOIN roles ro ON ro.id_rol = u.id_rol
`;

// El listado NO trae la imagen (en base64 pesa varios MB por fila); solo el detalle la devuelve.
const SELECT_RESUMEN = `SELECT ${CAMPOS}, (r.imagen IS NOT NULL) AS "tieneImagen" ${DESDE}`;
const SELECT_DETALLE = `SELECT ${CAMPOS}, r.imagen ${DESDE}`;

export async function listar({ idUsuario, rol, sector, estado, desde, hasta, sinTarea } = {}) {
  const condiciones = ['r.activo = TRUE'];
  const valores = [];

  // Solo el Jefe ve todos. Cualquier otro rol ve únicamente los propios
  // (si idUsuario faltara, la comparación con NULL no devuelve nada: falla cerrado).
  if (rol !== 'jefeMantenimiento') {
    valores.push(idUsuario);
    condiciones.push(`r.id_usuario = $${valores.length}`);
  }
  if (sector) {
    valores.push(`%${sector}%`);
    condiciones.push(`r.sector_nombre ILIKE $${valores.length}`);
  }
  if (estado) {
    valores.push(estado);
    condiciones.push(`r.estado = $${valores.length}`);
  }
  if (sinTarea) {
    // Pendientes que todavía no tienen una tarea en curso: lo que el Jefe puede tomar.
    // (una tarea "en curso" es la que no está cancelada ni aprobada)
    condiciones.push(`r.estado = 'pendiente'`);
    condiciones.push(`NOT EXISTS (
      SELECT 1 FROM tareas t
      WHERE t.id_requerimiento = r.id_requerimiento
        AND t.estado NOT IN ('cancelada', 'aprobada')
    )`);
  }
  if (desde) {
    valores.push(desde);
    condiciones.push(`r.fecha_emision >= $${valores.length}::date`);
  }
  if (hasta) {
    // "hasta" es inclusivo: se incluye todo el día indicado
    valores.push(hasta);
    condiciones.push(`r.fecha_emision < ($${valores.length}::date + 1)`);
  }

  const { rows } = await pool.query(
    `${SELECT_RESUMEN} WHERE ${condiciones.join(' AND ')} ORDER BY r.fecha_emision DESC`,
    valores,
  );
  return rows;
}

export async function obtenerPorId(id, db = pool) {
  const { rows } = await db.query(`${SELECT_DETALLE} WHERE r.id_requerimiento = $1`, [id]);
  return rows[0] ?? null;
}

export async function listarCategorias() {
  const { rows } = await pool.query('SELECT id_categoria, nombre FROM categorias ORDER BY nombre');
  return rows;
}

export async function obtenerCategoriaPorId(id, db = pool) {
  const { rows } = await db.query('SELECT id_categoria, nombre FROM categorias WHERE id_categoria = $1', [id]);
  return rows[0] ?? null;
}

export async function listarSectores() {
  const { rows } = await pool.query('SELECT id_sector, nombre FROM sectores ORDER BY nombre');
  return rows;
}

export async function obtenerSectorPorId(id, db = pool) {
  const { rows } = await db.query('SELECT id_sector, nombre FROM sectores WHERE id_sector = $1', [id]);
  return rows[0] ?? null;
}

// El estado no se inserta: la base lo deja en 'pendiente' por defecto (estado inicial).
// Requiere la columna: ALTER TABLE requerimientos ADD COLUMN IF NOT EXISTS imagen TEXT;
export async function crear(datos, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO requerimientos (descripcion, id_sector, id_categoria, id_usuario, imagen)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id_requerimiento`,
    [datos.descripcion, datos.idSector, datos.idCategoria, datos.idUsuario, datos.imagen ?? null],
  );
  return rows[0].id_requerimiento;
}

// Lo usa el módulo de tareas para sincronizar el estado del requerimiento con el de su tarea
// (pendiente→pendiente; en-proceso/demorada/finalizada→asignado; aprobada→resuelto; cancelada→pendiente)
export async function cambiarEstado(id, estado, db = pool) {
  const { rows } = await db.query(
    `UPDATE requerimientos SET estado = $1 WHERE id_requerimiento = $2 RETURNING id_requerimiento, estado`,
    [estado, id],
  );
  return rows[0] ?? null;
}

// ¿Alguna vez se creó una tarea con este requerimiento? (en cualquier estado)
export async function tieneTareas(id, db = pool) {
  const { rows } = await db.query(
    'SELECT EXISTS (SELECT 1 FROM tareas WHERE id_requerimiento = $1) AS existe',
    [id],
  );
  return rows[0].existe;
}

// Baja lógica: se conserva el registro para no romper el historial ni las estadísticas
export async function desactivar(id, db = pool) {
  const { rowCount } = await db.query(
    'UPDATE requerimientos SET activo = FALSE WHERE id_requerimiento = $1 AND activo = TRUE',
    [id],
  );
  return rowCount > 0;
}