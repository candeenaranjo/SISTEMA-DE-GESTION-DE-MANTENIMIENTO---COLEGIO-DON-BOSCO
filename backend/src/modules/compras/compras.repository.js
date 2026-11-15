import { pool } from '../../config/db.js';

// Mismos nombres que usa el mapper de tareas para la compra embebida en GET /tareas/:id
const CAMPOS = `
  id_compra AS id,
  id_tarea AS "idTarea",
  monto::float8 AS monto,
  detalle,
  detalle AS "detalleCompra",
  categoria,
  fuente_financiamiento AS "fuenteFinanciamiento",
  fecha,
  fecha AS "fechaCompra",
  factura`;

export async function obtenerPorId(id, db = pool) {
  const { rows } = await db.query(`SELECT ${CAMPOS} FROM compras WHERE id_compra = $1`, [id]);
  return rows[0] ?? null;
}

// Una tarea tiene 0 o 1 compra
export async function obtenerPorTarea(idTarea, db = pool) {
  const { rows } = await db.query(`SELECT ${CAMPOS} FROM compras WHERE id_tarea = $1`, [idTarea]);
  return rows[0] ?? null;
}

export async function crear(idTarea, datos, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO compras (id_tarea, monto, detalle, categoria, fuente_financiamiento, fecha, factura)
     VALUES ($1, $2, $3, $4, $5, COALESCE($6::timestamptz, now()), $7)
     RETURNING ${CAMPOS}`,
    [idTarea, datos.monto, datos.detalle, datos.categoria, datos.fuenteFinanciamiento, datos.fecha, datos.factura],
  );
  return rows[0];
}

// Si no se indica fecha, se conserva la que ya tenía
export async function actualizar(id, datos, db = pool) {
  const { rows } = await db.query(
    `UPDATE compras
     SET monto = $1,
         detalle = $2,
         categoria = $3,
         fuente_financiamiento = $4,
         fecha = COALESCE($5::timestamptz, fecha),
         factura = $6
     WHERE id_compra = $7
     RETURNING ${CAMPOS}`,
    [datos.monto, datos.detalle, datos.categoria, datos.fuenteFinanciamiento, datos.fecha, datos.factura, id],
  );
  return rows[0] ?? null;
}