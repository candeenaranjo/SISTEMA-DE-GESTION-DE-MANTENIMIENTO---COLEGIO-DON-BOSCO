import { Link } from 'react-router';
import { FaGear, FaPenToSquare, FaCircleCheck, FaCircleXmark, FaCircleInfo, FaFlagCheckered, FaLock } from 'react-icons/fa6';
import '../styles/AccionesDetalleTarea.css';

function AccionesDetalleTarea({ tarea, usuario, onAceptar, onRechazar, onFinalizar }) {
    const esJefe = usuario?.rol === 'jefeMantenimiento';
    const esDirectivo = usuario?.rol === 'directivo';
    const esOrdenanza = usuario?.rol === 'ordenanza';
    const tareaFinalizada = tarea.estado === 'finalizada';
    const yaTerminada = ['finalizada', 'aprobada', 'cancelada'].includes(tarea.estado);

    return (
        <div className="card border-0 shadow-sm mb-4 acciones-detalle-tarea">
            <div className="card-body">
                <h6 className="mb-3 d-flex align-items-center gap-2">
                    <FaGear /> Acciones
                </h6>

                {/* JEFE */}
                {esJefe && !yaTerminada && (
                    <Link to={`/gestor/tareas/${tarea.id}/editar`} className="btn btn-primary w-100" >
                        <FaPenToSquare className="me-2" /> Editar tarea
                    </Link>
                )}

                {/* DIRECTIVO */}
                {esDirectivo && (
                    <>
                        <button type="button" className="btn btn-success w-100 mb-2" onClick={() => onAceptar?.(tarea.id)} disabled={!tareaFinalizada} >
                            <FaCircleCheck className="me-2" /> Aceptar tarea
                        </button>
                        <button type="button" className="btn btn-outline-danger w-100" onClick={() => onRechazar?.(tarea.id)} disabled={!tareaFinalizada} >
                            <FaCircleXmark className="me-2" /> Rechazar tarea
                        </button>
                        {!tareaFinalizada && (
                            <div className="alert alert-info mt-3 mb-0 small d-flex gap-2">
                                <FaCircleInfo className="flex-shrink-0" />
                                <span>La tarea no ha finalizado todavia.</span>
                            </div>
                        )}
                    </>
                )}

                {/* ORDENANZA */}
                {esOrdenanza && (
                    <>
                        {!yaTerminada ? (
                            <button type="button" className="btn btn-success w-100" onClick={() => onFinalizar?.(tarea.id)}>
                                <FaFlagCheckered className="me-2" /> Marcar como finalizada
                            </button>
                        ) : (
                            <div className="alert alert-secondary mb-0 small d-flex align-items-center justify-content-center gap-2">
                                <FaLock /> Esta tarea ya fue {tarea.estado}.
                            </div>
                        )}
                        <p className="text-muted small mt-3 mb-0 text-center">
                            Como Ordenanza, tu única acción es confirmar cuando termines el trabajo.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default AccionesDetalleTarea;