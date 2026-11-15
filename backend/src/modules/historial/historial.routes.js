import { Router } from 'express';
import * as controller from './historial.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';

const router = Router({ mergeParams: true });

// GET /tareas/:id/historial (Jefe y Directivo)
router.get(
  '/',
  verificarToken,
  verificarRol('jefeMantenimiento', 'directivo', 'ordenanza'),
  // router.param no ve el :id del montaje, así que se valida acá (evita un 500 de Postgres)
  (req, res, next) =>
    /^\d+$/.test(req.params.id) ? next() : next(new ApiError(400, 'El id indicado no es válido')),
  asyncHandler(controller.listar),
);

export default router;