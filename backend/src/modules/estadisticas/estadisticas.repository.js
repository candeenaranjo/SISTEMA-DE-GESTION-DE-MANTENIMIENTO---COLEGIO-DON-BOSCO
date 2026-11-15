import { pool } from '../../config/db.js';

// 1. Resumen para las tarjetas de arriba (SÍ usa fechas)
export async function obtenerResumenGeneral() {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM requerimientos WHERE activo = TRUE) AS total_requerimientos,
       (SELECT COUNT(*)::int FROM tareas WHERE estado IN ('finalizada', 'aprobada')) AS finalizadas,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'en-proceso') AS en_proceso,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'demorada') AS demoradas,
       (SELECT COUNT(*)::int FROM tareas t WHERE EXISTS (
         SELECT 1 FROM historial h WHERE h.id_tarea = t.id_tarea AND h.estado = 'rechazada'
       )) AS rechazadas,
       (SELECT COALESCE(SUM(c.monto), 0) 
          FROM compras c
          JOIN tareas t ON t.id_tarea = c.id_tarea
         WHERE t.estado != 'cancelada'
       ) AS gastos_compras`
  );
  return rows[0];
}

// 2. Sectores (Sin filtro de fecha para que muestre todo)
export async function obtenerSectores() {
  const { rows } = await pool.query(
    `SELECT s.nombre, COUNT(*)::int AS cantidad
       FROM tareas t
       JOIN requerimientos r ON r.id_requerimiento = t.id_requerimiento
       JOIN sectores s ON s.id_sector = r.id_sector
      GROUP BY s.id_sector, s.nombre
      ORDER BY cantidad DESC, s.nombre ASC
      LIMIT 10`
  );
  return rows;
}

// 3. Evolución de gastos (Agrupado por mes, sin filtro estricto)
export async function obtenerEvolucionCompras(desde, hasta, zona) {
  const { rows } = await pool.query(
    `SELECT
       EXTRACT(YEAR FROM fecha AT TIME ZONE $1::text)::int AS anio,
       EXTRACT(MONTH FROM fecha AT TIME ZONE $1::text)::int AS mes,
       COALESCE(SUM(monto), 0) AS valor
     FROM compras
     GROUP BY 1, 2
     ORDER BY 1, 2`,
    [zona],
  );
  return rows;
}

// 4. Empleados (Sin filtro de fecha)
export async function obtenerPersonal() {
  const { rows } = await pool.query(
    `SELECT
       u.nombre || ' ' || u.apellido AS nombre,
       COUNT(*)::int AS realizadas,
       COUNT(*) FILTER (WHERE t.estado IN ('finalizada', 'aprobada'))::int AS exitosas
     FROM tareas t
     JOIN usuarios u ON u.id_usuario = t.id_responsable
     WHERE t.id_responsable IS NOT NULL
     GROUP BY u.id_usuario, u.nombre, u.apellido
     ORDER BY realizadas DESC, u.apellido ASC, u.nombre ASC
     LIMIT 10`
  );
  return rows;
}

// 5. Estados (Sin filtro de fecha)
export async function obtenerEstados() {
  const { rows } = await pool.query(
    `SELECT estado, COUNT(*)::int AS valor
       FROM tareas
      GROUP BY estado`
  );
  return rows;
}

// 6. Tiempo de resolución (Sin filtro de fecha)
export async function obtenerTiempoResolucion() {
  const { rows } = await pool.query(
    `SELECT COALESCE(
              ROUND(AVG(EXTRACT(EPOCH FROM (fecha_fin - fecha_creacion)) / 86400)::numeric, 1),
              0
            ) AS dias
       FROM tareas
      WHERE estado IN ('finalizada', 'aprobada')
        AND fecha_fin IS NOT NULL`
  );
  return Number(rows[0].dias);
}

export async function obtenerResumenPanel() {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM requerimientos r
         WHERE r.activo = true 
           AND r.estado = 'pendiente'
           AND NOT EXISTS (
             SELECT 1 FROM tareas t
             WHERE t.id_requerimiento = r.id_requerimiento
               AND t.estado NOT IN ('cancelada', 'aprobada','demorada','en-proceso')
           )
       ) AS requerimientos_pendientes,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'pendiente') AS tareas_pendientes,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'en-proceso') AS en_proceso,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'demorada') AS demoradas,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'finalizada') AS pendientes_evaluacion,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'aprobada') AS aprobadas,
       (SELECT COUNT(*)::int FROM tareas
         WHERE estado IN ('finalizada', 'aprobada')) AS finalizadas,
       (SELECT COUNT(*)::int FROM tareas t
         WHERE t.estado IN ('en-proceso', 'demorada')
           AND EXISTS (
             SELECT 1 FROM historial h
              WHERE h.id_tarea = t.id_tarea AND h.estado = 'rechazada'
           )) AS rechazadas,
       (SELECT COUNT(*)::int FROM tareas t WHERE t.activo = false AND t.estado = 'cancelada') AS canceladas`,
  );

  return rows[0];
}