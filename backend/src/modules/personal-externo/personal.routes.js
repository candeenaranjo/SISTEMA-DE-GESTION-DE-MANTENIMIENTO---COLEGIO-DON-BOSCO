import { Router } from 'express';
import * as controller from './personal.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';
import { validar } from '../../middlewares/validar.js';

const router = Router();

router.use(verificarToken);
router.use(verificarRol('jefeMantenimiento'));

// Si la ruta lleva :id, tiene que ser un entero (evita que Postgres tire un 500 por un id inválido)
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return next(new ApiError(400, 'El id indicado no es válido'));
  next();
});

router.get('/', asyncHandler(controller.listar));
router.get('/:id', asyncHandler(controller.obtener));

// DNI, correo y género son opcionales: un valor vacío significa "sin dato". El formato de DNI y correo
// se valida en el service, que acepta el texto vacío (el middleware validar no).
router.post(
  '/',
  validar({
    nombre: { requerido: true, tipo: 'string', min: 2, max: 100 },
    apellido: { requerido: true, tipo: 'string', min: 2, max: 100 },
    telefono: { requerido: true, tipo: 'string', min: 5, max: 25 },
    especialidad: { requerido: true, tipo: 'string', min: 3, max: 80 },
    activo: { tipo: 'boolean' },
  }),
  asyncHandler(controller.crear),
);

router.put(
  '/:id',
  validar({
    nombre: { tipo: 'string', min: 2, max: 100 },
    apellido: { tipo: 'string', min: 2, max: 100 },
    telefono: { tipo: 'string', min: 5, max: 25 },
    especialidad: { tipo: 'string', min: 3, max: 80 },
    activo: { tipo: 'boolean' },
  }),
  asyncHandler(controller.actualizar),
);

// Baja lógica
router.delete('/:id', asyncHandler(controller.eliminar));

export default router;