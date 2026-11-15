import { pool } from '../../config/db.js';

// Huso horario del colegio (el servidor suele estar en UTC)
const ZONA = 'America/Argentina/Buenos_Aires';

// Las columnas tienen largo máximo: se recorta para que una notificación
// larga nunca haga fallar la operación que la dispara (ej. emitir un requerimiento).
const recortar = (texto, max) => String(texto ?? '').slice(0, max);

/**
 * Crea UNA notificación por cada usuario ACTIVO del rol indicado.
 * Recibe `db` para usarse dentro de una transacción (withTransaction).
 * datos.excluirIdUsuario: opcional, para no avisarle a quien disparó la acción
 * (ej. el Jefe que emite su propio requerimiento).
 */
export async function crearParaRol(rol, datos, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO notificaciones (
       id_usuario, id_requerimiento, id_tarea, tipo, titulo, mensaje
     )
     SELECT u.id_usuario, $1, $2, $3, $4, $5
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
      WHERE r.nombre = $6
        AND u.activo = TRUE
        AND ($7::int IS NULL OR u.id_usuario <> $7::int)
     RETURNING id_notificacion`,
    [
      datos.idRequerimiento ?? null,
      datos.idTarea ?? null,
      datos.tipo,
      recortar(datos.titulo, 100),
      recortar(datos.mensaje, 200),
      rol,
      datos.excluirIdUsuario ?? null,
    ],
  );

  return rows;
}

export async function crearParaUsuario(idUsuario, datos, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO notificaciones (
       id_usuario, id_requerimiento, id_tarea, tipo, titulo, mensaje
     )
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_notificacion`,
    [
      idUsuario,
      datos.idRequerimiento ?? null,
      datos.idTarea ?? null,
      datos.tipo,
      recortar(datos.titulo, 100),
      recortar(datos.mensaje, 200),
    ],
  );

  return rows[0];
}

export async function listarPorUsuario(idUsuario, { leida } = {}) {
  const valores = [idUsuario, ZONA];
  let filtro = '';

  if (leida !== undefined) {
    valores.push(leida);
    filtro = `AND n.leida = $${valores.length}`;
  }

  const { rows } = await pool.query(
    `SELECT
       n.id_notificacion AS id,
       n.tipo,
       n.titulo,
       n.mensaje,
       n.mensaje AS texto,
       n.leida,
       n.id_requerimiento AS "idRequerimiento",
       n.id_tarea AS "idTarea",
       n.created_at AS fecha,
       to_char(n.created_at AT TIME ZONE $2::text, 'HH24:MI') AS hora
     FROM notificaciones n
     WHERE n.id_usuario = $1
     ${filtro}
     ORDER BY n.created_at DESC
     LIMIT 200`,
    valores,
  );

  return rows;
}

export async function marcarLeida(id, idUsuario) {
  const { rows } = await pool.query(
    `UPDATE notificaciones
        SET leida = TRUE
      WHERE id_notificacion = $1
        AND id_usuario = $2
      RETURNING
        id_notificacion AS id,
        tipo,
        titulo,
        mensaje,
        mensaje AS texto,
        leida,
        id_requerimiento AS "idRequerimiento",
        id_tarea AS "idTarea",
        created_at AS fecha,
        to_char(created_at AT TIME ZONE $3::text, 'HH24:MI') AS hora`,
    [id, idUsuario, ZONA],
  );

  return rows[0] ?? null;
}