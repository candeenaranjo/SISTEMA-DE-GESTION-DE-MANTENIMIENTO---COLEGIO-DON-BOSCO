import { ApiError } from '../../utils/ApiError.js';
import * as repository from './compras.repository.js';
import * as tareasRepository from '../tareas/tareas.repository.js';

const CATEGORIAS = ['materiales', 'servicios', 'otros'];
const FUENTE_POR_DEFECTO = 'colegio';

// Una tarea cancelada (sus compras pasaron a la tarea nueva) o aprobada ya no se modifica
async function tareaEditable(idTarea) {
  const tarea = await tareasRepository.obtenerPorId(idTarea);
  if (!tarea) throw new ApiError(404, 'Tarea no encontrada');
  if (['cancelada', 'aprobada'].includes(tarea.estado)) {
    throw new ApiError(409, `La tarea está ${tarea.estado}: no se pueden registrar ni modificar sus compras`);
  }
  return tarea;
}

function texto(valor, nombre, max) {
  const limpio = String(valor).trim();
  if (limpio.length > max) throw new ApiError(400, `${nombre} no puede superar los ${max} caracteres`);
  return limpio;
}

// Valida lo que llegue y completa el resto con la compra actual (al editar) o con valores por defecto (al crear)
function armarCampos(datos, base = {}) {
  const monto = datos.monto !== undefined ? Number(datos.monto) : base.monto;
  if (!Number.isFinite(monto) || monto <= 0) throw new ApiError(400, 'El monto debe ser mayor a cero');

  const detalle = datos.detalle !== undefined ? String(datos.detalle).trim() : base.detalle;
  if (!detalle) throw new ApiError(400, 'El detalle de la compra es obligatorio');
  if (detalle.length > 255) throw new ApiError(400, 'El detalle no puede superar los 255 caracteres');

  const categoria = datos.categoria ?? base.categoria ?? 'materiales';
  if (!CATEGORIAS.includes(categoria)) {
    throw new ApiError(400, 'La categoría debe ser materiales, servicios u otros');
  }

  const fuenteFinanciamiento = datos.fuenteFinanciamiento
    ? texto(datos.fuenteFinanciamiento, 'La fuente de financiamiento', 50)
    : (base.fuenteFinanciamiento ?? FUENTE_POR_DEFECTO);

  const fecha = datos.fecha || null; // null = ahora (al crear) o conservar la actual (al editar)
  if (fecha && Number.isNaN(Date.parse(fecha))) throw new ApiError(400, 'La fecha de la compra no es válida');

  let factura = base.factura ?? null;
  if (datos.factura !== undefined) factura = datos.factura ? texto(datos.factura, 'La factura', 500) : null;

  return { monto, detalle, categoria, fuenteFinanciamiento, fecha, factura };
}

// POST /tareas/:id/compras (Jefe)
export async function crear(idTarea, datos) {
  await tareaEditable(idTarea);

  if (await repository.obtenerPorTarea(idTarea)) {
    throw new ApiError(409, 'La tarea ya tiene una compra registrada: editala en lugar de crear otra');
  }

  try {
    return await repository.crear(idTarea, armarCampos(datos));
  } catch (err) {
    // Dos pedidos a la vez para la misma tarea (restricción UNIQUE(id_tarea))
    if (err.code === '23505') throw new ApiError(409, 'La tarea ya tiene una compra registrada');
    throw err;
  }
}

// PUT /compras/:id (Jefe)
export async function actualizar(id, datos) {
  const actual = await repository.obtenerPorId(id);
  if (!actual) throw new ApiError(404, 'Compra no encontrada');

  await tareaEditable(actual.idTarea);

  return repository.actualizar(id, armarCampos(datos, actual));
}