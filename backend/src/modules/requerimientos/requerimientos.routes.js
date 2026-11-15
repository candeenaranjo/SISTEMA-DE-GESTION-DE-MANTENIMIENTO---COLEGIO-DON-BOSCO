import { Router } from 'express';
import * as controller from './requerimientos.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';
import { validar } from '../../middlewares/validar.js';

const router = Router();

// Solo usuarios autenticados pueden acceder a estas rutas
router.use(verificarToken);

// Si la ruta lleva :id, tiene que ser un entero (evita que Postgres tire un 500 por un id inválido)
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return next(new ApiError(400, 'El id indicado no es válido'));
  next();
});

// ALIAS TEMPORAL: las listas oficiales son GET /categorias y GET /sectores (módulo catalogos).
// Borrar estas dos líneas cuando el front deje de llamar a /requerimientos/categorias y /requerimientos/sectores.
// Van ANTES de '/:id' para que Express no tome "categorias" o "sectores" como un id.
router.get('/categorias', asyncHandler(controller.listarCategorias));
router.get('/sectores', asyncHandler(controller.listarSectores));

router.get('/', asyncHandler(controller.listar));

// El detalle de un requerimiento es solo del Jefe (según la tabla de endpoints)
router.get('/:id', verificarRol('jefeMantenimiento'), asyncHandler(controller.obtener));

// Cualquier rol puede emitir un requerimiento.
// La imagen (opcional, base64) se valida en el service: así acepta null sin problemas.
router.post(
  '/',
  validar({
    idCategoria: { requerido: true, tipo: 'numero', entero: true, minNumero: 1 },
    idSector: { requerido: true, tipo: 'numero', entero: true, minNumero: 1 },
    descripcion: { requerido: true, tipo: 'string', min: 5, max: 2000 },
  }),
  asyncHandler(controller.crear),
);

// Solo el Jefe de Mantenimiento puede eliminar (baja lógica)
router.delete('/:id', verificarRol('jefeMantenimiento'), asyncHandler(controller.eliminar));

export default router;