import { pool } from '../../config/db.js';

//Busca por nombre de usuario o email (sin distinguir mayúsculas)
export async function buscarPorCredencial(identificador) {
  const { rows } = await pool.query(
    `SELECT u.*, r.nombre AS rol, c.nombre AS cargo
       FROM usuarios u
       JOIN roles r ON r.id_rol = u.id_rol
       LEFT JOIN cargos c ON c.id_cargo = u.id_cargo
      WHERE LOWER(u.nombre_usuario) = LOWER($1)
         OR LOWER(u.email) = LOWER($1)
      LIMIT 1`,
    [identificador],
  );

  return rows[0] ?? null;
}