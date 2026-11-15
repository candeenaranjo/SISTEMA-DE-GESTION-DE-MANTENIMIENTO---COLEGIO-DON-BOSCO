// Los valores deben coincidir con roles.nombre en la base de datos
export const ROLES = Object.freeze({
  ORDENANZA: 'ordenanza',
  JEFE_MANTENIMIENTO: 'jefeMantenimiento',
  DIRECTIVO: 'directivo',
});

export const ROLES_RESPONSABLES = [ROLES.JEFE_MANTENIMIENTO, ROLES.ORDENANZA]; 