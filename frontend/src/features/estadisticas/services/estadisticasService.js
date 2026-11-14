

export async function obtenerEstadisticas(periodo = 30) {
  return { ...estadisticas, periodo, estadoTareas: tareas.porEstado };
}
