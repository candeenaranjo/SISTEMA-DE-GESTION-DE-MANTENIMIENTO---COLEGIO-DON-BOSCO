import * as service from './tareas.service.js';

export async function listar(req, res) {
  const { estado, prioridad, sector, desde, hasta } = req.query;
  const tareas = await service.listar({ estado, prioridad, sector, desde, hasta });
  res.json(tareas);
}

export async function resumen(req, res) {
  res.json(await service.resumen());
}

export async function obtener(req, res) {
  const tarea = await service.obtener(req.params.id);
  res.json(tarea);
}

export async function crear(req, res) {
  const tarea = await service.crear(req.body, req.usuario);
  res.status(201).json(tarea);
}

export async function actualizar(req, res) {
  const tarea = await service.actualizar(req.params.id, req.body, req.usuario);
  res.json(tarea);
}

export async function cambiarEstado(req, res) {
  const tarea = await service.cambiarEstado(req.params.id, req.body, req.usuario);
  res.json(tarea);
}

// Devuelve { cancelada, nueva }: la tarea cancelada y la tarea pendiente generada automáticamente
export async function cancelar(req, res) {
  const resultado = await service.cancelar(req.params.id, req.body, req.usuario);
  res.json(resultado);
}

export async function evaluar(req, res) {
  const tarea = await service.evaluar(req.params.id, req.body, req.usuario);
  res.json(tarea);
}