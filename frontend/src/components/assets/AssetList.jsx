import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';
import AssetForm from './AssetForm';

/**
 * Componente que muestra el inventario de activos de informacion.
 * Permite visualizar y añadir nuevos activos a la organizacion.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.organizationId - El ID de la organizacion actual.
 * @returns {JSX.Element} El componente de inventario de activos.
 */
const AssetList = ({ organizationId }) => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  /**
   * Obtiene la lista de activos desde el BFF (Backend for Frontend).
   */
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:4000/api/assets?organization_id=${organizationId}`);
      setAssets(response.data.data);
    } catch (err) {
      setError('Error al cargar los activos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Efecto secundario para cargar activos cuando cambia la organizacion
  useEffect(() => {
    fetchAssets();
  }, [organizationId]);

  /**
   * Maneja el evento de creacion exitosa de un nuevo activo.
   * Agrega el activo al estado local para evitar una recarga completa.
   *
   * @param {Object} newAsset - El activo recien creado.
   */
  const handleAssetCreated = (newAsset) => {
    setAssets([newAsset, ...assets]);
    setShowForm(false);
  };

  return (
    <div className="assets-container">
      <div className="section-header">
        <h2>Inventario de Activos</h2>
        <button 
          className="btn-primary" 
          onClick={() => setShowForm(!showForm)}
          data-testid="toggle-asset-form"
        >
          {showForm ? 'Cancelar' : 'Registrar Nuevo Activo'}
        </button>
      </div>

      {showForm && (
        <AssetForm 
          organizationId={organizationId} 
          onSuccess={handleAssetCreated} 
        />
      )}

      {error && <div className="alert-error">{error}</div>}

      {!showForm && (
        <div className="glass-panel">
          {loading ? (
            <p>Cargando activos...</p>
          ) : assets.length === 0 ? (
            <p className="subtitle text-center">No hay activos registrados aún. Comienza añadiendo tus sistemas y datos críticos.</p>
          ) : (
            <table className="assets-table" data-testid="assets-table">
              <thead>
                <tr>
                  <th>Nombre del Activo</th>
                  <th>Puntaje C-I-A</th>
                  <th>Criticidad</th>
                </tr>
              </thead>
              <tbody>
                {assets.map(asset => {
                  const ciaSum = asset.confidentiality_req + asset.integrity_req + asset.availability_req;
                  const criticalityClass = ciaSum >= 12 ? 'risk-high' : ciaSum >= 8 ? 'risk-medium' : 'risk-low';
                  const criticalityLabel = ciaSum >= 12 ? 'ALTA' : ciaSum >= 8 ? 'MEDIA' : 'BAJA';

                  return (
                    <tr key={asset.id} data-testid={`asset-row-${asset.id}`}>
                      <td>
                        <strong>{asset.name}</strong>
                        {asset.description && <p className="text-small text-secondary">{asset.description}</p>}
                      </td>
                      <td>
                        <span className="badge">C:{asset.confidentiality_req}</span>
                        <span className="badge">I:{asset.integrity_req}</span>
                        <span className="badge">A:{asset.availability_req}</span>
                      </td>
                      <td>
                        <span className={`status-badge risk-score ${criticalityClass}`}>
                          {criticalityLabel} ({ciaSum})
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
