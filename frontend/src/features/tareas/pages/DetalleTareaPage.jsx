import { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router';
import { FaScrewdriverWrench } from 'react-icons/fa6';
import '../styles/DetalleTareaPage.css';
import {
  obtenerTareaPorId,
  obtenerHistorialTarea,
  evaluarTarea,
} from '../services/tareasService';
import EncabezadoPage from '../../../shared/components/EncabezadoPagina';
import { useToast } from '../../../shared/context/ToastContext';
import ResumenDetalleTarea from '../components/ResumenDetalleTarea';
import RequerimientoAsociado from '../components/RequerimientoAsociado';
import AccionesDetalleTarea from '../components/AccionesDetalleTarea';
import HistorialTarea from '../components/HistorialTarea';

function DetalleTareaPage() {
  const { id } = useParams();
  const usuario = useOutletContext();
  const { mostrarToast } = useToast();

  const [tarea, setTarea] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setCargando(true);
    setError(null);

    // La compra viene embebida en la tarea (tarea.compra); el historial se pide aparte
    Promise.all([obtenerTareaPorId(id), obtenerHistorialTarea(id)])
      .then(([t, h]) => {
        if (ctrl.signal.aborted) return;
        setTarea(t);
        setHistorial(h ?? []);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setCargando(false);
      });

    return () => ctrl.abort();
  }, [id]);

  // Aprobar o rechazar (Directivo). Al rechazar, la tarea vuelve a "en-proceso".
  async function evaluar(tareaId, datos, mensajeExito) {
    try {
      const actualizada = await evaluarTarea(tareaId, datos);
      setTarea(actualizada);
      mostrarToast(mensajeExito, 'success');
      setHistorial(await obtenerHistorialTarea(tareaId));
    } catch (e) {
      mostrarToast(e.message || 'No se pudo evaluar la tarea', 'danger');
    }
  }

  const manejarAceptar = (tareaId) => evaluar(tareaId, { estado: 'aprobada' }, 'Tarea aprobada');

  function manejarRechazar(tareaId) {
    const motivo = window.prompt('Motivo del rechazo:');
    if (!motivo || !motivo.trim()) return;
    evaluar(
      tareaId,
      { estado: 'rechazada', motivo: motivo.trim() },
      'Tarea rechazada. Vuelve a en proceso.',
    );
  }

  if (cargando) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-secondary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !tarea) {
    return (
      <div className="container-fluid py-5 text-center">
        {error && <div className="alert alert-danger d-inline-block">{error}</div>}
        {!error && <p className="text-muted mb-3">No se encontró la tarea.</p>}
        <div className="mt-3">
          <Link to="/gestor/tareas" className="btn btn-primary">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="detalle-tarea-page">
      <EncabezadoPage
        volver={{ to: '/gestor/tareas', texto: 'Volver al listado' }}
        icono={FaScrewdriverWrench}
        titulo="Detalle de tarea"
        subtitulo={
          usuario?.rol === 'directivo'
            ? 'Revisá la tarea y aprobá o rechazá si está finalizada.'
            : 'Información completa de la tarea y su requerimiento asociado.'
        }
      />

      <ResumenDetalleTarea tarea={tarea} tieneCompra={Boolean(tarea.compra)} />

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <RequerimientoAsociado tarea={tarea} />
        </div>
        <div className="col-12 col-xl-4">
          <AccionesDetalleTarea
            tarea={tarea}
            usuario={usuario}
            onAceptar={manejarAceptar}
            onRechazar={manejarRechazar}
          />
          <HistorialTarea historial={historial} />
        </div>
      </div>
    </div>
  );
}

export default DetalleTareaPage;