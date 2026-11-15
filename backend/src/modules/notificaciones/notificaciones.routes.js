import { Router } from 'express';
import * as controller from './notificaciones.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';

const router = Router();

router.use(verificarToken);
router.use(verificarRol('jefeMantenimiento', 'directivo'));

// Si la ruta lleva :id, tiene que ser un entero (evita que Postgres tire un 500 por un id inválido)
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return next(new ApiError(400, 'El id indicado no es válido'));
  next();
});

router.get('/', asyncHandler(controller.listar));
router.put('/:id', asyncHandler(controller.marcarLeida));

export default router;