import SeccionCompra from './SeccionCompra';
import { FaScrewdriverWrench, FaUsers, FaPhone, FaUserTie, FaBuilding, FaUserShield } from 'react-icons/fa6';
import '../styles/DatosTarea.css';

const MAX_OBSERVACIONES = 300;

const TIPOS_ASIGNACION = [
  { valor: 'jefe', id: 'tipoJefe', Icono: FaUserShield, texto: 'La toma el Jefe de Mantenimiento' },
  { valor: 'interno', id: 'tipoInterno', Icono: FaUserTie, texto: 'Asignar a personal interno (ordenanza)' },
  { valor: 'externo', id: 'tipoExterno', Icono: FaBuilding, texto: 'Asignar a personal externo' },
];

const nombreCompleto = (p) => [p.nombre, p.apellido].filter(Boolean).join(' ');

// internos / externos: listas que vienen del backend ({ id, nombre, apellido, telefono, especialidad? }).
// valorSelectPersonal: "int-<id>" o "ext-<id>" (o '' si todavía no se eligió a nadie).
function DatosTarea({
  modoEdicion,
  deshabilitado = false,
  valores,
  internos = [],
  externos = [],
  valorSelectPersonal,
  compra,
  onCambiar,
  onSeleccionarPersonal,
  onRegistrarCompra,
  onEditarCompra,
}) {
  const esInterno = valores.tipoAsignacion === 'interno';
  const esExterno = valores.tipoAsignacion === 'externo';
  const lista = esInterno ? internos : esExterno ? externos : [];
  const prefijo = esInterno ? 'int' : 'ext';

  return (
    <>
      {/* detalle de la tarea */}
      <div className="card border-0 shadow-sm mb-4 datos-tarea">
        <div className="card-body">
          <h6 className="mb-3 d-flex align-items-center gap-2">
            <FaScrewdriverWrench /> Detalles de la tarea
          </h6>

          <div className="row g-3">
            {/* prioridad */}
            <div className="col-12 col-md-6">
              <label className="form-label">Prioridad</label>
              <select
                className="form-select"
                value={valores.prioridad}
                disabled={deshabilitado}
                onChange={(e) => onCambiar('prioridad', e.target.value)}
              >
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>

            {/* observaciones */}
            <div className="col-12">
              <label className="form-label">Observaciones</label>
              <textarea
                className="form-control"
                rows={3}
                maxLength={MAX_OBSERVACIONES}
                disabled={deshabilitado}
                placeholder="Agregar información adicional sobre la tarea..."
                value={valores.observaciones ?? ''}
                onChange={(e) => onCambiar('observaciones', e.target.value)}
              />
              <small className="text-muted d-block text-end">
                {(valores.observaciones ?? '').length}/{MAX_OBSERVACIONES}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* asignación y recursos */}
      <div className="card border-0 shadow-sm datos-tarea">
        <div className="card-body">
          <h6 className="mb-3 d-flex align-items-center gap-2">
            <FaUsers /> Asignación y recursos
          </h6>

          {/* quién la realiza: se puede elegir al crear y reasignar mientras la tarea esté abierta */}
          <div className="mb-3">
            <label className="form-label d-block">¿Quién realizará la tarea?</label>

            {TIPOS_ASIGNACION.map(({ valor, id, Icono, texto }) => (
              <div className="form-check" key={valor}>
                <input
                  className="form-check-input"
                  type="radio"
                  name="tipoAsignacion"
                  id={id}
                  value={valor}
                  checked={valores.tipoAsignacion === valor}
                  disabled={deshabilitado}
                  onChange={(e) => onCambiar('tipoAsignacion', e.target.value)}
                />
                <label className="form-check-label d-flex align-items-center gap-2" htmlFor={id}>
                  <Icono size={14} /> {texto}
                </label>
              </div>
            ))}

            {modoEdicion && !deshabilitado && (
              <small className="text-muted d-block mt-2">
                Podés reasignar el responsable mientras la tarea no esté cerrada.
              </small>
            )}
          </div>

          {/* responsable (interno o externo) + teléfono de contacto */}
          {valores.tipoAsignacion !== 'jefe' && (
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label">
                  {esInterno ? 'Personal interno (ordenanza)' : 'Personal externo'}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaUsers className="text-muted" />
                  </span>
                  <select
                    className="form-select"
                    value={valorSelectPersonal}
                    disabled={deshabilitado}
                    onChange={(e) => onSeleccionarPersonal(e.target.value)}
                  >
                    <option value="">Seleccioná un responsable</option>
                    {lista.map((p) => (
                      <option key={p.id} value={`${prefijo}-${p.id}`}>
                        {nombreCompleto(p)}
                        {p.especialidad ? ` — ${p.especialidad}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label">Teléfono / contacto</label>
                <div className="input-group">
                  <span className="input-group-text bg-white">
                    <FaPhone className="text-muted" />
                  </span>
                  {/* Solo informativo: sale de la ficha de la persona elegida */}
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Se completa al elegir al responsable"
                    value={valores.telefono ?? ''}
                    readOnly
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* compra de materiales */}
      <SeccionCompra compra={compra} onRegistrar={onRegistrarCompra} onEditar={onEditarCompra} />
    </>
  );
}

export default DatosTarea;