import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { FaUser, FaPlus, FaCircleInfo, FaWandMagicSparkles } from 'react-icons/fa6';
import { crearUsuario, obtenerCargos } from '../services/usuariosService';
import '../styles/NuevoUsuarioPage.css';
import EncabezadoPage from '../../../shared/components/EncabezadoPagina';

const ROLES = [
  { valor: 'ordenanza', texto: 'Ordenanza' },
  { valor: 'directivo', texto: 'Directivo' },
  { valor: 'jefeMantenimiento', texto: 'Jefe de Mantenimiento' },
];
const FORM_INICIAL = {
  nombre: '', apellido: '', usuario: '', email: '', dni: '',
  rol: '', cargo: '', telefono: '', password: '',
};

// Contraseña inicial aleatoria (sin caracteres que se confunden: 0/O, 1/l/I)
function generarPassword() {
  const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => caracteres[b % caracteres.length]).join('');
}

function NuevoUsuarioPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(FORM_INICIAL);
  const [cargos, setCargos] = useState([]);
  const [error, setError] = useState('');
  const [creando, setCreando] = useState(false);

  const esDirectivo = formData.rol === 'directivo';
  const esOrdenanza = formData.rol === 'ordenanza';

  // Los cargos salen de la base (tabla cargos)
  useEffect(() => {
    obtenerCargos()
      .then((lista) => setCargos(lista.map((c) => c.nombre)))
      .catch((err) => setError(err.message));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => {
      const nuevo = { ...f, [name]: value };
      if (name === 'rol') {
        // Cada rol tiene sus datos propios: cargo (Directivo) y teléfono (Ordenanza)
        if (value !== 'directivo') nuevo.cargo = '';
        if (value !== 'ordenanza') nuevo.telefono = '';
      }
      return nuevo;
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.nombre.trim() || !formData.apellido.trim()) {
      setError('Nombre y apellido son obligatorios.');
      return;
    }
    if (!formData.usuario.trim() || formData.usuario.includes(' ')) {
      setError('El nombre de usuario es obligatorio y no puede tener espacios.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('El correo electrónico no es válido.');
      return;
    }
    const dni = formData.dni.replace(/\./g, '');
    if (!/^\d{7,10}$/.test(dni)) {
      setError('El DNI debe tener entre 7 y 10 números.');
      return;
    }
    if (!formData.rol) {
      setError('Tenés que seleccionar un rol.');
      return;
    }
    if (esDirectivo && !formData.cargo) {
      setError('El cargo es obligatorio para un Directivo.');
      return;
    }
    if (esOrdenanza && !formData.telefono.trim()) {
      setError('El teléfono es obligatorio para el personal de Ordenanza.');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña inicial debe tener al menos 6 caracteres.');
      return;
    }

    setCreando(true);

    try {
      const datos = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        nombreUsuario: formData.usuario.trim().toLowerCase(),
        email: formData.email.trim().toLowerCase(),
        dni,
        rol: formData.rol,
        password: formData.password,
      };
      if (esDirectivo) datos.cargo = formData.cargo;
      if (esOrdenanza) datos.telefono = formData.telefono.trim();

      // Duplicados de usuario, correo o DNI los informa el backend (409)
      await crearUsuario(datos);
      navigate('/gestor/usuarios', { replace: true });
    } catch (err) {
      setError(err.message || 'No se pudo crear la cuenta.');
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="nuevo-usuario">
      <EncabezadoPage
        volver={{ to: '/gestor/usuarios', texto: 'Volver al listado' }}
        icono={FaUser}
        titulo="Agregar Nuevo Usuario"
        subtitulo="Completá los datos para crear una nueva cuenta de usuario en el sistema"
      />

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <h3 className="nuevo-usuario__seccion-titulo">
            <FaUser /> Datos de la cuenta
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-12 col-md-6">
                <label className="form-label nuevo-usuario__label">
                  Nombre <span className="text-danger">*</span>
                </label>
                <input type="text" name="nombre" className="form-control nuevo-usuario__input"
                  placeholder="Ej: María" value={formData.nombre} onChange={handleChange} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label nuevo-usuario__label">
                  Apellido <span className="text-danger">*</span>
                </label>
                <input type="text" name="apellido" className="form-control nuevo-usuario__input"
                  placeholder="Ej: López" value={formData.apellido} onChange={handleChange} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label nuevo-usuario__label">
                  Nombre de usuario <span className="text-danger">*</span>
                </label>
                <input type="text" name="usuario" className="form-control nuevo-usuario__input"
                  placeholder="Ej: mlopez" value={formData.usuario} onChange={handleChange} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label nuevo-usuario__label">
                  Correo electrónico <span className="text-danger">*</span>
                </label>
                <input type="email" name="email" className="form-control nuevo-usuario__input"
                  placeholder="Ej: maria.lopez@colegiodonbosco.edu.ar"
                  value={formData.email} onChange={handleChange} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label nuevo-usuario__label">
                  DNI <span className="text-danger">*</span>
                </label>
                <input type="text" name="dni" className="form-control nuevo-usuario__input"
                  placeholder="Ej: 32.987.456" value={formData.dni} onChange={handleChange} />
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label nuevo-usuario__label">
                  Rol <span className="text-danger">*</span>
                </label>
                <select name="rol" className="form-select nuevo-usuario__input"
                  value={formData.rol} onChange={handleChange}>
                  <option value="">Seleccionar rol</option>
                  {ROLES.map((r) => (
                    <option key={r.valor} value={r.valor}>{r.texto}</option>
                  ))}
                </select>
              </div>

              {/* cargo (solo Directivo) */}
              {esDirectivo && (
                <div className="col-12 col-md-6">
                  <label className="form-label nuevo-usuario__label">
                    Cargo <span className="text-danger">*</span>
                  </label>
                  <select name="cargo" className="form-select nuevo-usuario__input"
                    value={formData.cargo} onChange={handleChange}>
                    <option value="">Seleccionar cargo</option>
                    {cargos.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* teléfono (solo Ordenanza) */}
              {esOrdenanza && (
                <div className="col-12 col-md-6">
                  <label className="form-label nuevo-usuario__label">
                    Teléfono <span className="text-danger">*</span>
                  </label>
                  <input type="tel" name="telefono" className="form-control nuevo-usuario__input"
                    placeholder="Ej: 2664 123456" value={formData.telefono} onChange={handleChange} />
                </div>
              )}

              {/* contraseña inicial */}
              <div className="col-12 col-md-6">
                <label className="form-label nuevo-usuario__label">
                  Contraseña inicial <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input type="text" name="password" className="form-control nuevo-usuario__input"
                    placeholder="Mínimo 6 caracteres" autoComplete="off"
                    value={formData.password} onChange={handleChange} />
                  <button type="button" className="btn btn-outline-primary"
                    onClick={() => setFormData((f) => ({ ...f, password: generarPassword() }))}>
                    <FaWandMagicSparkles size={13} /> Generar
                  </button>
                </div>
              </div>
            </div>

            <div className="nuevo-usuario__nota mt-4">
              <FaCircleInfo />
              <span>
                El sistema no envía correos: entregale al usuario su contraseña inicial.
                Podrá cambiarla desde su perfil.
              </span>
            </div>

            <div className="d-flex justify-content-end gap-2 pt-4 mt-2 border-top">
              <button type="button" className="btn btn-outline-primary nuevo-usuario__btn-cancelar"
                onClick={() => navigate('/gestor/usuarios')}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary nuevo-usuario__btn-crear" disabled={creando}>
                <FaPlus size={13} /> {creando ? 'Creando…' : 'Crear cuenta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NuevoUsuarioPage;