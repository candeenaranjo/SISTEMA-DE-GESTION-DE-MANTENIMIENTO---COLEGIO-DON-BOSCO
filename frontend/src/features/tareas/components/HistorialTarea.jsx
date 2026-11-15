import { FaClockRotateLeft, FaCircle } from 'react-icons/fa6';
import Etiqueta from '../../../shared/components/Etiqueta';
import { formatearFechaHora } from '../../../shared/utils/formatos';
import '../styles/HistorialTarea.css';

const TEXTO_ESTADO = { pendiente: 'Pendiente', 'en-proceso': 'En proceso', demorada: 'Demorada', cancelada: 'Cancelada', finalizada: 'Finalizada', aprobada: 'Aprobada', rechazada: 'Rechazada', };
const COLOR_POR_ESTADO = { pendiente: 'amarillo', 'en-proceso': 'azul', demorada: 'rojo', cancelada: 'gris', finalizada: 'verde', aprobada: 'verde', rechazada: 'rojo', };

function HistorialTarea({ historial }) {
    if (!historial || historial.length === 0) {
        return (
            <div className="card border-0 shadow-sm historial-tarea">
                <div className="card-body">
                    <h6 className="mb-3 d-flex align-items-center gap-2">
                        <FaClockRotateLeft /> Historial de la tarea
                    </h6>
                    <p className="text-muted small text-center mb-0">
                        Todavía no hay eventos registrados.
                    </p>
                </div>
            </div>
        );
    }
    // El backend ya devuelve el historial en orden cronológico
    const historialOrdenado = historial;

    return (
        <div className="card border-0 shadow-sm historial-tarea">
            <div className="card-body">
                <h6 className="mb-4 d-flex align-items-center gap-2">
                    <FaClockRotateLeft /> Historial de la tarea
                </h6>

                <ol className="historial-tarea__timeline">
                    {historialOrdenado.map((evento, index) => {
                        const color = COLOR_POR_ESTADO[evento.estado] ?? 'gris';
                        const esUltimo = index === historial.length - 1;

                        return (
                            <li key={evento.id ?? index} className="historial-tarea__item">
                                {/* linea vertical */}
                                {!esUltimo && (
                                    <span className="historial-tarea__linea" aria-hidden="true" />
                                )}

                                {/* punto*/}
                                <span className={`historial-tarea__punto historial-tarea__punto--${color}`} aria-hidden="true" >
                                    <FaCircle size={12} />
                                </span>

                                {/* contenido */}
                                <div className="historial-tarea__contenido">
                                    <div className="historial-tarea__header">
                                        <Etiqueta estado={evento.estado}>
                                            {TEXTO_ESTADO[evento.estado] ?? evento.estado}
                                        </Etiqueta>
                                        <small className="text-muted historial-tarea__fecha">
                                            {formatearFechaHora(evento.fecha)}
                                        </small>
                                    </div>

                                    {evento.motivo && (
                                        <p className="historial-tarea__motivo">{evento.motivo}</p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </div>
        </div>
    );
}

export default HistorialTarea;