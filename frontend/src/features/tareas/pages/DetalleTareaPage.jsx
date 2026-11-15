import { useEffect, useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router';
import { FaScrewdriverWrench } from 'react-icons/fa6';
import '../styles/DetalleTareaPage.css';
import { obtenerTareaPorId, obtenerHistorialTarea, evaluarTarea, cambiarEstadoTarea } from '../services/tareasService';
import EncabezadoPage from '../../../shared/components/EncabezadoPagina';
import { useToast } from '../../../shared/context/ToastContext';
import ResumenDetalleTarea from '../components/ResumenDetalleTarea';
import RequerimientoAsociado from '../components/RequerimientoAsociado';
import AccionesDetalleTarea from '../components/AccionesDetalleTarea';
import HistorialTarea from '../components/HistorialTarea';
import ModalMotivo from '../../../shared/components/ModalMotivo';
import ModalConfirmacion from '../../../shared/components/ModalConfirmacion';
import Toast from '../../../shared/components/Toast';

function DetalleTareaPage() {
  const { id } = useParams();
  const usuario = useOutletContext();
  const { mostrarToast } = useToast();

  const [tarea, setTarea] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [confirmacion, setConfirmacion] = useState({ abierto: false, accion: null, titulo: '', mensaje: '' });
  const [motivoModal, setMotivoModal] = useState({ abierto: false, accion: null, titulo: '', mensaje: '' });
  const [toast, setToast] = useState({ abierto: false, mensaje: '', tipo: 'success' });

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    setToast({ abierto: true, mensaje, tipo });
  };

  useEffect(() => {
    const ctrl = new AbortController();
    setCargando(true);
    setError(null);

    // Pedimos la tarea. Si el historial falla, no rompemos la pantalla.
    obtenerTareaPorId(id)
      .then(async (t) => {
        if (ctrl.signal.aborted) return;
        setTarea(t);

        try {
          const h = await obtenerHistorialTarea(id);
          if (!ctrl.signal.aborted) setHistorial(h ?? []);
        } catch (err) {
          console.warn("No se pudo cargar el historial", err);
          if (!ctrl.signal.aborted) setHistorial([]); // Historial vacío si falla
        }
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

  const manejarRechazar = (tareaId) => {
    setMotivoModal({
      abierto: true,
      titulo: 'Rechazar tarea',
      mensaje: 'Indicá por qué rechazás la tarea. El Jefe de Mantenimiento tendrá que volver a trabajar en ella.',
      accion: async (motivo) => {
        try {
          await evaluarTarea(tareaId, { estado: 'rechazada', motivo });
          // ... actualizar tarea ...
          setMotivoModal({ abierto: false, accion: null });
        } catch (e) {
          mostrarNotificacion(e.message, 'error');
        }
      }
    });
  };

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

  const manejarFinalizar = (tareaId) => {
    setConfirmacion({
      abierto: true,
      titulo: 'Finalizar tarea',
      mensaje: '¿Estás seguro de que concluiste el trabajo? Se notificará al Directivo para su evaluación.',
      accion: async () => {
        try {
          const actualizada = await cambiarEstadoTarea(tareaId, { estado: 'finalizada' });
          setTarea(actualizada);
          mostrarNotificacion('Tarea finalizada correctamente.', 'success');
          setHistorial(await obtenerHistorialTarea(tareaId));
          setConfirmacion({ abierto: false, accion: null });
        } catch (e) {
          mostrarNotificacion(e.message, 'error');
          setConfirmacion({ abierto: false, accion: null });
        }
      }
    });
  };

  const manejarDemorar = (tareaId) => {
    setMotivoModal({
      abierto: true,
      titulo: 'Demorar tarea',
      mensaje: 'Indicá el motivo por el cual la tarea no puede continuar (ej. falta de materiales).',
      accion: async (motivo) => {
        try {
          const actualizada = await cambiarEstadoTarea(tareaId, { estado: 'demorada', motivo });
          setTarea(actualizada);
          mostrarNotificacion('Tarea marcada como demorada.', 'info');
          setHistorial(await obtenerHistorialTarea(tareaId));
          setMotivoModal({ abierto: false, accion: null });
        } catch (e) {
          mostrarNotificacion(e.message, 'error');
          setMotivoModal({ abierto: false, accion: null });
        }
      }
    });
  };

  return (
    <div className="detalle-tarea-page">
      <EncabezadoPage
        volver={
          usuario?.rol === 'ordenanza'
            ? { to: '/gestor/mis-asignaciones', texto: 'Volver a Mis Asignaciones' }
            : { to: '/gestor/tareas', texto: 'Volver al listado' }
        }
        icono={FaScrewdriverWrench}
        titulo="Detalle de tarea"
        subtitulo={
          usuario?.rol === 'directivo'
            ? 'Revisá la tarea y aprobá o rechazá si está finalizada.'
            : usuario?.rol === 'ordenanza'
              ? 'Revisá los detalles del trabajo asignado y marcalo como finalizado cuando termines.'
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
            onFinalizar={manejarFinalizar}
          />
          <HistorialTarea historial={historial} />
        </div>
      </div>
      <ModalConfirmacion
        abierto={confirmacion.abierto}
        titulo={confirmacion.titulo}
        mensaje={confirmacion.mensaje}
        variante="success"
        textoConfirmar="Sí, confirmar"
        onConfirmar={confirmacion.accion}
        onCancelar={() => setConfirmacion({ abierto: false, accion: null })}
      />
       <ModalMotivo
        abierto={motivoModal.abierto}
        titulo={motivoModal.titulo}
        mensaje={motivoModal.mensaje}
        textoConfirmar="Guardar motivo"
        onConfirmar={motivoModal.accion}
        onCerrar={() => setMotivoModal({ abierto: false, accion: null })}
      />
      <Toast
        abierto={toast.abierto}
        tipo={toast.tipo}
        mensaje={toast.mensaje}
        onCerrar={() => setToast({ ...toast, abierto: false })}
      />
    </div>
  );
}

export default DetalleTareaPage;