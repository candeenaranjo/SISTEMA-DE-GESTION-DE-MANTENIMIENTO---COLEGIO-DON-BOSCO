import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router';
import { FaBell } from 'react-icons/fa6';
import '../styles/NotificacionesPage.css';
import EncabezadoPagina from '../../../shared/components/EncabezadoPagina';
import { obtenerNotificaciones, marcarComoLeida } from '../services/notificacionesService';
import TabsNotificaciones from '../components/TabsNotificaciones';
import ItemNotificacion from '../../../shared/components/ItemNotificacion';

function NotificacionesPage() {
  const usuario = useOutletContext();
  const rol = usuario?.rol ?? 'directivo';

  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [tabActivo, setTabActivo] = useState('todas');

  useEffect(() => {
    let activo = true;

    obtenerNotificaciones()
      .then((lista) => activo && setNotificaciones(lista))
      .catch((e) => activo && setError(e.message))
      .finally(() => activo && setCargando(false));

    return () => {
      activo = false;
    };
  }, []);

  // filtrado por tab
  const notificacionesFiltradas = useMemo(() => {
    if (tabActivo === 'todas') return notificaciones;
    return notificaciones.filter((n) => n.tipo === tabActivo);
  }, [notificaciones, tabActivo]);

  // contadores por tab
  const contadores = useMemo(() => {
    const cuenta = { todas: notificaciones.length };
    notificaciones.forEach((n) => {
      cuenta[n.tipo] = (cuenta[n.tipo] ?? 0) + 1;
    });
    return cuenta;
  }, [notificaciones]);

  // a dónde lleva cada notificación (las de tarea van al detalle; las de
  // requerimiento solo existen para el Jefe, que es quien puede verlas)
  const destino = (n) => {
    if (n.idTarea) return `/gestor/tareas/${n.idTarea}`;
    if (n.idRequerimiento && rol === 'jefeMantenimiento') {
      return `/gestor/requerimientos/${n.idRequerimiento}`;
    }
    return undefined;
  };

  // al hacer click se marca como leída (si todavía no lo estaba)
  const handleLeer = async (n) => {
    if (n.leida) return;
    try {
      const actualizada = await marcarComoLeida(n.id);
      setNotificaciones((lista) => lista.map((x) => (x.id === n.id ? actualizada : x)));
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="notificaciones-page">
      <EncabezadoPagina
        icono={FaBell}
        titulo="Notificaciones"
        subtitulo="Notificaciones recientes"
        tono="secundario"
      />

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="mb-3">
        <TabsNotificaciones rol={rol} activo={tabActivo} contadores={contadores} onCambiar={setTabActivo} />
      </div>

      <div className="card border-0 shadow-sm">
        {cargando ? (
          <div className="card-body text-center text-muted py-5">Cargando notificaciones…</div>
        ) : notificacionesFiltradas.length === 0 ? (
          <div className="card-body text-center text-muted py-5">
            <p className="mb-1 fw-medium">No hay notificaciones para mostrar</p>
            <small>Cuando llegue aparecerán aquí</small>
          </div>
        ) : (
          notificacionesFiltradas.map((n) => (
            <ItemNotificacion key={n.id} notificacion={n} to={destino(n)} onClick={handleLeer} />
          ))
        )}
      </div>
    </div>
  );
}

export default NotificacionesPage;