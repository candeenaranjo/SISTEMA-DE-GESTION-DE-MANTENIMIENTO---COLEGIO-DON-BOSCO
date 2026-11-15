import { env } from './env.js';

const origenesPermitidos = env.CORS_ORIGIN.split(',').map((o) => o.trim());

export const corsOptions = {
  origin: origenesPermitidos,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
};