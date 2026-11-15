import { pool } from '../../config/db.js';

// Los nombres de categoría y sector se leen del propio requerimiento (copia guardada al emitirlo),
// así la tarea se sigue mostrando aunque esa categoría o sector se haya eliminado después.
const SELECT_TAREA = `
  SELECT
    t.id_tarea AS id,
    t.id_requerimiento AS "idRequerimiento",
    r.categoria_nombre AS categoria,
    r.categoria_nombre AS "requerimientoTitulo", -- alias de compatibilidad con el front
    r.categoria_nombre AS titulo,                -- alias de compatibilidad con el front
    r.descripcion,
    r.id_sector AS "idSector",
    r.sector_nombre AS sector,
    r.sector_nombre AS lugar,                    -- alias de compatibilidad con el front
    r.fecha_emision AS "fechaEmision",
    u.nombre || ' ' || u.apellido AS "reportadoPor",
    rr.nombre AS "rolReportante",
    t.prioridad,
    t.estado,
    t.fecha_creacion AS "fechaCreacion",
    t.fecha_inicio AS "fechaInicio",
    t.fecha_fin AS "fechaFin",
    t.observaciones,
    t.id_directivo AS "idDirectivo",
    t.id_responsable AS "idResponsable",
    t.id_personal_externo AS "idPersonalExterno",
    t.id_tarea_origen AS "idTareaOrigen",
    c.id_compra AS "idCompra",
    c.monto::float8 AS "compraMonto",
    c.detalle AS "compraDetalle",
    c.categoria AS "compraCategoria",
    c.fuente_financiamiento AS "compraFuenteFinanciamiento",
    c.fecha AS "compraFecha",
    c.factura AS "compraFactura",
    CASE
      WHEN t.id_responsable IS NOT NULL THEN u2.nombre || ' ' || u2.apellido
      WHEN t.id_personal_externo IS NOT NULL THEN p.nombre || ' ' || p.apellido
      ELSE NULL
    END AS "responsableNombre",
    CASE
      WHEN t.id_responsable IS NOT NULL THEN 'interno'
      WHEN t.id_personal_externo IS NOT NULL THEN 'externo'
      ELSE NULL
    END AS "responsableTipo",
    COALESCE(u2.telefono, p.telefono) AS telefono
  FROM tareas t
  JOIN requerimientos r ON r.id_requerimiento = t.id_requerimiento
  JOIN usuarios u ON u.id_usuario = r.id_usuario
  JOIN roles rr ON rr.id_rol = u.id_rol
  LEFT JOIN usuarios u2 ON u2.id_usuario = t.id_responsable
  LEFT JOIN personal_externo p ON p.id_personal = t.id_personal_externo
  LEFT JOIN compras c ON c.id_tarea = t.id_tarea
`;

export async function listar({ estado, prioridad, sector, desde, hasta } = {}) {
  const condiciones = [];
  const valores = [];

  if (estado) {
    valores.push(estado);
    condiciones.push(`t.estado = $${valores.length}`);
  }
  if (prioridad) {
    valores.push(prioridad);
    condiciones.push(`t.prioridad = $${valores.length}`);
  }
  if (sector) {
    valores.push(`%${sector}%`);
    condiciones.push(`r.sector_nombre ILIKE $${valores.length}`);
  }
  if (desde) {
    valores.push(desde);
    condiciones.push(`t.fecha_creacion >= $${valores.length}::date`);
  }
  if (hasta) {
    // "hasta" es inclusivo: se incluye todo el día indicado
    valores.push(hasta);
    condiciones.push(`t.fecha_creacion < ($${valores.length}::date + 1)`);
  }

  const where = condiciones.length ? `WHERE ${condiciones.join(' AND ')}` : '';
  const { rows } = await pool.query(`${SELECT_TAREA} ${where} ORDER BY t.fecha_creacion DESC`, valores);
  return rows;
}

export async function resumen(db = pool) {
  const { rows } = await db.query(`
    SELECT
      COUNT(*)::int AS total,
      COUNT(*) FILTER (WHERE estado = 'pendiente')::int  AS pendientes,
      COUNT(*) FILTER (WHERE estado = 'en-proceso')::int AS "enProceso",
      COUNT(*) FILTER (WHERE estado = 'demorada')::int   AS demoradas,
      COUNT(*) FILTER (WHERE estado = 'finalizada')::int AS finalizadas,
      COUNT(*) FILTER (WHERE estado = 'aprobada')::int   AS aprobadas,
      COUNT(*) FILTER (WHERE estado = 'cancelada')::int  AS canceladas
    FROM tareas
  `);
  return rows[0];
}

export async function obtenerPorId(id, db = pool) {
  const { rows } = await db.query(`${SELECT_TAREA} WHERE t.id_tarea = $1`, [id]);
  return rows[0] ?? null;
}

// Igual que obtenerPorId pero bloquea la fila hasta que termine la transacción:
// evita que dos clics seguidos (o dos usuarios) cambien el estado de la misma tarea a la vez.
export async function obtenerPorIdBloqueando(id, db) {
  const { rows } = await db.query(`${SELECT_TAREA} WHERE t.id_tarea = $1 FOR UPDATE OF t`, [id]);
  return rows[0] ?? null;
}

export async function obtenerUsuarioActivo(id) {
  const { rows } = await pool.query(
    `SELECT u.id_usuario, ro.nombre AS rol
     FROM usuarios u
     JOIN roles ro ON ro.id_rol = u.id_rol
     WHERE u.id_usuario = $1 AND u.activo = TRUE`,
    [id],
  );
  return rows[0] ?? null;
}

export async function obtenerPersonalActivo(id) {
  const { rows } = await pool.query(
    'SELECT id_personal FROM personal_externo WHERE id_personal = $1 AND activo = TRUE',
    [id],
  );
  return rows[0] ?? null;
}

// Una tarea está "en curso" mientras no esté cancelada ni aprobada
// (misma definición que el índice único tareas_una_viva_por_requerimiento_idx).
export async function existeTareaEnCurso(idRequerimiento, db = pool) {
  const { rows } = await db.query(
    `SELECT 1 FROM tareas
     WHERE id_requerimiento = $1 AND estado NOT IN ('cancelada', 'aprobada')
     LIMIT 1`,
    [idRequerimiento],
  );
  return rows.length > 0;
}

// fechaInicio es opcional: la tarea que se crea ya en proceso la trae; la generada por una cancelación, no.
export async function crear(datos, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO tareas (
       id_requerimiento, prioridad, estado, observaciones, id_responsable,
       id_personal_externo, id_tarea_origen, fecha_inicio
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id_tarea`,
    [
      datos.idRequerimiento,
      datos.prioridad,
      datos.estado ?? 'pendiente',
      datos.observaciones ?? null,
      datos.idResponsable ?? null,
      datos.idPersonalExterno ?? null,
      datos.idTareaOrigen ?? null,
      datos.fechaInicio ?? null,
    ],
  );
  return rows[0].id_tarea;
}

// Las fechas de inicio y fin NO se editan a mano: las fija el sistema al cambiar de estado.
export async function actualizar(id, datos, db = pool) {
  const { rows } = await db.query(
    `UPDATE tareas
     SET prioridad = $1,
         observaciones = $2,
         id_responsable = $3,
         id_personal_externo = $4
     WHERE id_tarea = $5
     RETURNING id_tarea`,
    [datos.prioridad, datos.observaciones, datos.idResponsable, datos.idPersonalExterno, id],
  );
  return rows[0] ?? null;
}

// Escribe exactamente los valores que recibe (el service decide cuáles son).
// NO toca el historial: eso lo hace el service con historialRepository.crear.
export async function cambiarEstado(id, { estado, fechaInicio, fechaFin, idDirectivo, observaciones }, db = pool) {
  const { rows } = await db.query(
    `UPDATE tareas
     SET estado = $1,
         fecha_inicio = $2,
         fecha_fin = $3,
         id_directivo = $4,
         observaciones = $5
     WHERE id_tarea = $6
     RETURNING id_tarea`,
    [estado, fechaInicio ?? null, fechaFin ?? null, idDirectivo ?? null, observaciones ?? null, id],
  );
  return rows[0] ?? null;
}

// --- Cancelación: la tarea nueva hereda el historial y las compras de la original ---

// El historial se copia (la original conserva el suyo como auditoría).
export async function copiarHistorial(idOrigen, idDestino, db = pool) {
  await db.query(
    `INSERT INTO historial (id_tarea, estado, motivo, id_usuario, fecha_hora)
     SELECT $2, estado, motivo, id_usuario, fecha_hora
     FROM historial
     WHERE id_tarea = $1
     ORDER BY id_historial`,
    [idOrigen, idDestino],
  );
}

// Las compras se MUEVEN (no se copian): así el gasto en materiales no se cuenta dos veces en las estadísticas.
export async function moverCompras(idOrigen, idDestino, db = pool) {
  await db.query('UPDATE compras SET id_tarea = $2 WHERE id_tarea = $1', [idOrigen, idDestino]);
}