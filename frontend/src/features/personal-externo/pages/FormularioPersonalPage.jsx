import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { FaUsers } from 'react-icons/fa6';
import '../styles/FormularioPersonalPage.css';
import { obtenerPersonalPorId, crearPersonal, actualizarPersonal, eliminarPersonal, } from '../services/personalService';
import { useToast } from '../../../shared/context/ToastContext';
import ModalConfirmacion from '../../../shared/components/ModalConfirmacion';
import Encabezado from '../../../shared/components/EncabezadoPagina';
import DatosPersonalesPersonal from '../components/DatosPersonalesPersonal';
import ContactoPersonal from '../components/ContactoPersonal';
import InfoLaboralPersonal from '../components/InfoLaboralPersonal';
import ResumenPersonal from '../components/ResumenPersonal';
import AccionesPersonal from '../components/AccionesPersonal';

const ESPECIALIDADES = [
  'Electricista', 'Plomería', 'Albañilería', 'Pintura', 'Carpintería',
  'Gasista', 'Herrería', 'Climatización', 'Mantenimiento general', 'Vidriería',
];

const VALORES_INICIALES = {
  nombre: '', apellido: '', dni: '', genero: '', telefono: '', email: '',
  especialidad: '', matricula: '', observaciones: '', activo: true,
};

// Los campos que el backend devuelve en null se pasan a '' para que los inputs sigan controlados
function aValoresDeFormulario(persona) {
  return Object.fromEntries(
    Object.entries({ ...VALORES_INICIALES, ...persona }).map(([clave, valor]) => [clave, valor ?? '']),
  );
}

function FormularioPersonalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  const modoEdicion = Boolean(id);

  const [valores, setValores] = useState(VALORES_INICIALES);
  const [cargando, setCargando] = useState(modoEdicion);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const [modalConfirmacion, setModalConfirmacion] = useState({ abierto: false, tipo: null });

  useEffect(() => {
    if (!modoEdicion) return undefined;

    let activo = true;
    setCargando(true);
    setError('');

    obtenerPersonalPorId(id)
      .then((persona) => {
        if (activo) setValores(aValoresDeFormulario(persona));
      })
      .catch((e) => {
        if (activo) setError(e.message || 'No se pudo cargar el personal solicitado.');
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [id, modoEdicion]);

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
          <Link to="/gestor/personal-externo" className="btn btn-primary">
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

  function manejarCambio(campo, valor) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  // Mismas reglas que valida el backend
  function validar() {
    const nuevos = {};
    const dniDigitos = String(valores.dni ?? '').replace(/\D/g, '');

    if (!valores.nombre?.trim() || valores.nombre.trim().length < 2) nuevos.nombre = 'El nombre es obligatorio (mínimo 2 letras)';
    if (!valores.apellido?.trim() || valores.apellido.trim().length < 2) nuevos.apellido = 'El apellido es obligatorio (mínimo 2 letras)';
    // DNI y correo son opcionales: solo se validan si se completaron
    if (valores.dni?.trim() && (!/^[0-9.]+$/.test(valores.dni.trim()) || dniDigitos.length < 7 || dniDigitos.length > 10)) {
      nuevos.dni = 'El DNI debe tener entre 7 y 10 dígitos (solo números)';
    }
    if (!valores.telefono?.trim() || valores.telefono.trim().length < 5) nuevos.telefono = 'El teléfono es obligatorio (mínimo 5 caracteres)';
    if (valores.email?.trim() && !/^\S+@\S+\.\S+$/.test(valores.email.trim())) {
      nuevos.email = 'El correo no tiene un formato válido';
    }
    if (!valores.especialidad?.trim() || valores.especialidad.trim().length < 3) nuevos.especialidad = 'La especialidad es obligatoria';

    setErrores(nuevos);
    return Object.keys(nuevos).length === 0;
  }

  async function manejarGuardar() {
    if (!validar()) return;
    setGuardando(true);

    try {
      if (modoEdicion) {
        await actualizarPersonal(id, valores);
        mostrarToast('Personal actualizado correctamente', 'success');
      } else {
        await crearPersonal(valores);
        mostrarToast('Personal agregado correctamente', 'success');
      }
      navigate('/gestor/personal-externo');
    } catch (e) {
      // Ej.: "Ya existe un personal externo con ese DNI"
      mostrarToast(e.message || 'No se pudo guardar el personal', 'danger');
    } finally {
      setGuardando(false);
    }
  }

  function manejarCancelar() {
    navigate('/gestor/personal-externo');
  }

  function abrirConfirmacion(tipo) {
    setModalConfirmacion({ abierto: true, tipo });
  }

  function cerrarConfirmacion() {
    setModalConfirmacion({ abierto: false, tipo: null });
  }

  async function confirmarAccion() {
    const { tipo } = modalConfirmacion;

    try {
      if (tipo === 'dar-de-baja') {
        await eliminarPersonal(id); // DELETE: baja lógica
        mostrarToast('Personal dado de baja', 'success');
      } else if (tipo === 'dar-de-alta') {
        await actualizarPersonal(id, { ...valores, activo: true });
        mostrarToast('Personal dado de alta', 'success');
      }
      navigate('/gestor/personal-externo');
    } catch (e) {
      mostrarToast(e.message || 'No se pudo completar la acción', 'danger');
    } finally {
      cerrarConfirmacion();
    }
  }

  // Si la especialidad guardada no está en la lista base, se agrega para que el select la muestre
  const especialidades = [...new Set([...ESPECIALIDADES, valores.especialidad].filter(Boolean))];

  return (
    <div className="formulario-personal-page">
      <Encabezado
        volver={{ to: '/gestor/personal-externo', texto: 'Volver al listado' }}
        icono={FaUsers}
        titulo={modoEdicion ? 'Editar personal externo' : 'Nuevo personal externo'}
        subtitulo={
          modoEdicion
            ? 'Modificación del personal externo registrado'
            : 'Registrá los datos de un nuevo personal externo'
        }
      />

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <DatosPersonalesPersonal valores={valores} errores={errores} onCambiar={manejarCambio} />
          <ContactoPersonal valores={valores} errores={errores} onCambiar={manejarCambio} />
          <InfoLaboralPersonal
            valores={valores}
            errores={errores}
            especialidades={especialidades}
            onCambiar={manejarCambio}
          />
        </div>

        <div className="col-12 col-xl-4">
          {modoEdicion && <ResumenPersonal persona={{ ...valores, id: valores.codigo || valores.id }} />}

          <AccionesPersonal
            modoEdicion={modoEdicion}
            estaActivo={valores.activo}
            guardando={guardando}
            onGuardar={manejarGuardar}
            onCancelar={manejarCancelar}
            onDarDeBaja={() => abrirConfirmacion('dar-de-baja')}
            onDarDeAlta={() => abrirConfirmacion('dar-de-alta')}
          />
        </div>
      </div>

      <ModalConfirmacion
        abierto={modalConfirmacion.abierto}
        titulo={
          modalConfirmacion.tipo === 'dar-de-baja' ? 'Dar de baja al personal' : 'Dar de alta al personal'
        }
        mensaje={
          modalConfirmacion.tipo === 'dar-de-baja'
            ? `¿Estás seguro que querés dar de baja a ${valores.nombre} ${valores.apellido}? Se conservará el historial de tareas asignadas.`
            : `¿Querés dar de alta a ${valores.nombre} ${valores.apellido}?`
        }
        textoConfirmar={modalConfirmacion.tipo === 'dar-de-baja' ? 'Dar de baja' : 'Dar de alta'}
        variante={modalConfirmacion.tipo === 'dar-de-baja' ? 'danger' : 'success'}
        onConfirmar={confirmarAccion}
        onCancelar={cerrarConfirmacion}
      />
    </div>
  );
}

export default FormularioPersonalPage;