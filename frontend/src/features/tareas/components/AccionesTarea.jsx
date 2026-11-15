import { FaBolt, FaGear, FaFloppyDisk, FaCircleCheck, FaTrashCan, FaCircleInfo, FaLock } from 'react-icons/fa6';
import '../styles/AccionesTarea.css';

const TEXTO_ESTADO = {
  pendiente: 'Pendiente',
  'en-proceso': 'En proceso',
  demorada: 'Demorada',
  finalizada: 'Finalizada',
  aprobada: 'Aprobada',
  cancelada: 'Cancelada',
};

// Con el selector, el Jefe alterna entre "en proceso" y "demorada" (la demora exige motivo).
// "Finalizada" y "Cancelada" tienen su propio botón. "Pendiente" no se elige: solo existe para
// la tarea que se genera al cancelar otra, y pasa a "en proceso" al asignarle responsable.
const SIGUIENTES = {
  'en-proceso': ['demorada'],
  demorada: ['en-proceso'],
};

const ESTADOS_CERRADOS = ['finalizada', 'aprobada', 'cancelada'];

const MENSAJE_CERRADA = {
  finalizada: 'La tarea ya está finalizada: queda a la espera de que el Directivo la apruebe o la rechace.',
  aprobada: 'La tarea ya fue aprobada y no admite cambios.',
  cancelada: 'La tarea fue cancelada: se generó otra tarea pendiente para el mismo requerimiento.',
};

// estadoActual: el estado guardado de la tarea (no el que se está eligiendo en el selector)
function AccionesTarea({
  modoEdicion,
  valores,
  estadoActual = 'pendiente',
  guardando,
  onCambiar,
  onGuardar,
  onFinalizar,
  onCancelar,
}) {
  const esEstadoCerrado = modoEdicion && ESTADOS_CERRADOS.includes(estadoActual);
  const esPendiente = modoEdicion && estadoActual === 'pendiente';
  const opciones = [estadoActual, ...(SIGUIENTES[estadoActual] ?? [])];

  return (
    <>
      {/* estado */}
      <div className="card border-0 shadow-sm mb-4 acciones-tarea">
        <div className="card-body">
          <h6 className="mb-3 d-flex align-items-center gap-2">
            <FaBolt /> Estado
          </h6>

          {!modoEdicion ? (
            <div className="alert alert-info mb-0 small d-flex gap-2">
              <FaCircleInfo className="flex-shrink-0" />
              <span>
                Al crearla, la tarea inicia <strong>En proceso</strong> y se registra automáticamente la
                fecha de inicio.
              </span>
            </div>
          ) : esEstadoCerrado ? (
            <div className="alert alert-secondary mb-0 small d-flex gap-2">
              <FaLock className="flex-shrink-0" />
              <span>
                Esta tarea está <strong>{TEXTO_ESTADO[estadoActual]}</strong> y ya no admite cambios de
                estado.
              </span>
            </div>
          ) : esPendiente ? (
            <div className="alert alert-warning mb-0 small d-flex gap-2">
              <FaCircleInfo className="flex-shrink-0" />
              <span>
                Tarea <strong>Pendiente</strong>: se generó al cancelar otra. Asignale un responsable y
                guardá: pasa a <strong>En proceso</strong>.
              </span>
            </div>
          ) : (
            <div>
              <label className="form-label small text-muted d-block">Estado de la tarea</label>
              <select
                className="form-select"
                value={valores.estado ?? estadoActual}
                onChange={(e) => onCambiar('estado', e.target.value)}
              >
                {opciones.map((estado) => (
                  <option key={estado} value={estado}>
                    {TEXTO_ESTADO[estado]}
                  </option>
                ))}
              </select>
              {valores.estado === 'demorada' && estadoActual !== 'demorada' && (
                <small className="text-muted d-block mt-2">
                  Al guardar te vamos a pedir el motivo de la demora.
                </small>
              )}
            </div>
          )}
        </div>
      </div>

      {/* acciones */}
      <div className="card border-0 shadow-sm acciones-tarea">
        <div className="card-body">
          <h6 className="mb-3 d-flex align-items-center gap-2">
            <FaGear /> Acciones
          </h6>

          <button
            type="button"
            className="btn btn-primary w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
            onClick={onGuardar}
            disabled={guardando || esEstadoCerrado}
          >
            <FaFloppyDisk />
            {guardando
              ? 'Guardando...'
              : !modoEdicion
                ? 'Crear tarea'
                : esPendiente
                  ? 'Guardar y poner en proceso'
                  : 'Guardar cambios'}
          </button>

          {/* acciones rápidas: solo con la tarea abierta */}
          {modoEdicion && !esEstadoCerrado && (
            <>
              {!esPendiente && (
                <button
                  type="button"
                  className="btn btn-outline-success w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
                  onClick={onFinalizar}
                >
                  <FaCircleCheck /> Marcar como finalizada
                </button>
              )}

              <button
                type="button"
                className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={onCancelar}
              >
                <FaTrashCan /> Cancelar tarea
              </button>
            </>
          )}

          <div className="alert alert-info mt-3 mb-0 small d-flex gap-2">
            <FaCircleInfo className="flex-shrink-0" />
            <span>
              {esEstadoCerrado
                ? MENSAJE_CERRADA[estadoActual]
                : 'Cada cambio de estado queda registrado en el historial de la tarea.'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccionesTarea;