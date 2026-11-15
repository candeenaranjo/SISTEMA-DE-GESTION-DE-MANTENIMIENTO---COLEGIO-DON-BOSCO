export function mapearTarea(row) {
  if (!row) return null;

  return {
    id: row.id,
    idRequerimiento: row.idRequerimiento,
    categoria: row.categoria,
    requerimientoTitulo: row.requerimientoTitulo, // alias de compatibilidad con el front
    titulo: row.titulo, // alias de compatibilidad con el front
    descripcion: row.descripcion,
    idSector: row.idSector, // puede ser null si el sector se eliminó (el requerimiento ya estaba resuelto)
    sector: row.sector,
    lugar: row.lugar, // alias de compatibilidad con el front
    fechaEmision: row.fechaEmision,
    reportadoPor: row.reportadoPor,
    rolReportante: row.rolReportante,
    prioridad: row.prioridad,
    estado: row.estado,
    responsable: row.responsableNombre
      ? { nombre: row.responsableNombre, tipo: row.responsableTipo }
      : null,
    compra: row.idCompra
      ? {
          id: row.idCompra,
          monto: row.compraMonto,
          detalle: row.compraDetalle,
          detalleCompra: row.compraDetalle,
          categoria: row.compraCategoria,
          fuenteFinanciamiento: row.compraFuenteFinanciamiento,
          fecha: row.compraFecha,
          fechaCompra: row.compraFecha,
          factura: row.compraFactura,
        }
      : null,
    telefono: row.telefono,
    observaciones: row.observaciones,
    fechaCreacion: row.fechaCreacion,
    fechaInicio: row.fechaInicio,
    fechaFin: row.fechaFin,
    idDirectivo: row.idDirectivo,
    idResponsable: row.idResponsable,
    idPersonalExterno: row.idPersonalExterno,
    idTareaOrigen: row.idTareaOrigen,
  };
}