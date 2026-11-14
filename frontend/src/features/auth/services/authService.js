import { redirect } from 'react-router';
import { apiRequest } from '../../../shared/api/apiClient';

const CLAVE_SESION = 'sesion';

function leerSesion() {
  try {
    const datos = sessionStorage.getItem(CLAVE_SESION);
    return datos ? JSON.parse(datos) : null;
  } catch {
    return null;
  }
}

// Guarda en sessionStorage: el token queda en el cliente
function guardarSesion(sesion) {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(sesion));
}

// Pide el login al backend y guarda la sesión. Si hay error lanza una ApiError.
export async function iniciarSesion(usuarioOEmail, password) {
  const identificador = String(usuarioOEmail ?? '').trim();

  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: { usuario: identificador, password },
  });

  guardarSesion({ token: data.token, usuario: data.usuario });
  return data.usuario;
}

// No hay registro público: las cuentas las crea un Directivo desde Gestión de Usuarios.

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}

export function obtenerSesion() {
  return leerSesion()?.usuario ?? null;
}

export function obtenerToken() {
  return leerSesion()?.token ?? null;
}

export function actualizarSesion(datosActualizados) {
  const sesion = leerSesion();

  if (!sesion) return null;

  const actualizada = {
    ...sesion,
    usuario: { ...sesion.usuario, ...datosActualizados },
  };

  guardarSesion(actualizada);
  return actualizada.usuario;
}

export function protegerRuta() {
  const sesion = leerSesion();

  if (!sesion?.token || !sesion?.usuario) {
    throw redirect('/login');
  }

  return sesion.usuario;
}

/**
 * Loader del área privada: además de exigir sesión, refresca los datos del
 * usuario desde el backend (GET /auth/perfil). Así un cambio de nombre o rol
 * hecho por un Directivo se ve sin volver a loguearse, y un token vencido o una
 * cuenta dada de baja se detectan al entrar y no en la primera acción.
 * Si el backend no responde (error de red), usa los datos guardados.
 */
export async function cargarSesion() {
  const guardado = protegerRuta();

  try {
    const usuario = await apiRequest('/auth/perfil');
    return actualizarSesion(usuario);
  } catch (error) {
    if (error.status === 401) throw redirect('/login');
    return guardado;
  }
}

export function requerirRol(rolesPermitidos) {
  return function loader() {
    const usuario = protegerRuta();

    if (!rolesPermitidos.includes(usuario.rol)) {
      throw new Response('No tenés permisos para acceder a esta sección.', {
        status: 403,
      });
    }

    return usuario;
  };
}