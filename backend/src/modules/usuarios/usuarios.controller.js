import * as service from './usuarios.service.js';

// activo: "true" | "false" | "todos". Sin el parámetro, solo activos
function leerActivo(valor) {
  if (valor === undefined) return undefined;
  if (valor === 'todos') return null;
  return valor === 'true' || valor === '1';
}

export async function listar(req, res) {
  const { rol, activo, busqueda } = req.query;
  const usuarios = await service.listar({
    rol,
    activo: leerActivo(activo),
    busqueda,
  });
  res.json(usuarios);
}

export async function listarCargos(req, res) {
  res.json(await service.listarCargos());
}

export async function obtener(req, res) {
  const usuario = await service.obtener(Number(req.params.id));
  res.json(usuario);
}

export async function crear(req, res) {
  const usuario = await service.crear(req.body);
  res.status(201).json(usuario);
}

export async function actualizar(req, res) {
  const usuario = await service.actualizar(
    Number(req.params.id),
    req.body,
    req.usuario,
  );
  res.json(usuario);
}

export async function eliminar(req, res) {
  await service.eliminar(Number(req.params.id), req.usuario);
  res.status(204).end();
}

export async function listarAsignables(req, res) {
  const usuarios = await service.listarAsignables();
  res.json(usuarios);
}