import { Router } from 'express';
import * as controller from '../requerimientos/requerimientos.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { verificarToken } from '../../middlewares/verificarToken.js';

// GET /categorias y GET /sectores: listas para los desplegables (todos los roles autenticados)
export const categoriasRouter = Router();
categoriasRouter.use(verificarToken);
categoriasRouter.get('/', asyncHandler(controller.listarCategorias));

export const sectoresRouter = Router();
sectoresRouter.use(verificarToken);
sectoresRouter.get('/', asyncHandler(controller.listarSectores));