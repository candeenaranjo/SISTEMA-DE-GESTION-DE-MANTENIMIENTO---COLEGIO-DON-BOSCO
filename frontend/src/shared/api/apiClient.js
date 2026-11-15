const API_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

const CLAVE_SESION = 'sesion';

export class ApiError extends Error {
  constructor(message, status, detalles = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detalles = detalles;
  }
}

function leerToken() {
  try {
    return JSON.parse(sessionStorage.getItem(CLAVE_SESION))?.token ?? null;
  } catch {
    return null;
  }
}

function armarQuery(query) {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(query ?? {})) {
    if (valor !== undefined && valor !== null && valor !== '') {
      params.set(clave, String(valor));
    }
  }
  const texto = params.toString();
  return texto ? `?${texto}` : '';
}

//Hace la petición al backend. Adjunta el token de la sesión automáticamente
//Si el backend responde 401 con una sesión abierta (token vencido o cuenta dada de baja), limpia la sesión y manda al login

export async function apiRequest(
  path,
  { method = 'GET', body, query, token = leerToken(), signal } = {},
) {
  const headers = { 'ngrok-skip-browser-warning': '1' };

  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}${armarQuery(query)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;

    throw new ApiError(
      'No se pudo conectar con el servidor. Verificá que el backend esté levantado.',
      0,
    );
  }

  const texto = await response.text();
  let data = null;

  if (texto) {
    try {
      data = JSON.parse(texto);
    } catch {
      data = texto;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && token && path !== '/auth/login') {
      sessionStorage.removeItem(CLAVE_SESION);
      window.location.assign('/login');
    }

    const mensaje =
      (data && typeof data === 'object' && data.error) ||
      'Error al comunicarse con el servidor';

    throw new ApiError(mensaje, response.status, data?.detalles ?? null);
  }

  return data;
}

export { API_URL };