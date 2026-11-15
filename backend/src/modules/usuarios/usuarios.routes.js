import { Router } from 'express';
import * as controller from './usuarios.controller.js';
import { ROLES } from '../../constants/roles.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol, verificarRolOPropio, } from '../../middlewares/verificarRol.js';
import { validar, validarId } from '../../middlewares/validar.js';

const router = Router();

const DNI = {
  tipo: 'string',
  regex: /^[0-9.]+$/,
  max: 12,
  mensaje: 'El DNI debe contener solo números',
};

router.use(verificarToken);


router.get('/', verificarRol(ROLES.DIRECTIVO), controller.listar);

router.get('/asignables', verificarRol(ROLES.JEFE_MANTENIMIENTO), controller.listarAsignables);
//antes de "/:id"
router.get('/cargos', verificarRol(ROLES.DIRECTIVO), controller.listarCargos);



router.get(
  '/:id',
  validarId(),
  verificarRolOPropio(ROLES.DIRECTIVO),
  controller.obtener,
);

router.post(
  '/',
  verificarRol(ROLES.DIRECTIVO),
  validar({
    nombre: { requerido: true, tipo: 'string', min: 2, max: 60 },
    apellido: { requerido: true, tipo: 'string', min: 2, max: 60 },
    email: { requerido: true, tipo: 'email', max: 100 },
    dni: { ...DNI, requerido: true },
    rol: {
      requerido: true,
      tipo: 'string',
      enum: Object.values(ROLES),
    },
    password: { requerido: true, tipo: 'string', min: 6, max: 72 },
    nombreUsuario: { tipo: 'string', min: 3, max: 50 },
    telefono: { tipo: 'string', max: 25 },
    cargo: { tipo: 'string', max: 60 },
    avatar: { tipo: 'string', max: 2000000 },
  }),
  controller.crear,
);

router.put(
  '/:id',
  validarId(),
  verificarRolOPropio(ROLES.DIRECTIVO),
  validar({
    nombre: { tipo: 'string', min: 2, max: 60 },
    apellido: { tipo: 'string', min: 2, max: 60 },
    email: { tipo: 'email', max: 100 },
    dni: DNI,
    rol: { tipo: 'string', enum: Object.values(ROLES) },
    password: { tipo: 'string', min: 6, max: 72 },
    passwordActual: { tipo: 'string', max: 72 },
    nombreUsuario: { tipo: 'string', min: 3, max: 50 },
    telefono: { tipo: 'string', max: 25 },
    cargo: { tipo: 'string', max: 60 },
    avatar: { tipo: 'string', max: 2000000 },
    activo: { tipo: 'boolean' },
  }),
  controller.actualizar,
);

router.delete(
  '/:id',
  validarId(),
  verificarRol(ROLES.DIRECTIVO),
  controller.eliminar,
);

export default router;