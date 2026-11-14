import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';
import { mapearUsuario } from '../usuarios/usuarios.mapper.js';
import * as usuariosRepository from '../usuarios/usuarios.repository.js';
import * as repository from './auth.repository.js';

//Valida credenciales y devuelve el token JWT con los datos del usuario
export async function login(datos) {
  const identificador = String(
    datos.nombreUsuario ?? datos.email ?? datos.usuario ?? '',
  ).trim();
  const password = String(datos.password ?? '');

  if (!identificador || !password) {
    throw new ApiError(400, 'Usuario/email y contraseña son obligatorios');
  }

  const usuario = await repository.buscarPorCredencial(identificador);
  const passwordOk =
    usuario && (await bcrypt.compare(password, usuario.password_hash));

  if (!passwordOk) {
    throw new ApiError(401, 'Credenciales inválidas');
  }

  if (!usuario.activo) {
    throw new ApiError(403, 'Esta cuenta está dada de baja');
  }

  //El rol del token solo informativo
  const token = jwt.sign(
    {
      sub: usuario.id_usuario,
      rol: usuario.rol,
      nombreUsuario: usuario.nombre_usuario,
    },
    env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: env.JWT_EXPIRES_IN },
  );

  return { token, usuario: mapearUsuario(usuario) };
}

export async function perfil(id) {
  const usuario = await usuariosRepository.obtenerPorId(id);

  if (!usuario) {
    throw new ApiError(404, 'Usuario no encontrado');
  }

  return mapearUsuario(usuario);
}