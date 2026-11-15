import { Router } from 'express';
import * as controller from './estadisticas.controller.js';
import { ROLES } from '../../constants/roles.js';
import { verificarToken } from '../../middlewares/verificarToken.js';
import { verificarRol } from '../../middlewares/verificarRol.js';

const router = Router();

// Cards del panel de inicio: Jefe y Directivo (cada uno recibe sus indicadores)
router.get(
  '/resumen',
  verificarToken,
  verificarRol(ROLES.JEFE, ROLES.DIRECTIVO),
  controller.resumen,
);

// El panel de estadísticas completo es exclusivo de los Directivos
router.get('/', verificarToken, verificarRol(ROLES.DIRECTIVO), controller.obtener);

export default router;