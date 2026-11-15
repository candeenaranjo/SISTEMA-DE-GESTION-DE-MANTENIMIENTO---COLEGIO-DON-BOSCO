import * as service from './personal.service.js';

// activo: "true" | "false" | "todos". Sin el parámetro, solo activos
function leerActivo(valor) {
  if (valor === undefined) return undefined;
  if (valor === 'todos') return null;
  return valor === 'true' || valor === '1';
}

export async function listar(req, res) {
  const { especialidad, activo, busqueda } = req.query;
  const personal = await service.listar({
    especialidad,
    activo: leerActivo(activo),
    busqueda,
  });

  res.json(personal);
}

export async function obtener(req, res) {
  const personal = await service.obtener(req.params.id);
  res.json(personal);
}

export async function crear(req, res) {
  const personal = await service.crear(req.body);
  res.status(201).json(personal);
}

export async function actualizar(req, res) {
  const personal = await service.actualizar(req.params.id, req.body);
  res.json(personal);
}

export async function eliminar(req, res) {
  await service.eliminar(req.params.id);
  res.status(204).end();
}