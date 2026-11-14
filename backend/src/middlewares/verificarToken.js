import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../config/db.js';

//Valida el JWT y consulta la base en cada request, así una baja de cuenta
//o un cambio de rol tiene efecto inmediato (no recién al vencer el token).

export const verificarToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Falta el token' });
  }

  const token = authHeader.slice(7).trim();
  let payload;

  try {
    payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    const mensaje =
      error.name === 'TokenExpiredError' ? 'Token vencido' : 'Token inválido';
    return res.status(401).json({ error: mensaje });
  }

  const id = Number(payload.sub);
  if (!Number.isInteger(id)) {
    return res.status(401).json({ error: 'Token inválido' });
  }

  // Si la consulta falla, Express 5 manda el error al errorHandler
  const { rows } = await pool.query(
    `SELECT u.id_usuario, u.nombre_usuario, u.activo, r.nombre AS rol
       FROM usuarios u
       JOIN roles r USING (id_rol)
      WHERE u.id_usuario = $1`,
    [id],
  );

  const usuario = rows[0];
  if (!usuario || !usuario.activo) {
    return res.status(401).json({ error: 'Cuenta inexistente o inactiva' });
  }

  req.usuario = {
    id: usuario.id_usuario,
    rol: usuario.rol,
    nombreUsuario: usuario.nombre_usuario,
  };

  next();
};