import { pool } from '../../config/db.js';

export async function obtenerResumen(desde, hasta, desdeAnterior) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM requerimientos
        WHERE activo = TRUE AND fecha_emision >= $1 AND fecha_emision <= $2) AS total_requerimientos,
       (SELECT COUNT(*)::int FROM requerimientos
        WHERE activo = TRUE AND fecha_emision >= $3 AND fecha_emision < $1) AS total_requerimientos_anterior,

       (SELECT COUNT(*)::int FROM tareas
        WHERE fecha_fin >= $1 AND fecha_fin <= $2
          AND estado IN ('finalizada', 'aprobada')) AS finalizadas,
       (SELECT COUNT(*)::int FROM tareas
        WHERE fecha_fin >= $3 AND fecha_fin < $1
          AND estado IN ('finalizada', 'aprobada')) AS finalizadas_anterior,

       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'en-proceso') AS en_proceso,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'demorada') AS demoradas,

       -- Rechazos: evento en historial. DISTINCT porque al cancelar se copia el historial
       -- a la tarea nueva y no debe contarse dos veces.
       (SELECT COUNT(DISTINCT (fecha_hora, id_usuario))::int FROM historial
        WHERE estado = 'rechazada'
          AND fecha_hora >= $1 AND fecha_hora <= $2) AS rechazadas,
       (SELECT COUNT(DISTINCT (fecha_hora, id_usuario))::int FROM historial
        WHERE estado = 'rechazada'
          AND fecha_hora >= $3 AND fecha_hora < $1) AS rechazadas_anterior,

       (SELECT COALESCE(SUM(monto), 0) FROM compras
        WHERE fecha >= $1 AND fecha <= $2) AS gastos_compras,
       (SELECT COALESCE(SUM(monto), 0) FROM compras
        WHERE fecha >= $3 AND fecha < $1) AS gastos_compras_anterior`,
    [desde, hasta, desdeAnterior],
  );

  return rows[0];
}

// Espacios más afectados: tareas por sector (a través del requerimiento).
// Si preferís contar una sola vez por requerimiento, cambiá COUNT(*) por
// COUNT(DISTINCT t.id_requerimiento).
export async function obtenerSectores(desde, hasta) {
  const { rows } = await pool.query(
    `SELECT s.nombre, COUNT(*)::int AS cantidad
       FROM tareas t
       JOIN requerimientos r ON r.id_requerimiento = t.id_requerimiento
       JOIN sectores s ON s.id_sector = r.id_sector
      WHERE t.fecha_creacion >= $1
        AND t.fecha_creacion <= $2
      GROUP BY s.id_sector, s.nombre
      ORDER BY cantidad DESC, s.nombre ASC
      LIMIT 10`,
    [desde, hasta],
  );

  return rows;
}

// Evolución mensual del gasto total: suma de TODOS los montos de compras,
// sin distinguir categoría. zona = huso horario para agrupar por mes.
export async function obtenerEvolucionCompras(desde, hasta, zona) {
  const { rows } = await pool.query(
    `SELECT
       EXTRACT(YEAR FROM fecha AT TIME ZONE $3::text)::int AS anio,
       EXTRACT(MONTH FROM fecha AT TIME ZONE $3::text)::int AS mes,
       COALESCE(SUM(monto), 0) AS valor
     FROM compras
     WHERE fecha >= $1 AND fecha <= $2
     GROUP BY 1, 2
     ORDER BY 1, 2`,
    [desde, hasta, zona],
  );

  return rows;
}

// Empleados con más tareas: solo personal interno (Jefe y Ordenanza).
// El JOIN con usuarios excluye automáticamente al personal externo
// (esos viven en personal_externo, no tienen id_usuario).
// Cuentan todas las tareas asignadas, incluidas las canceladas.
export async function obtenerPersonal(desde, hasta) {
  const { rows } = await pool.query(
    `SELECT
       u.nombre || ' ' || u.apellido AS nombre,
       COUNT(*)::int AS realizadas,
       COUNT(*) FILTER (WHERE t.estado IN ('finalizada', 'aprobada'))::int AS exitosas
     FROM tareas t
     JOIN usuarios u ON u.id_usuario = t.id_responsable
     WHERE t.fecha_creacion >= $1
       AND t.fecha_creacion <= $2
       AND t.id_responsable IS NOT NULL
     GROUP BY u.id_usuario, u.nombre, u.apellido
     ORDER BY realizadas DESC, u.apellido ASC, u.nombre ASC
     LIMIT 10`,
    [desde, hasta],
  );

  return rows;
}

// Solo tareas efectivamente terminadas (las canceladas no cuentan)
export async function obtenerTiempoResolucion(desde, hasta) {
  const { rows } = await pool.query(
    `SELECT COALESCE(
              ROUND(AVG(EXTRACT(EPOCH FROM (fecha_fin - fecha_creacion)) / 86400)::numeric, 1),
              0
            ) AS dias
       FROM tareas
      WHERE estado IN ('finalizada', 'aprobada')
        AND fecha_fin >= $1
        AND fecha_fin <= $2`,
    [desde, hasta],
  );

  return Number(rows[0].dias);
}

export async function obtenerEstados(desde, hasta) {
  const { rows } = await pool.query(
    `SELECT estado, COUNT(*)::int AS valor
       FROM tareas
      WHERE fecha_creacion >= $1 AND fecha_creacion <= $2
      GROUP BY estado`,
    [desde, hasta],
  );

  return rows;
}

export async function obtenerResumenPanel() {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM requerimientos
         WHERE activo = TRUE AND estado = 'pendiente') AS requerimientos_pendientes,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'pendiente') AS tareas_pendientes,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'en-proceso') AS en_proceso,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'demorada') AS demoradas,
       (SELECT COUNT(*)::int FROM tareas WHERE estado = 'finalizada') AS pendientes_evaluacion,
       (SELECT COUNT(*)::int FROM tareas
         WHERE estado IN ('finalizada', 'aprobada')) AS finalizadas,
       (SELECT COUNT(*)::int FROM tareas t
         WHERE t.estado IN ('en-proceso', 'demorada')
           AND EXISTS (
             SELECT 1 FROM historial h
              WHERE h.id_tarea = t.id_tarea AND h.estado = 'rechazada'
           )) AS rechazadas`,
  );

  return rows[0];
}