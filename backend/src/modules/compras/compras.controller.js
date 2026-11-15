import * as service from './compras.service.js';

// POST /tareas/:id/compras
export async function crear(req, res) {
  const compra = await service.crear(req.params.id, req.body);
  res.status(201).json(compra);
}

// PUT /compras/:id
export async function actualizar(req, res) {
  const compra = await service.actualizar(req.params.id, req.body);
  res.json(compra);
}