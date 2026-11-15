import { Router } from 'express';
import * as controller from './compras.controller.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { ApiError } from '../../utils/ApiError.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';
import { validar } from '../../middlewares/validar.js';

const idValido = (valor) => /^\d+$/.test(String(valor));
const idInvalido = () => new ApiError(400, 'El id indicado no es válido');

// factura y fuenteFinanciamiento pueden llegar como null desde el front: se validan en el service.
const CAMPOS_COMPRA = {
  monto: { tipo: 'numero', minNumero: 0.01 },
  detalle: { tipo: 'string', min: 3, max: 255 },
  categoria: { tipo: 'string', enum: ['materiales', 'servicios', 'otros'] },
};

// Se monta en /tareas/:id/compras  →  POST /tareas/:id/compras
export const comprasDeTareaRouter = Router({ mergeParams: true });
comprasDeTareaRouter.use(verificarToken);
// router.param no ve el :id del montaje, así que se valida acá
comprasDeTareaRouter.use((req, res, next) => (idValido(req.params.id) ? next() : next(idInvalido())));
comprasDeTareaRouter.post(
  '/',
  verificarRol('jefeMantenimiento'),
  validar({
    monto: { ...CAMPOS_COMPRA.monto, requerido: true },
    detalle: { ...CAMPOS_COMPRA.detalle, requerido: true },
    categoria: CAMPOS_COMPRA.categoria,
  }),
  asyncHandler(controller.crear),
);

// Se monta en /compras  →  PUT /compras/:id
export const comprasRouter = Router();
comprasRouter.use(verificarToken);
comprasRouter.param('id', (req, res, next, id) => (idValido(id) ? next() : next(idInvalido())));
comprasRouter.put(
  '/:id',
  verificarRol('jefeMantenimiento'),
  validar(CAMPOS_COMPRA),
  asyncHandler(controller.actualizar),
);