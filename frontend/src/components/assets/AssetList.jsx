import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';
import AssetForm from './AssetForm';

/**
 * Inventario de activos de información (ISO 27001 — A.8).
 * Muestra los activos de la organización y permite registrar nuevos.
 */
const AssetList = ({ organizationId }) => {
  const [assets, setAssets]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [error, setError]         = useState('');

  const fetchAssets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`/api/assets?organization_id=${organizationId}`);
      setAssets(response.data.data || []);
    } catch (err) {
      setError('Error al cargar los activos. Verifique la conexión con el servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) fetchAssets();
  }, [organizationId]);

  const handleAssetCreated = (newAsset) => {
    setAssets(prev => [newAsset, ...prev]);
    setShowForm(false);
  };

  const getCiaClass = (sum) => {
    if (sum >= 12) return 'risk-high';
    if (sum >= 8)  return 'risk-medium';
    return 'risk-low';
  };

  const getCiaLabel = (sum) => {
    if (sum >= 12) return 'ALTA';
    if (sum >= 8)  return 'MEDIA';
    return 'BAJA';
  };

  return (
    <div className="assets-container">
      <div className="section-header">
        <div>
          <h2>Inventario de Activos</h2>
          <p className="text-secondary text-small" style={{ margin: '0.25rem 0 0' }}>
            Cláusula A.8 — {assets.length} activo{assets.length !== 1 ? 's' : ''} registrado{assets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowForm(prev => !prev)}
          data-testid="toggle-asset-form"
        >
          {showForm ? 'Cancelar' : '+ Registrar Activo'}
        </button>
      </div>

      {showForm && (
        <AssetForm organizationId={organizationId} onSuccess={handleAssetCreated} />
      )}

      {error && <div className="alert-error">{error}</div>}

      {!showForm && (
        <div className="glass-panel">
          {loading ? (
            <div className="loading-container"><p>Cargando activos...</p></div>
          ) : assets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p className="text-secondary" style={{ marginBottom: '1rem' }}>
                No hay activos registrados. Comienza añadiendo tus sistemas y datos críticos.
              </p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                Registrar primer activo
              </button>
            </div>
          ) : (
            <table className="assets-table" data-testid="assets-table">
              <thead>
                <tr>
                  <th>Nombre del Activo</th>
                  <th>Descripción</th>
                  <th>Puntaje C-I-A</th>
                  <th>Criticidad</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const ciaSum = asset.confidentiality_req + asset.integrity_req + asset.availability_req;
                  return (
                    <tr key={asset.id} data-testid={`asset-row-${asset.id}`}>
                      <td>
                        <strong>{asset.name}</strong>
                      </td>
                      <td>
                        <span className="text-secondary text-small">
                          {asset.description || '—'}
                        </span>
                      </td>
                      <td>
                        <span className="badge" style={{ marginRight: '0.25rem' }}>C:{asset.confidentiality_req}</span>
                        <span className="badge" style={{ marginRight: '0.25rem' }}>I:{asset.integrity_req}</span>
                        <span className="badge">A:{asset.availability_req}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${getCiaClass(ciaSum)}`}>
                          {getCiaLabel(ciaSum)} ({ciaSum})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetList;
