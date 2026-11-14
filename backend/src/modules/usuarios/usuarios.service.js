import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/ApiError.js';
import { ROLES } from '../../constants/roles.js';
import { mapearUsuario } from './usuarios.mapper.js';
import * as repository from './usuarios.repository.js';

const SALT_ROUNDS = 10;
const LISTA_ROLES = Object.values(ROLES);
const NOMBRE_USUARIO_REGEX = /^[a-z0-9._-]{3,50}$/;

function derivarNombreUsuario(email) {
  return String(email).split('@')[0].toLowerCase().replace(/[^a-z0-9._-]/g, '');
}

// Devuelve el texto recortado o null si viene vacío/ausente
function textoONull(valor) {
  if (valor === undefined || valor === null) return null;
  return String(valor).trim() || null;
}

// El DNI es obligatorio para los tres roles
function normalizarDni(dni) {
  const limpio = String(dni ?? '').replace(/\D/g, '');
  if (limpio.length < 7 || limpio.length > 10) {
    throw new ApiError(400, 'El DNI es obligatorio y debe tener entre 7 y 10 dígitos');
  }
  return limpio;
}

function validarNombreUsuario(nombreUsuario) {
  if (!NOMBRE_USUARIO_REGEX.test(nombreUsuario)) {
    throw new ApiError(
      400,
      'El nombre de usuario debe tener entre 3 y 50 caracteres (letras, números, . _ -)',
    );
  }
}

async function buscarUsuario(id) {
  const usuario = await repository.obtenerPorId(id);
  if (!usuario) {
    throw new ApiError(404, 'Usuario no encontrado');
  }
  return usuario;
}

// Traduce rol y cargo (nombres) a ids. El cargo solo aplica al Directivo.
async function resolverRolYCargo(rol, cargo) {
  if (!LISTA_ROLES.includes(rol)) {
    throw new ApiError(400, `El rol debe ser uno de: ${LISTA_ROLES.join(', ')}`);
  }

  const filaRol = await repository.obtenerIdRol(rol);
  if (!filaRol) {
    throw new ApiError(400, 'El rol indicado no existe');
  }

  if (rol !== ROLES.DIRECTIVO) {
    return { idRol: filaRol.id_rol, idCargo: null };
  }

  if (!cargo) {
    throw new ApiError(400, 'El cargo es obligatorio para un Directivo');
  }

  const filaCargo = await repository.obtenerIdCargo(cargo);
  if (!filaCargo) {
    throw new ApiError(400, 'El cargo indicado no existe');
  }

  return { idRol: filaRol.id_rol, idCargo: filaCargo.id_cargo };
}

// El teléfono es obligatorio para el personal de Ordenanza
function validarTelefono(rol, telefono) {
  if (rol === ROLES.ORDENANZA && !telefono) {
    throw new ApiError(400, 'El teléfono es obligatorio para el personal de Ordenanza');
  }
}

// Nunca puede quedar el sistema sin un Directivo activo
async function protegerUltimoDirectivo(usuario, rolNuevo, activoNuevo) {
  const dejaDeSerDirectivoActivo =
    usuario.rol === ROLES.DIRECTIVO &&
    usuario.activo &&
    (rolNuevo !== ROLES.DIRECTIVO || !activoNuevo);

  if (!dejaDeSerDirectivoActivo) return;

  const otros = await repository.contarDirectivosActivos(usuario.id_usuario);
  if (otros === 0) {
    throw new ApiError(
      409,
      'No podés dejar al sistema sin un Directivo activo',
    );
  }
}

export async function listar(filtros) {
  const usuarios = await repository.listar(filtros);
  return usuarios.map(mapearUsuario);
}

export function listarCargos() {
  return repository.listarCargos();
}

// El permiso (Directivo o propio usuario) ya lo controla verificarRolOPropio
export async function obtener(id) {
  return mapearUsuario(await buscarUsuario(id));
}

export async function crear(datos) {
  const nombre = String(datos.nombre ?? '').trim();
  const apellido = String(datos.apellido ?? '').trim();
  const email = String(datos.email ?? '').trim().toLowerCase();
  const nombreUsuario = String(
    datos.nombreUsuario ?? datos.usuario ?? derivarNombreUsuario(email),
  )
    .trim()
    .toLowerCase();
  const telefono = textoONull(datos.telefono);
  const dni = normalizarDni(datos.dni);
  const password = String(datos.password ?? '');

  if (!nombre || !apellido) {
    throw new ApiError(400, 'Nombre y apellido son obligatorios');
  }

  validarNombreUsuario(nombreUsuario);

  if (password.length < 6) {
    throw new ApiError(400, 'La contraseña debe tener al menos 6 caracteres');
  }

  validarTelefono(datos.rol, telefono);
  const { idRol, idCargo } = await resolverRolYCargo(datos.rol, datos.cargo);

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const id = await repository.crear({
    nombreUsuario,
    nombre,
    apellido,
    dni,
    email,
    passwordHash,
    idRol,
    telefono,
    idCargo,
    avatar: datos.avatar ?? null,
  });

  return mapearUsuario(await buscarUsuario(id));
}

export async function actualizar(id, datos, actor) {
  const usuario = await buscarUsuario(id);
  const esDirectivo = actor.rol === ROLES.DIRECTIVO;
  const esPropio = actor.id === id;

  // Quien no es Directivo solo edita su perfil (datos de contacto y contraseña)
  if (!esDirectivo) {
    const camposProhibidos = [
      'rol', 'idRol', 'activo', 'cargo', 'idCargo',
      'nombreUsuario', 'usuario', 'email', 'dni',
    ];

    if (camposProhibidos.some((campo) => datos[campo] !== undefined)) {
      throw new ApiError(
        403,
        'Solo un Directivo puede modificar el rol, estado o datos de la cuenta',
      );
    }
  }

  const nombre = String(datos.nombre ?? usuario.nombre).trim();
  const apellido = String(datos.apellido ?? usuario.apellido).trim();
  const telefono =
    datos.telefono !== undefined ? textoONull(datos.telefono) : usuario.telefono;
  const avatar = datos.avatar !== undefined ? datos.avatar : usuario.avatar;

  let nombreUsuario = usuario.nombre_usuario;
  let email = usuario.email;
  let dni = usuario.dni;
  let rol = usuario.rol;
  let cargo = usuario.cargo;
  let activo = usuario.activo;
  let passwordHash = usuario.password_hash;

  if (esDirectivo) {
    nombreUsuario = String(
      datos.nombreUsuario ?? datos.usuario ?? usuario.nombre_usuario,
    )
      .trim()
      .toLowerCase();
    email = String(datos.email ?? usuario.email).trim().toLowerCase();
    dni = datos.dni !== undefined ? normalizarDni(datos.dni) : usuario.dni;
    rol = datos.rol ?? usuario.rol;
    cargo = datos.cargo ?? usuario.cargo;
    activo = datos.activo ?? usuario.activo;
  }

  // Contraseña: quien cambia la suya debe confirmar la actual;
  // un Directivo puede restablecer la de otro sin conocerla
  if (datos.password !== undefined && datos.password !== null) {
    if (esPropio) {
      const ok =
        datos.passwordActual &&
        (await bcrypt.compare(String(datos.passwordActual), usuario.password_hash));
      if (!ok) {
        throw new ApiError(400, 'La contraseña actual es incorrecta');
      }
    }
    const password = String(datos.password);
    if (password.length < 6) {
      throw new ApiError(400, 'La contraseña debe tener al menos 6 caracteres');
    }
    passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  }

  if (!nombre || !apellido) {
    throw new ApiError(400, 'Nombre y apellido son obligatorios');
  }

  validarNombreUsuario(nombreUsuario);

  // Un Directivo no puede cambiarse el rol ni darse de baja a sí mismo, ni dejar al sistema sin Directivos activos
  if (esPropio && (rol !== usuario.rol || activo === false)) {
    throw new ApiError(400, 'No podés cambiar tu propio rol ni darte de baja');
  }
  await protegerUltimoDirectivo(usuario, rol, activo);

  validarTelefono(rol, telefono);
  const { idRol, idCargo } = await resolverRolYCargo(rol, cargo);

  await repository.actualizar(id, {
    nombreUsuario,
    nombre,
    apellido,
    dni,
    email,
    passwordHash,
    idRol,
    telefono,
    idCargo,
    avatar,
    activo,
  });

  return mapearUsuario(await buscarUsuario(id));
}

export async function eliminar(id, actor) {
  const usuario = await buscarUsuario(id);

  if (actor.id === id) {
    throw new ApiError(400, 'No podés dar de baja tu propia cuenta');
  }

  if (!usuario.activo) {
    throw new ApiError(404, 'El usuario ya está dado de baja');
  }

  await protegerUltimoDirectivo(usuario, usuario.rol, false);
  await repository.desactivar(id);
}