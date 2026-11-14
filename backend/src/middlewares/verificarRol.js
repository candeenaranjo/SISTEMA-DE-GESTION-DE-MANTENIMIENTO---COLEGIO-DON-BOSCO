
//Permite el acceso solo a los roles indicados.
//Uso: verificarRol(ROLES.JEFE, ROLES.DIRECTIVO)
export const verificarRol = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario) {
    return res.status(401).json({ error: 'No autenticado' });
  }

  if (!rolesPermitidos.includes(req.usuario.rol)) {
    return res
      .status(403)
      .json({ error: 'No tenés permisos para acceder a esta sección' });
  }

  next();
};

// Permite el acceso a los roles indicados o al propio usuario (:id de la ruta).
// Uso: verificarRolOPropio(ROLES.DIRECTIVO)   // GET/PUT /usuarios/:id
//Va después de validarId(), así req.params.id es un entero válido.

export const verificarRolOPropio =
  (...rolesPermitidos) =>
  (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const esPropio = req.usuario.id === Number(req.params.id);

    if (!esPropio && !rolesPermitidos.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ error: 'No tenés permisos para acceder a este recurso' });
    }

    next();
  };