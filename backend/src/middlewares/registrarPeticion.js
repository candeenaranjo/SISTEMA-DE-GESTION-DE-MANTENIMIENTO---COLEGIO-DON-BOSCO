export const registrarPeticion = (req, res, next) => {
  const inicio = Date.now();

  res.on('finish', () => {
    const ms = Date.now() - inicio;
    const quien = req.usuario ? ` [usuario ${req.usuario.id}]` : '';
    console.log(
      `${new Date().toISOString()} ${req.method} ${req.originalUrl} -> ${res.statusCode} (${ms} ms)${quien}`,
    );
  });

  next();
};