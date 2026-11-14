import * as service from './auth.service.js';

export async function login(req, res) {
  const resultado = await service.login(req.body);
  res.json(resultado);
}

export async function perfil(req, res) {
  const usuario = await service.perfil(req.usuario.id);
  res.json(usuario);
}