// Mensajes amigables según el nombre de la restricción UNIQUE violada.
// Los nombres "*_key" son los que genera Postgres para los UNIQUE de columna.
const MENSAJES_UNICOS = {
  usuarios_email_key: 'El correo electrónico ya está registrado',
  usuarios_email_lower_idx: 'El correo electrónico ya está registrado',
  usuarios_nombre_usuario_key: 'El nombre de usuario ya está en uso',
  usuarios_nombre_usuario_lower_idx: 'El nombre de usuario ya está en uso',
  usuarios_dni_key: 'El DNI ya está registrado',
  personal_externo_dni_key: 'El DNI ya está registrado',
  categorias_nombre_key: 'Ya existe una categoría con ese nombre',
  sectores_nombre_key: 'Ya existe un sector con ese nombre',
  cargos_nombre_key: 'Ya existe un cargo con ese nombre',
  especialidades_nombre_key: 'Ya existe una especialidad con ese nombre',
  tareas_una_viva_por_requerimiento_idx:
    'El requerimiento ya tiene una tarea activa',
};

export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Errores de JSON mal formado / demasiado grande
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'El cuerpo de la petición es demasiado grande' });
  }

  //Errores de PostgreSQL
  switch (err.code) {
    case '23505':
      return res.status(409).json({
        error: MENSAJES_UNICOS[err.constraint] ?? 'Ya existe un registro con esos datos',
      });
    case '23503':
      return res
        .status(400)
        .json({ error: 'El registro relacionado no existe o está en uso' });
    case '23502':
      return res.status(400).json({ error: 'Falta un dato obligatorio' });
    case '23514':
      return res
        .status(400)
        .json({ error: 'Los datos no cumplen una restricción de la base' });
    case '22001':
      return res.status(400).json({ error: 'Un texto supera la longitud permitida' });
    case '22003':
      return res.status(400).json({ error: 'Un número está fuera del rango permitido' });
    case '22P02':
      return res.status(400).json({ error: 'Formato de dato inválido' });
    default:
      break;
  }

  //Errores propios u otros con status
  const status = err.status ?? err.statusCode ?? 500;

  if (status >= 500) {
    console.error(err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }

  res.status(status).json({ error: err.message });
};