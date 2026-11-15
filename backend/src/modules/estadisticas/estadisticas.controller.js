import * as service from './estadisticas.service.js';

// ?hace=30 -> últimos 30 días (entre 1 y 365)
export async function obtener(req, res) {
  const hace = Number.parseInt(req.query.hace ?? '30', 10);
  const dias = Number.isInteger(hace) ? Math.min(Math.max(hace, 1), 365) : 30;

  res.json(await service.obtener(dias));
}

// Cards del panel de inicio (Jefe y Directivo)
export async function resumen(req, res) {
  res.json(await service.obtenerResumenPanel(req.usuario.rol));
}