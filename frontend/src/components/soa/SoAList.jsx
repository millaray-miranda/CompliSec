import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';
import SoAForm from './SoAForm';
import EvidencesModal from './EvidencesModal';

/**
 * Componente principal para visualizar la Declaracion de Aplicabilidad (SoA).
 * Muestra el catalogo de controles del Anexo A y su estado.
 *
 * @param {Object} props
 * @param {string} props.organizationId - ID de la organizacion.
 */
const SoAList = ({ organizationId }) => {
  const [controls, setControls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedControl, setSelectedControl] = useState(null);
  const [viewingEvidences, setViewingEvidences] = useState(null);

  const fetchSoA = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/soa?organization_id=${organizationId}`);
      setControls(response.data.data);
    } catch (err) {
      setError('Error al cargar la Declaración de Aplicabilidad.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoA();
  }, [organizationId]);

  const handleSoAUpdated = (updatedSoA) => {
    setControls(controls.map(c => 
      c.control_id === updatedSoA.control_id 
        ? { 
            ...c, 
            soa_id: updatedSoA.id,
            is_applicable: updatedSoA.is_applicable,
            justification: updatedSoA.justification,
            implementation_status: updatedSoA.implementation_status
          } 
        : c
    ));
    setSelectedControl(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'FULLY_IMPLEMENTED': return <span className="status-badge status-implemented">Implementado</span>;
      case 'PARTIAL': return <span className="status-badge status-partial">Parcial</span>;
      case 'NOT_IMPLEMENTED': return <span className="status-badge status-missing">Faltante</span>;
      default: return <span className="badge">No Evaluado</span>;
    }
  };

  return (
    <div className="soa-container">
      <div className="section-header">
        <h2>Declaración de Aplicabilidad (SoA)</h2>
        <p className="subtitle">Gestione los controles del Anexo A requeridos para su SGSI.</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {selectedControl && (
        <div style={{ marginBottom: '2rem' }}>
          <SoAForm 
            control={selectedControl} 
            organizationId={organizationId}
            onSuccess={handleSoAUpdated}
            onCancel={() => setSelectedControl(null)}
          />
        </div>
      )}

      {viewingEvidences && (
        <div style={{ marginBottom: '2rem' }}>
          <EvidencesModal
            control={viewingEvidences}
            soaId={viewingEvidences.soa_id}
            onClose={() => setViewingEvidences(null)}
          />
        </div>
      )}

      <div className="glass-panel">
        {loading ? (
          <p>Cargando controles...</p>
        ) : controls.length === 0 ? (
          <p className="subtitle text-center">No se encontró el catálogo de controles. Revise la inicialización del servidor.</p>
        ) : (
          <table className="assets-table" data-testid="soa-table">
            <thead>
              <tr>
                <th>Control</th>
                <th>Dominio</th>
                <th>Aplicable</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {controls.map(control => (
                <tr key={control.control_id} data-testid={`soa-row-${control.control_number}`}>
                  <td>
                    <strong>{control.control_number}</strong> {control.control_name}
                  </td>
                  <td>{control.control_domain}</td>
                  <td>
                    {control.soa_id ? (
                      control.is_applicable ? (
                        <span className="badge" style={{ background: 'rgba(0, 255, 0, 0.1)', color: 'var(--accent)' }}>Sí</span>
                      ) : (
                        <span className="badge" style={{ background: 'rgba(255, 0, 0, 0.1)', color: 'var(--danger)' }}>No</span>
                      )
                    ) : (
                      <span className="badge">Pendiente</span>
                    )}
                  </td>
                  <td>
                    {control.soa_id && control.is_applicable ? getStatusBadge(control.implementation_status) : '-'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-primary outline" 
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => {
                          setSelectedControl(control);
                          setViewingEvidences(null);
                        }}
                      >
                        Evaluar
                      </button>
                      {control.soa_id && (
                        <button 
                          className="btn-primary" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', background: 'var(--text-light)', borderColor: 'var(--text-light)' }}
                          onClick={() => {
                            setViewingEvidences(control);
                            setSelectedControl(null);
                          }}
                        >
                          Evidencias
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SoAList;
