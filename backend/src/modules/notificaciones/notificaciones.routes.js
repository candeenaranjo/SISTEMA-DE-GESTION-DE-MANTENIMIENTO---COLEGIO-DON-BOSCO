import { Router } from 'express';
import * as controller from './notificaciones.controller.js';
import { ROLES } from '../../constants/roles.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';
import { validarId } from '../../middlewares/validar.js';

const router = Router();

router.use(verificarToken);
router.use(verificarRol(ROLES.JEFE, ROLES.DIRECTIVO));

router.get('/', controller.listar);
router.put('/:id', validarId(), controller.marcarLeida);

export default router;