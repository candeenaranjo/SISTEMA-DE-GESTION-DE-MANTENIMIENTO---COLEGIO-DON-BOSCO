import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router';
import { FaScrewdriverWrench, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import '../styles/TareasListadoPage.css';
import EncabezadoPagina from '../../../shared/components/EncabezadoPagina';
import { obtenerTareas } from '../services/tareasService';
import Filtros from '../../../shared/components/Filtros';
import TablaTareas from '../components/TablaTareas';

const POR_PAGINA = 10;
const FILTROS_INICIALES = {
  busqueda: '',
  estado: 'todos',
  prioridad: 'todas',
  responsable: 'todos',
  fechaDesde: '',
  fechaHasta: '',
};

const codigoTarea = (id) => `T-${String(id).padStart(4, '0')}`;

function TareasListadoPage() {
  const usuario = useOutletContext();

  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);

  useEffect(() => {
    const ctrl = new AbortController();
    setCargando(true);
    setError(null);
    obtenerTareas()
      .then((ts) => {
        if (!ctrl.signal.aborted) setTareas(ts ?? []);
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError(e.message);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setCargando(false);
      });
    return () => ctrl.abort();
  }, []);

  // Las opciones del filtro "Responsable" salen de las propias tareas:
  // así funciona también para el Directivo, que no puede pedir la lista de usuarios asignables.
  const responsables = useMemo(
    () =>
      [...new Set(tareas.map((t) => t.responsable?.nombre).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, 'es'),
      ),
    [tareas],
  );

  function manejarCambioFiltro(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  }

  const tareasFiltradas = useMemo(() => {
    const busqueda = filtros.busqueda.trim().toLowerCase();

    return tareas.filter((t) => {
      const coincideBusqueda =
        busqueda === '' ||
        String(t.id).includes(busqueda) ||
        codigoTarea(t.id).toLowerCase().includes(busqueda) ||
        (t.categoria ?? '').toLowerCase().includes(busqueda);

      const coincideEstado = filtros.estado === 'todos' || t.estado === filtros.estado;
      const coincidePrioridad = filtros.prioridad === 'todas' || t.prioridad === filtros.prioridad;
      const coincideResponsable =
        filtros.responsable === 'todos' || t.responsable?.nombre === filtros.responsable;

      const fechaTarea = t.fechaCreacion ? String(t.fechaCreacion).slice(0, 10) : '';
      const coincideDesde = !filtros.fechaDesde || fechaTarea >= filtros.fechaDesde;
      const coincideHasta = !filtros.fechaHasta || fechaTarea <= filtros.fechaHasta;

      return (
        coincideBusqueda &&
        coincideEstado &&
        coincidePrioridad &&
        coincideResponsable &&
        coincideDesde &&
        coincideHasta
      );
    });
  }, [tareas, filtros]);

  const totalPaginas = Math.max(1, Math.ceil(tareasFiltradas.length / POR_PAGINA));
  const tareasPagina = tareasFiltradas.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const desde = tareasFiltradas.length === 0 ? 0 : (pagina - 1) * POR_PAGINA + 1;
  const hasta = Math.min(pagina * POR_PAGINA, tareasFiltradas.length);

  const esDirectivo = usuario?.rol === 'directivo';

  return (
    <div className="tareas-listado">
      <EncabezadoPagina
        icono={FaScrewdriverWrench}
        titulo={esDirectivo ? 'Todas las Tareas' : 'Mis Tareas'}
        subtitulo={
          esDirectivo
            ? 'Revisá la tarea y aprobá o rechazá si está finalizada'
            : 'Información completa de las tareas'
        }
      />

      <Filtros
        filtros={filtros}
        onCambiar={manejarCambioFiltro}
        onLimpiar={() => {
          setFiltros(FILTROS_INICIALES);
          setPagina(1);
        }}
        onAplicar={() => {}}
        campos={[
          {
            tipo: 'busqueda',
            clave: 'busqueda',
            placeholder: 'Buscar por ID o categoría…',
          },
          {
            tipo: 'select',
            clave: 'estado',
            etiqueta: 'Estado',
            opciones: [
              { valor: 'todos', texto: 'Todos' },
              { valor: 'pendiente', texto: 'Pendiente' },
              { valor: 'en-proceso', texto: 'En proceso' },
              { valor: 'demorada', texto: 'Demorada' },
              { valor: 'cancelada', texto: 'Cancelada' },
              { valor: 'finalizada', texto: 'Finalizada' },
              { valor: 'aprobada', texto: 'Aprobada' },
            ],
          },
          {
            tipo: 'select',
            clave: 'prioridad',
            etiqueta: 'Prioridad',
            opciones: [
              { valor: 'todas', texto: 'Todas' },
              { valor: 'alta', texto: 'Alta' },
              { valor: 'media', texto: 'Media' },
              { valor: 'baja', texto: 'Baja' },
            ],
          },
          {
            tipo: 'select',
            clave: 'responsable',
            etiqueta: 'Responsable',
            opciones: [
              { valor: 'todos', texto: 'Todos' },
              ...responsables.map((nombre) => ({ valor: nombre, texto: nombre })),
            ],
          },
          { tipo: 'fecha', clave: 'fechaDesde', etiqueta: 'Fecha desde' },
          { tipo: 'fecha', clave: 'fechaHasta', etiqueta: 'Fecha hasta' },
        ]}
      />

      {cargando && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">Cargando tareas…</div>
        </div>
      )}
      {!cargando && error && <div className="alert alert-danger">{error}</div>}
      {!cargando && !error && <TablaTareas tareas={tareasPagina} usuario={usuario} />}

      {!cargando && !error && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">
            Mostrando {desde} – {hasta} de {tareasFiltradas.length} tareas
          </small>

          {totalPaginas > 1 && (
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                  >
                    <FaChevronLeft size={12} />
                  </button>
                </li>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <li key={n} className={`page-item ${pagina === n ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => setPagina(n)}>
                      {n}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                    disabled={pagina === totalPaginas}
                  >
                    <FaChevronRight size={12} />
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}

export default TareasListadoPage;