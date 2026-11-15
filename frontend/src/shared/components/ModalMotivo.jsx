import { useState, useEffect } from 'react';
import { FaTriangleExclamation, FaXmark } from 'react-icons/fa6';
import './ModalMotivo.css';

function ModalMotivo({ abierto, titulo, mensaje, placeholder, textoConfirmar = 'Confirmar', onCerrar, onConfirmar }) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (abierto) { setMotivo(''); setError(''); }
  }, [abierto]);

  if (!abierto) return null;

  const manejarSubmit = (e) => {
    e.preventDefault();
    if (!motivo.trim() || motivo.trim().length < 3) {
      setError('Por favor, ingresá un motivo (mínimo 3 letras).');
      return;
    }
    onConfirmar(motivo.trim());
  };

  return (
    <div className="modal-confirmacion-overlay" onClick={onCerrar}>
      <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={manejarSubmit}>
          <div className="modal-confirmacion__body">
            <div className="modal-confirmacion__icono modal-confirmacion__icono--danger">
              <FaTriangleExclamation size={24} />
            </div>
            <h5 className="modal-confirmacion__titulo">{titulo}</h5>
            <p className="modal-confirmacion__mensaje">{mensaje}</p>
            
            <textarea
              className={`form-control mt-3 ${error ? 'is-invalid' : ''}`}
              rows={3}
              placeholder={placeholder || "Escribí el motivo acá..."}
              value={motivo}
              onChange={(e) => { setMotivo(e.target.value); setError(''); }}
            />
            {error && <div className="invalid-feedback">{error}</div>}
          </div>
          <div className="modal-confirmacion__footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-danger">
              {textoConfirmar}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalMotivo;