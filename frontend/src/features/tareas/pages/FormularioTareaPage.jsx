import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate, useOutletContext } from 'react-router';
import { FaScrewdriverWrench } from 'react-icons/fa6';
import '../styles/FormularioTareaPage.css';
import {
  obtenerTareaPorId,
  obtenerResponsablesInternos,
  obtenerPersonalExterno,
  crearTarea,
  actualizarTarea,
  cambiarEstadoTarea,
  cancelarTarea,
} from '../services/tareasService';
import { crearCompra, actualizarCompra } from '../services/comprasService';
import { obtenerRequerimientoPorId } from '../../requerimientos/services/requerimientosService';
import Encabezado from '../../../shared/components/EncabezadoPagina';
import { useToast } from '../../../shared/context/ToastContext';
import ModalConfirmacion from '../../../shared/components/ModalConfirmacion';
import ModalCancelarTarea from '../components/ModalCancelarTarea';
import DatosRequerimiento from '../components/DatosRequerimiento';
import DatosTarea from '../components/DatosTarea';
import AccionesTarea from '../components/AccionesTarea';
import ModalCompra from '../components/ModalCompra';
import { codigoTarea, formatearFechaHora } from '../../../shared/utils/formatos';

// Estados en los que la tarea ya no se edita
const ESTADOS_FINALES = ['finalizada', 'aprobada', 'cancelada'];

// Mismas transiciones que valida el backend (PUT /tareas/:id/estado)
const TRANSICIONES = {
  pendiente: ['en-proceso'],
  'en-proceso': ['demorada', 'finalizada'],
  demorada: ['en-proceso'],
};

const VALORES_INICIALES = {
  prioridad: 'media',
  observaciones: '',
  tipoAsignacion: 'jefe', // 'jefe' | 'interno' | 'externo'
  idResponsable: '',
  idPersonalExterno: '',
  telefono: '',
  estado: 'pendiente',
};

// El backend devuelve monto/fecha; los componentes de compra trabajan con montoTotal/fechaCompra
function normalizarCompra(c) {
  return c ? { ...c, montoTotal: c.montoTotal ?? c.monto, fechaCompra: c.fecha ?? c.fechaCompra } : null;
}

// El responsable "interno" es el personal de Ordenanza; si es el propio Jefe, es "jefe"
function tipoDeAsignacion(tarea, idUsuario) {
  if (tarea.idPersonalExterno) return 'externo';
  if (tarea.idResponsable && tarea.idResponsable !== idUsuario) return 'interno';
  return 'jefe';
}

function FormularioTareaPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requerimientoId = searchParams.get('requerimiento');
  const navigate = useNavigate();
  const { mostrarToast } = useToast();
  const usuario = useOutletContext();

  const modoEdicion = Boolean(id);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [valores, setValores] = useState(VALORES_INICIALES);
  const [tarea, setTarea] = useState(null);
  const [requerimiento, setRequerimiento] = useState(null);
  const [compra, setCompra] = useState(null);

  const [internos, setInternos] = useState([]);
  const [externos, setExternos] = useState([]);

  const [guardando, setGuardando] = useState(false);
  const [modalFinalizar, setModalFinalizar] = useState(false);
  const [modalCancelar, setModalCancelar] = useState(false);
  const [modalCompraAbierto, setModalCompraAbierto] = useState(false);

  // Si es crear y no hay requerimiento, volver
  useEffect(() => {
    if (!modoEdicion && !requerimientoId) {
      navigate('/gestor/requerimientos', { replace: true });
    }
  }, [modoEdicion, requerimientoId, navigate]);

  // Cargar listas de responsables + la tarea o el requerimiento
  useEffect(() => {
    const ctrl = new AbortController();

    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const [respInternos, respExternos] = await Promise.all([
          obtenerResponsablesInternos(),
          obtenerPersonalExterno(),
        ]);
        if (ctrl.signal.aborted) return;
        setInternos(respInternos ?? []);
        setExternos(respExternos ?? []);

        if (modoEdicion) {
          const t = await obtenerTareaPorId(id);
          if (ctrl.signal.aborted) return;
          setTarea(t);
          setCompra(normalizarCompra(t.compra));
          setRequerimiento({
            id: t.idRequerimiento,
            titulo: t.categoria,
            descripcion: t.descripcion,
            lugar: t.sector,
            reportadoPor: t.reportadoPor,
            rolReportante: t.rolReportante,
            fechaHora: formatearFechaHora(t.fechaEmision ?? t.fechaCreacion),
          });
          setValores({
            prioridad: t.prioridad ?? 'media',
            observaciones: t.observaciones ?? '',
            tipoAsignacion: tipoDeAsignacion(t, usuario?.id),
            idResponsable: t.idResponsable ?? '',
            idPersonalExterno: t.idPersonalExterno ?? '',
            telefono: t.telefono ?? '',
            estado: t.estado ?? 'pendiente',
          });
        } else if (requerimientoId) {
          const r = await obtenerRequerimientoPorId(requerimientoId);
          if (ctrl.signal.aborted) return;
          setRequerimiento(r);
          setValores(VALORES_INICIALES);
        }
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message);
      } finally {
        if (!ctrl.signal.aborted) setCargando(false);
      }
    }

    cargar();
    return () => ctrl.abort();
    // usuario?.id solo se usa para clasificar al responsable al cargar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, requerimientoId, modoEdicion]);

  function manejarCambio(campo, valor) {
    setValores((prev) => {
      const nuevos = { ...prev, [campo]: valor };
      if (campo === 'tipoAsignacion') {
        nuevos.idResponsable = '';
        nuevos.idPersonalExterno = '';
        nuevos.telefono = '';
      }
      return nuevos;
    });
  }

  // El valor del select es "int-<id>" o "ext-<id>"
  function manejarSeleccionPersonal(valorSelect) {
    if (!valorSelect) {
      setValores((prev) => ({ ...prev, idResponsable: '', idPersonalExterno: '', telefono: '' }));
      return;
    }
    const [tipo, idStr] = valorSelect.split('-');
    const idNum = Number(idStr);

    if (tipo === 'int') {
      const persona = internos.find((p) => p.id === idNum);
      setValores((prev) => ({
        ...prev,
        idResponsable: idNum,
        idPersonalExterno: '',
        telefono: persona?.telefono ?? '',
      }));
    } else {
      const persona = externos.find((p) => p.id === idNum);
      setValores((prev) => ({
        ...prev,
        idResponsable: '',
        idPersonalExterno: idNum,
        telefono: persona?.telefono ?? '',
      }));
    }
  }

  const valorSelectPersonal =
    valores.tipoAsignacion === 'interno' && valores.idResponsable
      ? `int-${valores.idResponsable}`
      : valores.tipoAsignacion === 'externo' && valores.idPersonalExterno
        ? `ext-${valores.idPersonalExterno}`
        : '';

  // "Interno" = personal de Ordenanza: el propio Jefe se elige con la opción "jefe"
  const internosOrdenanza = internos.filter((p) => p.id !== usuario?.id);

  // Responsable según el tipo elegido. Siempre se manda uno solo (el otro va en null) para que el backend
  // reemplace al anterior: nunca quedan interno y externo juntos.
  function armarResponsable() {
    if (valores.tipoAsignacion === 'jefe') {
      return { idResponsable: usuario?.id, idPersonalExterno: null };
    }
    if (valores.tipoAsignacion === 'interno') {
      return { idResponsable: valores.idResponsable || null, idPersonalExterno: null };
    }
    return { idResponsable: null, idPersonalExterno: valores.idPersonalExterno || null };
  }

  const tareaCerrada = modoEdicion && ESTADOS_FINALES.includes(tarea?.estado);

  // Una vez asignado, el responsable no se cambia (para reasignar se cancela la tarea).
  // Solo la tarea generada por una cancelación, que nace sin responsable, permite asignarlo.
  const asignacionBloqueada = modoEdicion && Boolean(tarea?.idResponsable || tarea?.idPersonalExterno);

  async function manejarGuardar() {
    if (tareaCerrada) {
      mostrarToast(`La tarea está ${tarea.estado} y no se puede modificar`, 'danger');
      return;
    }
    if (!asignacionBloqueada && valores.tipoAsignacion === 'interno' && !valores.idResponsable) {
      mostrarToast('Elegí el personal interno responsable', 'danger');
      return;
    }
    if (!asignacionBloqueada && valores.tipoAsignacion === 'externo' && !valores.idPersonalExterno) {
      mostrarToast('Elegí el personal externo responsable', 'danger');
      return;
    }

    setGuardando(true);
    try {
      if (modoEdicion) {
        // El motivo de una demora se pide ANTES de guardar nada
        // "Pendiente" solo existe para la tarea generada por una cancelación: al asignarle responsable
        // y guardar, pasa a "en proceso". Las demás solo alternan entre "en proceso" y "demorada".
        const estadoDestino = tarea.estado === 'pendiente' ? 'en-proceso' : valores.estado;
        const cambiaEstado = estadoDestino !== tarea.estado;
        const datosEstado = { estado: estadoDestino };

        if (cambiaEstado) {
          const permitidos = TRANSICIONES[tarea.estado] ?? [];
          if (!permitidos.includes(estadoDestino)) {
            throw new Error(`No se puede pasar de "${tarea.estado}" a "${estadoDestino}" directamente.`);
          }
          if (estadoDestino === 'demorada') {
            const motivo = window.prompt(
              'Motivo de la demora (ej.: a la espera de aprobación del administrador):',
            );
            if (!motivo?.trim()) throw new Error('El motivo es obligatorio para demorar una tarea.');
            datosEstado.motivo = motivo.trim();
          }
        }

        // 1) Datos de la tarea
        await actualizarTarea(id, {
          prioridad: valores.prioridad,
          observaciones: valores.observaciones,
          ...(asignacionBloqueada ? {} : armarResponsable()),
        });

        // 2) Estado, solo si cambió
        if (cambiaEstado) await cambiarEstadoTarea(id, datosEstado);

        mostrarToast('Tarea actualizada correctamente', 'success');
        navigate('/gestor/tareas');
        return;
      }

      // Crear: la tarea nace "en proceso" con el responsable elegido
      const { idResponsable, idPersonalExterno } = armarResponsable();
      const payload = {
        idRequerimiento: Number(requerimiento.id),
        prioridad: valores.prioridad,
        observaciones: valores.observaciones || undefined,
        idResponsable: idResponsable ?? undefined,
        idPersonalExterno: idPersonalExterno ?? undefined,
      };
      const nueva = await crearTarea(payload);

      // La compra cargada en el formulario se registra ahora que la tarea ya tiene id
      if (compra) {
        try {
          await crearCompra(nueva.id, {
            monto: Number(compra.montoTotal ?? compra.monto),
            detalle: compra.detalleCompra ?? compra.detalle,
            categoria: 'materiales',
            fuenteFinanciamiento: compra.fuenteFinanciamiento ?? 'colegio',
            fecha: compra.fechaCompra ?? undefined,
            factura: compra.factura ?? null,
          });
        } catch (e) {
          // La tarea ya existe: se lleva a su edición para reintentar solo la compra
          mostrarToast(
            `Se creó la tarea ${codigoTarea(nueva.id)}, pero no se pudo registrar la compra: ${e.message}`,
            'danger',
          );
          navigate(`/gestor/tareas/${nueva.id}/editar`);
          return;
        }
      }

      mostrarToast(`Tarea ${codigoTarea(nueva.id)} creada correctamente`, 'success');
      navigate('/gestor/tareas');
    } catch (e) {
      mostrarToast(e.message || 'Error al guardar la tarea', 'danger');
    } finally {
      setGuardando(false);
    }
  }

  async function manejarGuardarCompra(datosCompra) {
    try {
      if (modoEdicion && compra?.id) {
        const actualizada = await actualizarCompra(compra.id, {
          monto: Number(datosCompra.montoTotal),
          detalle: datosCompra.detalleCompra,
          categoria: 'materiales',
          fuenteFinanciamiento: datosCompra.fuenteFinanciamiento ?? 'colegio',
          fecha: datosCompra.fechaCompra || undefined,
          factura: datosCompra.factura ?? null,
        });
        setCompra(normalizarCompra(actualizada));
        mostrarToast('Compra actualizada correctamente', 'success');
      } else if (modoEdicion) {
        // La tarea ya existe y todavía no tiene compra: se registra directamente
        const nueva = await crearCompra(id, {
          monto: Number(datosCompra.montoTotal),
          detalle: datosCompra.detalleCompra,
          categoria: 'materiales',
          fuenteFinanciamiento: datosCompra.fuenteFinanciamiento ?? 'colegio',
          fecha: datosCompra.fechaCompra || undefined,
          factura: datosCompra.factura ?? null,
        });
        setCompra(normalizarCompra(nueva));
        mostrarToast('Compra registrada correctamente', 'success');
      } else {
        // Al crear: queda en el formulario y se persiste junto con la tarea
        setCompra({
          montoTotal: datosCompra.montoTotal,
          detalleCompra: datosCompra.detalleCompra,
          fechaCompra: datosCompra.fechaCompra,
          factura: datosCompra.factura ?? null,
          fuenteFinanciamiento: datosCompra.fuenteFinanciamiento ?? 'colegio',
        });
        mostrarToast('Compra lista para guardarse con la tarea', 'success');
      }
      setModalCompraAbierto(false);
    } catch (e) {
      mostrarToast(e.message || 'Error al guardar la compra', 'danger');
    }
  }

  async function confirmarFinalizar() {
    try {
      await cambiarEstadoTarea(id, { estado: 'finalizada' });
      mostrarToast('Tarea finalizada. Quedó pendiente de evaluación del Directivo.', 'success');
      setModalFinalizar(false);
      navigate('/gestor/tareas');
    } catch (e) {
      mostrarToast(e.message || 'Error al finalizar', 'danger');
    }
  }

  async function confirmarCancelar(motivo) {
    try {
      const { nueva } = await cancelarTarea(id, motivo);
      mostrarToast(
        `Tarea cancelada. Se generó la tarea ${codigoTarea(nueva.id)} en estado pendiente.`,
        'success',
      );
      setModalCancelar(false);
      navigate('/gestor/tareas');
    } catch (e) {
      mostrarToast(e.message || 'Error al cancelar', 'danger');
    }
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

  if (error) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="alert alert-danger d-inline-block">{error}</div>
        <div className="mt-3">
          <Link to="/gestor/tareas" className="btn btn-primary">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  if (!requerimiento) {
    return (
      <div className="container-fluid py-5 text-center">
        <p className="text-muted">No se encontró la tarea o el requerimiento.</p>
        <Link to="/gestor/tareas" className="btn btn-primary">
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="formulario-tarea-page">
      <Encabezado
        volver={{ to: '/gestor/tareas', texto: 'Volver al listado' }}
        icono={FaScrewdriverWrench}
        titulo={modoEdicion ? 'Editar tarea' : 'Nueva tarea'}
        subtitulo={modoEdicion ? 'Modificación de la tarea' : 'Creación de nueva tarea'}
      />

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <DatosRequerimiento requerimiento={requerimiento} />

          <DatosTarea
            modoEdicion={modoEdicion}
            valores={valores}
            internos={internosOrdenanza}
            deshabilitado={tareaCerrada}
            asignacionBloqueada={asignacionBloqueada}
            responsable={tarea?.responsable}
            externos={externos}
            valorSelectPersonal={valorSelectPersonal}
            compra={compra}
            onCambiar={manejarCambio}
            onSeleccionarPersonal={manejarSeleccionPersonal}
            onRegistrarCompra={() => setModalCompraAbierto(true)}
            onEditarCompra={() => setModalCompraAbierto(true)}
          />
        </div>

        <div className="col-12 col-xl-4">
          <AccionesTarea
            modoEdicion={modoEdicion}
            valores={valores}
            estadoActual={tarea?.estado ?? 'pendiente'}
            guardando={guardando}
            onCambiar={manejarCambio}
            onGuardar={manejarGuardar}
            onFinalizar={() => setModalFinalizar(true)}
            onCancelar={() => setModalCancelar(true)}
          />
        </div>
      </div>

      <ModalCompra
        abierto={modalCompraAbierto}
        compra={compra}
        tareaId={id}
        onCerrar={() => setModalCompraAbierto(false)}
        onGuardar={manejarGuardarCompra}
      />

      <ModalConfirmacion
        abierto={modalFinalizar}
        titulo="Finalizar tarea"
        mensaje="¿Marcar esta tarea como finalizada? Quedará pendiente de evaluación del Directivo."
        textoConfirmar="Finalizar"
        variante="success"
        onConfirmar={confirmarFinalizar}
        onCancelar={() => setModalFinalizar(false)}
      />

      <ModalCancelarTarea
        abierto={modalCancelar}
        onCerrar={() => setModalCancelar(false)}
        onConfirmar={confirmarCancelar}
      />
    </div>
  );
}

export default FormularioTareaPage;