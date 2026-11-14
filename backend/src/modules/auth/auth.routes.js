import { Router } from 'express';
import * as controller from './auth.controller.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { validar } from '../../middlewares/validar.js';

const router = Router();

//las cuentas las da de alta un Directivo
router.post(
  '/login',
  validar({
    nombreUsuario: { tipo: 'string', max: 100 },
    usuario: { tipo: 'string', max: 100 },
    email: { tipo: 'string', max: 100 },
    password: { requerido: true, tipo: 'string', max: 72 },
  }),
  controller.login,
);

router.get('/perfil', verificarToken, controller.perfil);

export default router;