import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router';
import { FaPlus, FaUsers, FaChevronLeft, FaChevronRight } from 'react-icons/fa6';
import '../styles/PersonalExternoPage.css';
import EncabezadoPagina from '../../../shared/components/EncabezadoPagina';
import { obtenerPersonal, eliminarPersonal } from '../services/personalService';
import { useToast } from '../../../shared/context/ToastContext';
import ModalConfirmacion from '../../../shared/components/ModalConfirmacion';
import Filtros from '../../../shared/components/Filtros';
import TablaPersonal from '../components/TablaPersonal';

const POR_PAGINA = 8;
const FILTROS_INICIALES = { busqueda: '', especialidad: 'todas', estado: 'todos' };

function PersonalExternoPage() {
  const { mostrarToast } = useToast();

  const [todoElPersonal, setTodoElPersonal] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtros, setFiltros] = useState(FILTROS_INICIALES);
  const [pagina, setPagina] = useState(1);

  const [modalBaja, setModalBaja] = useState({ abierto: false, persona: null });

  useEffect(() => {
    let activo = true;
    obtenerPersonal()
      .then((data) => {
        if (activo) setTodoElPersonal(data);
      })
      .catch((e) => {
        if (activo) setError(e.message || 'No se pudo cargar el personal externo.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const especialidades = useMemo(
    () => [...new Set(todoElPersonal.map((p) => p.especialidad))].sort(),
    [todoElPersonal],
  );

  function manejarCambioFiltro(campo, valor) {
    setFiltros((prev) => ({ ...prev, [campo]: valor }));
    setPagina(1);
  }

  const personalFiltrado = useMemo(() => {
    const busqueda = filtros.busqueda.toLowerCase();

    return todoElPersonal.filter((p) => {
      const coincideBusqueda =
        busqueda === '' ||
        p.nombre?.toLowerCase().includes(busqueda) ||
        p.apellido?.toLowerCase().includes(busqueda) ||
        p.especialidad?.toLowerCase().includes(busqueda);

      const coincideEspecialidad =
        filtros.especialidad === 'todas' || p.especialidad === filtros.especialidad;

      const coincideEstado =
        filtros.estado === 'todos' ||
        (filtros.estado === 'activos' && p.activo) ||
        (filtros.estado === 'inactivos' && !p.activo);

      return coincideBusqueda && coincideEspecialidad && coincideEstado;
    });
  }, [todoElPersonal, filtros]);

  const totalPaginas = Math.max(1, Math.ceil(personalFiltrado.length / POR_PAGINA));
  const personalPagina = personalFiltrado.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  function abrirModalBaja(persona) {
    setModalBaja({ abierto: true, persona });
  }

  function cerrarModalBaja() {
    setModalBaja({ abierto: false, persona: null });
  }

  // Baja lógica: el registro se conserva y se puede volver a dar de alta desde su edición
  async function confirmarBaja() {
    const persona = modalBaja.persona;
    if (!persona) return;

    try {
      await eliminarPersonal(persona.id);
      setTodoElPersonal(await obtenerPersonal());
      mostrarToast(`Se dio de baja a ${persona.nombre} ${persona.apellido}`, 'success');
    } catch (e) {
      mostrarToast(e.message || 'No se pudo dar de baja al personal', 'danger');
    } finally {
      cerrarModalBaja();
    }
  }

  return (
    <div className="personal-page">
      <EncabezadoPagina
        icono={FaUsers}
        titulo="Personal externo"
        subtitulo="Gestión del personal externo"
      >
        <Link to="/gestor/personal-externo/nuevo" className="btn btn-primary">
          <FaPlus className="me-2" />
          Agregar nuevo personal
        </Link>
      </EncabezadoPagina>

      <Filtros
        filtros={filtros}
        onCambiar={manejarCambioFiltro}
        onLimpiar={() => {
          setFiltros(FILTROS_INICIALES);
          setPagina(1);
        }}
        campos={[
          {
            tipo: 'busqueda',
            clave: 'busqueda',
            placeholder: 'Buscar por nombre, apellido o especialidad…',
          },
          {
            tipo: 'select',
            clave: 'especialidad',
            etiqueta: 'Especialidad',
            opciones: [
              { valor: 'todas', texto: 'Todas' },
              ...especialidades.map((esp) => ({ valor: esp, texto: esp })),
            ],
          },
          {
            tipo: 'select',
            clave: 'estado',
            etiqueta: 'Estado',
            opciones: [
              { valor: 'todos', texto: 'Todos' },
              { valor: 'activos', texto: 'Activos' },
              { valor: 'inactivos', texto: 'Inactivos' },
            ],
          },
        ]}
      />

      {cargando && (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">Cargando personal…</div>
        </div>
      )}
      {!cargando && error && <div className="alert alert-danger">{error}</div>}
      {!cargando && !error && <TablaPersonal personal={personalPagina} onEliminar={abrirModalBaja} />}

      {!cargando && !error && (
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
          <small className="text-muted">
            Mostrando {personalPagina.length} de {personalFiltrado.length} personas
          </small>

          {totalPaginas > 1 && (
            <nav>
              <ul className="pagination pagination-sm mb-0">
                <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPagina((p) => Math.max(1, p - 1))}
                    disabled={pagina === 1}
                  >
                    <FaChevronLeft size={12} />
                  </button>
                </li>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map((n) => (
                  <li key={n} className={`page-item ${pagina === n ? 'active' : ''}`}>
                    <button type="button" className="page-link" onClick={() => setPagina(n)}>
                      {n}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${pagina === totalPaginas ? 'disabled' : ''}`}>
                  <button
                    type="button"
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

      {/* confirmación de baja */}
      <ModalConfirmacion
        abierto={modalBaja.abierto}
        titulo="Dar de baja al personal"
        mensaje={
          modalBaja.persona
            ? `¿Querés dar de baja a ${modalBaja.persona.nombre} ${modalBaja.persona.apellido}? Se conserva el historial de tareas asignadas y podés volver a darlo de alta cuando quieras.`
            : ''
        }
        textoConfirmar="Dar de baja"
        variante="danger"
        onConfirmar={confirmarBaja}
        onCancelar={cerrarModalBaja}
      />
    </div>
  );
}

export default PersonalExternoPage;