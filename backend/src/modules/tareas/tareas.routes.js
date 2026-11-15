import { Router } from 'express';
import * as controller from './tareas.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';
import { validar } from '../../middlewares/validar.js';

const router = Router();

router.use(verificarToken);
router.use(verificarRol('jefeMantenimiento', 'directivo'));

// Si la ruta lleva :id, tiene que ser un entero (evita que Postgres tire un 500 por un id inválido)
router.param('id', (req, res, next, id) => {
  if (!/^\d+$/.test(id)) return next(new ApiError(400, 'El id indicado no es válido'));
  next();
});

router.get('/', asyncHandler(controller.listar));

// Resumen para el panel del Jefe. Va ANTES de '/:id' para que "resumen" no se tome como un id.
router.get('/resumen', verificarRol('jefeMantenimiento'), asyncHandler(controller.resumen));

router.get('/:id', asyncHandler(controller.obtener));

// Crear una tarea a partir de un requerimiento (Jefe). Nace "en proceso".
// El responsable (idResponsable o idPersonalExterno) se valida en el service.
router.post(
  '/',
  verificarRol('jefeMantenimiento'),
  validar({
    idRequerimiento: { requerido: true, tipo: 'numero', entero: true, minNumero: 1 },
    prioridad: { requerido: true, tipo: 'string', enum: ['baja', 'media', 'alta'] },
    observaciones: { tipo: 'string', max: 2000 },
  }),
  asyncHandler(controller.crear),
);

// Modificar datos de la tarea: prioridad, observaciones y responsable (Jefe).
// Las fechas de inicio y fin no se editan: las registra el sistema.
router.put(
  '/:id',
  verificarRol('jefeMantenimiento'),
  validar({
    prioridad: { tipo: 'string', enum: ['baja', 'media', 'alta'] },
    observaciones: { tipo: 'string', max: 2000 },
  }),
  asyncHandler(controller.actualizar),
);

// Cambiar el estado: iniciar (en-proceso), demorar, retomar (en-proceso) o finalizar (Jefe)
router.put(
  '/:id/estado',
  verificarRol('jefeMantenimiento'),
  validar({
    estado: { requerido: true, tipo: 'string', enum: ['en-proceso', 'demorada', 'finalizada'] },
    motivo: { tipo: 'string', max: 500 },
    observaciones: { tipo: 'string', max: 2000 },
  }),
  asyncHandler(controller.cambiarEstado),
);

// Cancelar (Jefe): motivo obligatorio; genera automáticamente una tarea nueva pendiente
router.put(
  '/:id/cancelacion',
  verificarRol('jefeMantenimiento'),
  validar({
    motivo: { requerido: true, tipo: 'string', min: 3, max: 500 },
  }),
  asyncHandler(controller.cancelar),
);

// Aprobar o rechazar una tarea finalizada (Directivo)
router.put(
  '/:id/evaluacion',
  verificarRol('directivo'),
  validar({
    estado: { requerido: true, tipo: 'string', enum: ['aprobada', 'rechazada'] },
    motivo: { tipo: 'string', max: 500 },
  }),
  asyncHandler(controller.evaluar),
);

export default router;