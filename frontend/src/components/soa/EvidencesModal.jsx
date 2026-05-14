import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';

/**
 * Modal para gestionar evidencias (Cláusula 7.5) vinculadas a un control SoA.
 * Permite visualizar archivos subidos previamente y subir nuevos.
 *
 * @param {Object} props
 * @param {Object} props.control - Datos del control seleccionado.
 * @param {string} props.soaId - ID del registro SoA.
 * @param {Function} props.onClose - Callback para cerrar el modal.
 */
const EvidencesModal = ({ control, soaId, onClose }) => {
  const [evidences, setEvidences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    fetchEvidences();
  }, [soaId]);

  const fetchEvidences = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/evidences/${soaId}`);
      setEvidences(response.data.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las evidencias.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Por favor, selecciona un archivo primero.');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('soa_id', soaId);

    try {
      await axios.post('/api/evidences', formData);
      setFile(null);
      // Recargar lista
      fetchEvidences();
    } catch (err) {
      console.error(err);
      setError('Error al subir el archivo.');
    } finally {
      setUploading(false);
      // Limpiar input file
      document.getElementById('evidence-upload').value = '';
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '1rem', borderTop: '4px solid var(--accent)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Evidencias: {control.control_number}</h3>
        <button onClick={onClose} className="btn-link" style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'var(--text)' }}>
          Cerrar
        </button>
      </div>
      
      <p className="text-small text-secondary mb-2">Cláusula 7.5: Información documentada para el control {control.control_name}</p>

      {error && <div className="alert-error">{error}</div>}

      <div style={{ marginBottom: '2rem' }}>
        <h4>Archivos Subidos</h4>
        {loading ? (
          <p>Cargando evidencias...</p>
        ) : evidences.length === 0 ? (
          <p className="subtitle">No hay evidencias registradas para este control.</p>
        ) : (
          <ul style={{ paddingLeft: '1rem' }}>
            {evidences.map(ev => (
              <li key={ev.id} style={{ marginBottom: '0.5rem' }}>
                <a 
                  href={`http://localhost:4000${ev.file_url}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 'bold' }}
                >
                  📄 {ev.document_name}
                </a>
                <span className="text-small text-secondary ml-1">
                  (Subido por {ev.uploader_name} el {new Date(ev.uploaded_at).toLocaleDateString()})
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h4>Subir Nueva Evidencia</h4>
        <form onSubmit={handleUpload} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '1rem' }}>
          <input 
            type="file" 
            id="evidence-upload"
            onChange={handleFileChange} 
            accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
          />
          <button type="submit" className="btn-primary" disabled={uploading || !file}>
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EvidencesModal;
