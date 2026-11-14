const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INT4_MAX = 2147483647;

function vacio(valor) {
  return (
    valor === undefined ||
    valor === null ||
    (typeof valor === 'string' && valor.trim() === '')
  );
}

function esNumero(valor) {
  return (
    (typeof valor === 'number' || typeof valor === 'string') &&
    Number.isFinite(Number(valor))
  );
}


// validación del body

/* Reglas por campo:
 * - requerido: boolean
 * - tipo: 'string' | 'email' | 'numero' | 'boolean' | 'array'
 * - min / max: longitud mínima/máxima
 * - minNumero / maxNumero
 * - entero: boolean
 * - enum: array de valores permitidos
 * - regex: RegExp
 * - mensaje: mensaje personalizado
 */
 // Los campos opcionales enviados vacíos ("") quedan como null en req.body, así no rompen CHECK ni UNIQUE en la base (ej. dni = '').
 //Los strings se recortan (trim), excepto "password".

export function validar(reglas) {
  return (req, res, next) => {
    const body =
      req.body && typeof req.body === 'object' && !Array.isArray(req.body)
        ? req.body
        : {};
    const errores = [];

    for (const [campo, regla] of Object.entries(reglas)) {
      let valor = body[campo];

      if (typeof valor === 'string' && campo !== 'password') {
        valor = valor.trim();
        body[campo] = valor;
      }

      if (vacio(valor)) {
        if (regla.requerido) {
          errores.push(regla.mensaje ?? `El campo "${campo}" es obligatorio`);
        } else if (valor !== undefined) {
          body[campo] = null; // "" -> null
        }
        continue;
      }

      if (regla.tipo === 'string' && typeof valor !== 'string') {
        errores.push(`El campo "${campo}" debe ser texto`);
        continue;
      }

      if (regla.tipo === 'email' && !EMAIL_REGEX.test(String(valor))) {
        errores.push(`El campo "${campo}" debe ser un correo válido`);
        continue;
      }

      if (regla.tipo === 'numero' && !esNumero(valor)) {
        errores.push(`El campo "${campo}" debe ser numérico`);
        continue;
      }

      if (regla.tipo === 'boolean' && typeof valor !== 'boolean') {
        errores.push(`El campo "${campo}" debe ser booleano`);
        continue;
      }

      if (regla.tipo === 'array' && !Array.isArray(valor)) {
        errores.push(`El campo "${campo}" debe ser una lista`);
        continue;
      }

      if (regla.entero && !(esNumero(valor) && Number.isInteger(Number(valor)))) {
        errores.push(`El campo "${campo}" debe ser un número entero`);
        continue;
      }

      if (regla.min !== undefined && String(valor).length < regla.min) {
        errores.push(
          `El campo "${campo}" debe tener al menos ${regla.min} caracteres`,
        );
        continue;
      }

      if (regla.max !== undefined && String(valor).length > regla.max) {
        errores.push(
          `El campo "${campo}" no puede superar los ${regla.max} caracteres`,
        );
        continue;
      }

      if (regla.minNumero !== undefined && Number(valor) < regla.minNumero) {
        errores.push(
          `El campo "${campo}" debe ser mayor o igual a ${regla.minNumero}`,
        );
        continue;
      }

      if (regla.maxNumero !== undefined && Number(valor) > regla.maxNumero) {
        errores.push(
          `El campo "${campo}" debe ser menor o igual a ${regla.maxNumero}`,
        );
        continue;
      }

      if (regla.enum && !regla.enum.includes(valor)) {
        errores.push(
          `El campo "${campo}" debe ser uno de: ${regla.enum.join(', ')}`,
        );
        continue;
      }

      if (regla.regex && !regla.regex.test(String(valor))) {
        errores.push(
          regla.mensaje ?? `El campo "${campo}" tiene un formato inválido`,
        );
      }
    }

    if (errores.length > 0) {
      return res.status(400).json({ error: errores[0], detalles: errores });
    }

    req.body = body;
    next();
  };
}

// Valida que los parámetros de ruta sean enteros positivos que entren en un
//INTEGER de Postgres (evita el error 22003 / 500 con ids gigantes)

export function validarId(...params) {
  const nombres = params.length > 0 ? params : ['id'];

  return (req, res, next) => {
    for (const nombre of nombres) {
      const valor = req.params[nombre];
      if (
        !/^\d+$/.test(valor ?? '') ||
        Number(valor) < 1 ||
        Number(valor) > INT4_MAX
      ) {
        return res.status(400).json({ error: `El parámetro "${nombre}" es inválido` });
      }
    }
    next();
  };
}