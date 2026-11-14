import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate, useRevalidator } from 'react-router';
import { FaPen, FaCamera, FaFloppyDisk, FaCircleInfo, FaKey } from 'react-icons/fa6';
import { actualizarUsuario } from '../../usuarios/services/usuariosService';
import { actualizarSesion } from '../../auth/services/authService';
import { camposDeRol, esEditable, ETIQUETA_CAMPO } from '../../../shared/config/camposPerfilPorRol';
import EncabezadoPagina from '../../../shared/components/EncabezadoPagina';
import '../styles/EditarPerfilPage.css';

const PASSWORD_INICIAL = { actual: '', nueva: '', repetir: '' };

function iniciales(nombre, apellido) {
  const n = (nombre || '').trim()[0] ?? '';
  const a = (apellido || '').trim()[0] ?? '';
  return `${n}${a}`.toUpperCase() || '?';
}

function EditarPerfilPage() {
  const usuarioActual = useOutletContext();
  const navigate = useNavigate();
  const revalidator = useRevalidator();

  const [formData, setFormData] = useState({ nombre: '', apellido: '', telefono: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const [password, setPassword] = useState(PASSWORD_INICIAL);
  const [mensajePassword, setMensajePassword] = useState(null);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  useEffect(() => {
    if (usuarioActual) {
      setFormData({
        nombre: usuarioActual.nombre || '',
        apellido: usuarioActual.apellido || '',
        telefono: usuarioActual.telefono || '',
      });
      setAvatarPreview(usuarioActual.avatar || null);
    }
  }, [usuarioActual]);

  if (!usuarioActual) {
    return <p className="text-secondary">Cargando perfil…</p>;
  }

  const campos = camposDeRol(usuarioActual.rol);
  const puedeEditarTelefono = esEditable(usuarioActual.rol, 'telefono');
  const esOrdenanza = usuarioActual.rol === 'ordenanza';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleCambiarAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes.');
      return;
    }
    if (file.size > 1 * 1024 * 1024) {
      setError('La imagen no puede superar 1 MB.');
      return;
    }
    setError('');

    const reader = new FileReader();
    reader.onload = () => {
      // Redimensionar antes de guardar
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 200;
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setAvatarPreview(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const datosAGuardar = {};

    if (esEditable(usuarioActual.rol, 'nombre')) {
      if (formData.nombre.trim().length < 2) {
        setError('El nombre debe tener al menos 2 caracteres.');
        return;
      }
      datosAGuardar.nombre = formData.nombre.trim();
    }
    if (esEditable(usuarioActual.rol, 'apellido')) {
      if (formData.apellido.trim().length < 2) {
        setError('El apellido debe tener al menos 2 caracteres.');
        return;
      }
      datosAGuardar.apellido = formData.apellido.trim();
    }
    if (puedeEditarTelefono) {
      if (esOrdenanza && !formData.telefono.trim()) {
        setError('El teléfono es obligatorio.');
        return;
      }
      datosAGuardar.telefono = formData.telefono.trim();
    }

    // El avatar se guarda en la misma operación
    if (avatarPreview !== (usuarioActual.avatar ?? null)) {
      datosAGuardar.avatar = avatarPreview;
    }

    setGuardando(true);

    try {
      const actualizado = await actualizarUsuario(usuarioActual.id, datosAGuardar);

      // Actualiza la sesión guardada y refresca el sidebar y el header
      actualizarSesion(actualizado);
      await revalidator.revalidate();
      navigate('/gestor/perfil');
    } catch (err) {
      setError(err.message || 'No se pudo guardar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  const handleChangePassword = (e) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
    if (mensajePassword) setMensajePassword(null);
  };

  const handleGuardarPassword = async (e) => {
    e.preventDefault();

    if (!password.actual) {
      setMensajePassword({ tipo: 'danger', texto: 'Ingresá tu contraseña actual.' });
      return;
    }
    if (password.nueva.length < 6) {
      setMensajePassword({ tipo: 'danger', texto: 'La nueva contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    if (password.nueva !== password.repetir) {
      setMensajePassword({ tipo: 'danger', texto: 'Las contraseñas nuevas no coinciden.' });
      return;
    }

    setGuardandoPassword(true);

    try {
      await actualizarUsuario(usuarioActual.id, {
        passwordActual: password.actual,
        password: password.nueva,
      });
      setPassword(PASSWORD_INICIAL);
      setMensajePassword({ tipo: 'success', texto: 'Tu contraseña se cambió correctamente.' });
    } catch (err) {
      setMensajePassword({ tipo: 'danger', texto: err.message });
    } finally {
      setGuardandoPassword(false);
    }
  };

  return (
    <div className="editar-perfil">
      <EncabezadoPagina
        volver={{ to: '/gestor/perfil', texto: 'Volver a mi perfil' }}
        icono={FaPen}
        titulo="Editar Perfil"
        subtitulo="Aquí podrás editar los datos de tu perfil"
      />

      {error && (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      )}

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <div className="row g-4">
            {/* columna izquierda */}
            <div className="col-12 col-md-4 col-lg-3 text-center">
              <div className="editar-perfil__avatar">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar" />
                ) : (
                  <span>{iniciales(usuarioActual.nombre, usuarioActual.apellido)}</span>
                )}
              </div>

              <label className="editar-perfil__btn-cambiar">
                <FaCamera size={14} />
                Cambiar foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCambiarAvatar}
                  hidden
                />
              </label>
            </div>

            {/* columna derecha */}
            <div className="col-12 col-md-8 col-lg-9">
              <form onSubmit={handleSubmit}>
                {campos.map((campo) => {
                  const editable = esEditable(usuarioActual.rol, campo);
                  const valor = editable
                    ? formData[campo] ?? ''
                    : usuarioActual[campo] ?? '';

                  return (
                    <div key={campo} className="mb-3">
                      <label className="form-label editar-perfil__label">
                        {ETIQUETA_CAMPO[campo]}
                      </label>
                      <input
                        type={campo === 'email' ? 'email' : 'text'}
                        name={campo}
                        className="form-control editar-perfil__input"
                        value={valor}
                        onChange={editable ? handleChange : undefined}
                        disabled={!editable}
                        readOnly={!editable}
                        required={editable && (campo !== 'telefono' || esOrdenanza)}
                      />
                      {!editable && campo === 'usuario' && (
                        <small className="editar-perfil__hint">
                          El nombre de usuario no puede modificarse.
                        </small>
                      )}
                      {!editable && campo !== 'usuario' && (
                        <small className="editar-perfil__hint">
                          Este campo no puede modificarse.
                        </small>
                      )}
                    </div>
                  );
                })}

                <div className="d-flex justify-content-end gap-2 pt-3 mt-2 border-top">
                  <button
                    type="button"
                    className="btn btn-light border"
                    onClick={() => navigate('/gestor/perfil')}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary editar-perfil__btn-guardar"
                    disabled={guardando}
                  >
                    <FaFloppyDisk size={13} /> {guardando ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* cambio de contraseña */}
      <div className="card border-0 shadow-sm mt-3">
        <div className="card-body p-4">
          <h3 className="h5 mb-3 d-flex align-items-center gap-2">
            <FaKey size={16} /> Cambiar contraseña
          </h3>

          {mensajePassword && (
            <div className={`alert alert-${mensajePassword.tipo} mb-3`} role="alert">
              {mensajePassword.texto}
            </div>
          )}

          <form onSubmit={handleGuardarPassword}>
            <div className="row g-3">
              <div className="col-12 col-md-4">
                <label className="form-label editar-perfil__label">Contraseña actual</label>
                <input type="password" name="actual" className="form-control editar-perfil__input"
                  autoComplete="current-password"
                  value={password.actual} onChange={handleChangePassword} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label editar-perfil__label">Nueva contraseña</label>
                <input type="password" name="nueva" className="form-control editar-perfil__input"
                  autoComplete="new-password" placeholder="Mínimo 6 caracteres"
                  value={password.nueva} onChange={handleChangePassword} />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label editar-perfil__label">Repetir nueva contraseña</label>
                <input type="password" name="repetir" className="form-control editar-perfil__input"
                  autoComplete="new-password"
                  value={password.repetir} onChange={handleChangePassword} />
              </div>
            </div>

            <div className="d-flex justify-content-end pt-3 mt-3 border-top">
              <button type="submit" className="btn btn-outline-primary d-inline-flex align-items-center gap-2"
                disabled={guardandoPassword}>
                <FaKey size={13} /> {guardandoPassword ? 'Cambiando…' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="editar-perfil__nota mt-3">
        <FaCircleInfo />
        <span>
          Para modificar tu usuario, correo o DNI, pedile a un Directivo que lo haga desde Gestión de cuentas.
        </span>
      </div>
    </div>
  );
}

export default EditarPerfilPage;