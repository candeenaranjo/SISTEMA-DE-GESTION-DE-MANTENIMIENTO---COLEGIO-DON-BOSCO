import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { FaUser, FaPen, FaFloppyDisk, FaCircleInfo, FaUserCheck, FaUserXmark } from 'react-icons/fa6';
import { ETIQUETA_ROL } from '../../../shared/config/MenuPorRol';
import EncabezadoPagina from '../../../shared/components/EncabezadoPagina';
import { obtenerSesion } from '../../auth/services/authService';
import {
    obtenerUsuario,
    obtenerCargos,
    actualizarUsuario,
    darDeBajaUsuario,
    darDeAltaUsuario,
} from '../services/usuariosService';
import '../styles/EditarUsuarioPage.css';

function iniciales(nombre, apellido) {
    const n = (nombre || '').trim()[0] ?? '';
    const a = (apellido || '').trim()[0] ?? '';
    return `${n}${a}`.toUpperCase() || '?';
}

function EditarUsuarioPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const sesion = obtenerSesion();

    const [usuario, setUsuario] = useState(null);
    const [cargos, setCargos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [formData, setFormData] = useState({ usuario: '', email: '', telefono: '', cargo: '', password: '' });
    const [guardando, setGuardando] = useState(false);
    const [mensaje, setMensaje] = useState(null);

    // cargar el usuario y los cargos desde el backend
    useEffect(() => {
        let activo = true;
        setCargando(true);

        Promise.all([obtenerUsuario(id), obtenerCargos()])
            .then(([u, listaCargos]) => {
                if (!activo) return;
                setUsuario(u);
                setCargos(listaCargos.map((c) => c.nombre));
                setFormData({
                    usuario: u.usuario || '',
                    email: u.email || '',
                    telefono: u.telefono || '',
                    cargo: u.cargo || '',
                    password: '',
                });
            })
            .catch(() => activo && setUsuario(null))
            .finally(() => activo && setCargando(false));

        return () => { activo = false; };
    }, [id]);

    if (cargando) {
        return <p className="text-center text-muted py-5">Cargando usuario…</p>;
    }

    if (!usuario) {
        return (
            <div className="container-fluid py-5 text-center">
                <p className="text-muted mb-3">No se encontró el usuario solicitado.</p>
                <Link to="/gestor/usuarios" className="btn btn-primary">
                    Volver al listado
                </Link>
            </div>
        );
    }

    const esDirectivo = usuario.rol === 'directivo';
    const esOrdenanza = usuario.rol === 'ordenanza';
    // La contraseña propia se cambia desde el perfil (pide la actual)
    const esMiCuenta = sesion?.id === usuario.id;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (mensaje) setMensaje(null);
    };

    const handleGuardar = async (e) => {
        e.preventDefault();

        if (esOrdenanza && !formData.telefono.trim()) {
            setMensaje({ tipo: 'danger', texto: 'El teléfono es obligatorio para el personal de Ordenanza.' });
            return;
        }
        if (formData.password && formData.password.length < 6) {
            setMensaje({ tipo: 'danger', texto: 'La nueva contraseña debe tener al menos 6 caracteres.' });
            return;
        }

        setGuardando(true);

        // guardamos los campos editables según el rol
        const datos = {
            nombreUsuario: formData.usuario.trim(),
            email: formData.email.trim(),
        };
        if (esOrdenanza) datos.telefono = formData.telefono.trim();
        if (esDirectivo) datos.cargo = formData.cargo;
        if (formData.password && !esMiCuenta) datos.password = formData.password;

        try {
            const actualizado = await actualizarUsuario(usuario.id, datos);
            setUsuario(actualizado);
            setFormData((f) => ({ ...f, password: '' }));
            setMensaje({ tipo: 'success', texto: 'Los cambios se guardaron correctamente.' });
            setTimeout(() => navigate('/gestor/usuarios'), 900);
        } catch (err) {
            setMensaje({ tipo: 'danger', texto: err.message });
        } finally {
            setGuardando(false);
        }
    };

    const handleCambiarEstado = async () => {
        const nuevoEstado = !usuario.activo;
        const accion = nuevoEstado ? 'dar de alta' : 'dar de baja';
        if (!window.confirm(`¿Estás seguro de ${accion} a ${usuario.nombre} ${usuario.apellido}?`)) return;

        try {
            if (nuevoEstado) {
                setUsuario(await darDeAltaUsuario(usuario.id));
            } else {
                await darDeBajaUsuario(usuario.id);
                setUsuario({ ...usuario, activo: false });
            }
            setMensaje({
                tipo: 'success',
                texto: nuevoEstado ? 'El usuario fue dado de alta.' : 'El usuario fue dado de baja.',
            });
        } catch (err) {
            // Ej: no se puede dar de baja al último Directivo ni la propia cuenta
            setMensaje({ tipo: 'danger', texto: err.message });
        }
    };

    return (
        <div className="editar-usuario">
            <EncabezadoPagina
                volver={{ to: '/gestor/usuarios', texto: 'Volver al listado' }}
                icono={FaPen}
                titulo="Editar Usuario"
                subtitulo="Aquí podrás editar los datos del usuario, darlo de alta o de baja"
            />

            {mensaje && (
                <div className={`alert alert-${mensaje.tipo} mb-3`} role="alert">
                    {mensaje.texto}
                </div>
            )}

            <div className="row g-3">
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <div className="editar-usuario__cabecera">
                                <div className="editar-usuario__avatar">
                                    {iniciales(usuario.nombre, usuario.apellido)}
                                </div>
                                <div>
                                    <h2 className="editar-usuario__nombre">
                                        {usuario.nombre} {usuario.apellido}
                                    </h2>
                                    <span className="editar-usuario__rol">
                                        {ETIQUETA_ROL[usuario.rol] ?? usuario.rol}
                                    </span>
                                    <div className="editar-usuario__usuario">
                                        Usuario: <strong>{usuario.usuario}</strong>
                                    </div>
                                </div>
                            </div>

                            <hr className="my-4" />

                            <form onSubmit={handleGuardar}>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label editar-usuario__label">
                                            Nombre de usuario <span className="text-danger">*</span>
                                        </label>
                                        <input type="text" name="usuario" className="form-control editar-usuario__input"
                                            value={formData.usuario} onChange={handleChange} required />
                                        <small className="editar-usuario__hint">Debe ser único y sin espacios.</small>
                                    </div>

                                    <div className="col-12 col-md-6">
                                        <label className="form-label editar-usuario__label">
                                            E-mail <span className="text-danger">*</span>
                                        </label>
                                        <input type="email" name="email" className="form-control editar-usuario__input"
                                            value={formData.email} onChange={handleChange} required />
                                        <small className="editar-usuario__hint">Debe ser una dirección de correo válida.</small>
                                    </div>

                                    {esOrdenanza && (
                                        <div className="col-12 col-md-6">
                                            <label className="form-label editar-usuario__label">
                                                Teléfono <span className="text-danger">*</span>
                                            </label>
                                            <input type="tel" name="telefono" className="form-control editar-usuario__input"
                                                value={formData.telefono} onChange={handleChange}
                                                placeholder="Ej: 2664 123456" required />
                                            <small className="editar-usuario__hint">Ej: 2664 123456</small>
                                        </div>
                                    )}

                                    {esDirectivo && (
                                        <div className="col-12 col-md-6">
                                            <label className="form-label editar-usuario__label">
                                                Cargo <span className="text-danger">*</span>
                                            </label>
                                            <select name="cargo" className="form-select editar-usuario__input"
                                                value={formData.cargo} onChange={handleChange} required>
                                                <option value="">Seleccioná un cargo</option>
                                                {cargos.map((c) => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* restablecer contraseña (no aplica a la cuenta propia) */}
                                    {!esMiCuenta && (
                                        <div className="col-12 col-md-6">
                                            <label className="form-label editar-usuario__label">
                                                Nueva contraseña
                                            </label>
                                            <input type="text" name="password" className="form-control editar-usuario__input"
                                                value={formData.password} onChange={handleChange}
                                                autoComplete="off" placeholder="Dejar vacío para no cambiarla" />
                                            <small className="editar-usuario__hint">
                                                Sirve para restablecer el acceso si el usuario la olvidó.
                                            </small>
                                        </div>
                                    )}
                                </div>

                                <div className="editar-usuario__datos-info">
                                    <h6 className="editar-usuario__datos-titulo">
                                        <FaUser size={14} /> Datos del usuario
                                    </h6>
                                    <div className="row g-3">
                                        <div className="col-6 col-md-3">
                                            <small className="editar-usuario__dato-label">Nombre</small>
                                            <div className="editar-usuario__dato-valor">{usuario.nombre}</div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <small className="editar-usuario__dato-label">Apellido</small>
                                            <div className="editar-usuario__dato-valor">{usuario.apellido}</div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <small className="editar-usuario__dato-label">DNI</small>
                                            <div className="editar-usuario__dato-valor">{usuario.dni}</div>
                                        </div>
                                        <div className="col-6 col-md-3">
                                            <small className="editar-usuario__dato-label">E-mail</small>
                                            <div className="editar-usuario__dato-valor editar-usuario__dato-valor--email">
                                                {usuario.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm">
                        <div className="card-body p-4">
                            <h6 className="editar-usuario__seccion-titulo">Estado de la cuenta</h6>
                            <span className={`editar-usuario__estado ${usuario.activo
                                ? 'editar-usuario__estado--activo'
                                : 'editar-usuario__estado--inactivo'}`}>
                                <span className="editar-usuario__estado-punto" />
                                {usuario.activo ? 'Activa' : 'Inactiva'}
                            </span>

                            <hr className="my-4" />

                            <h6 className="editar-usuario__seccion-titulo">Acciones</h6>

                            <button type="button"
                                className="btn btn-primary w-100 mb-2 d-inline-flex align-items-center justify-content-center gap-2 editar-usuario__btn-guardar"
                                onClick={handleGuardar} disabled={guardando}>
                                <FaFloppyDisk size={14} />
                                {guardando ? 'Guardando…' : 'Guardar cambios'}
                            </button>

                            <button type="button"
                                className="btn btn-outline-primary w-100 mb-2 d-inline-flex align-items-center justify-content-center gap-2"
                                onClick={handleCambiarEstado} disabled={usuario.activo}>
                                <FaUserCheck size={14} /> Dar de alta
                            </button>

                            <button type="button"
                                className="btn btn-outline-danger w-100 mb-3 d-inline-flex align-items-center justify-content-center gap-2"
                                onClick={handleCambiarEstado} disabled={!usuario.activo || esMiCuenta}>
                                <FaUserXmark size={14} /> Dar de baja
                            </button>

                            <div className="editar-usuario__nota">
                                <FaCircleInfo />
                                <span>
                                    Al dar de baja, el usuario no podrá acceder al sistema y su
                                    cuenta quedará inactiva. Podés volver a darlo de alta en
                                    cualquier momento.
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EditarUsuarioPage;