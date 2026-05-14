import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';
import RiskForm from './RiskForm';

/**
 * Componente principal para la evaluacion de riesgos.
 * Permite seleccionar un activo y asignarle amenazas y vulnerabilidades,
 * y muestra la matriz de riesgos general de la organizacion.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.organizationId - El ID de la organizacion.
 * @returns {JSX.Element} El hub de evaluacion de riesgos.
 */
const RiskAssessment = ({ organizationId }) => {
  const [assets, setAssets] = useState([]);
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [error, setError] = useState('');

  /**
   * Obtiene la lista de activos y riesgos desde el BFF en paralelo.
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [assetsRes, risksRes] = await Promise.all([
        axios.get(`http://localhost:4000/api/assets?organization_id=${organizationId}`),
        axios.get(`http://localhost:4000/api/risks?organization_id=${organizationId}`)
      ]);
      setAssets(assetsRes.data.data);
      setRisks(risksRes.data.data);
    } catch (err) {
      setError('Error al cargar los datos de riesgo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [organizationId]);

  /**
   * Maneja la creacion exitosa de un nuevo riesgo, actualizando la lista en memoria.
   *
   * @param {Object} newRisk - El nuevo riesgo evaluado.
   */
  const handleRiskCreated = (newRisk) => {
    const asset = assets.find(a => a.id === newRisk.asset_id);
    setRisks([{ ...newRisk, asset_name: asset ? asset.name : 'Desconocido' }, ...risks]);
    setSelectedAsset(null);
  };

  return (
    <div className="risks-container">
      <div className="section-header">
        <h2>Evaluación de Riesgos (Cláusula 6.1.2)</h2>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        
        {/* COLUMNA IZQUIERDA: Selector de Activos */}
        <div className="glass-panel">
          <h3>Inventario de Activos</h3>
          <p className="text-small text-secondary">Selecciona un activo para evaluar sus riesgos.</p>
          {loading ? <p>Cargando...</p> : (
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {assets.map(asset => (
                <li key={asset.id} style={{ marginBottom: '0.5rem' }}>
                  <button 
                    className={`btn-primary full-width ${selectedAsset === asset.id ? '' : 'outline'}`}
                    onClick={() => setSelectedAsset(selectedAsset === asset.id ? null : asset.id)}
                    style={{ textAlign: 'left', padding: '0.75rem' }}
                  >
                    {asset.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {assets.length === 0 && !loading && (
            <p className="text-small text-danger">No hay activos disponibles. Por favor, registre activos primero.</p>
          )}
        </div>

        {/* COLUMNA DERECHA: Formulario o Matriz de Riesgos */}
        <div>
          {selectedAsset ? (
            <RiskForm 
              organizationId={organizationId} 
              assetId={selectedAsset}
              onSuccess={handleRiskCreated}
              onCancel={() => setSelectedAsset(null)}
            />
          ) : (
            <div className="glass-panel">
              <h3>Matriz de Riesgos</h3>
              {risks.length === 0 ? (
                <p className="subtitle">Aún no se han evaluado riesgos. Selecciona un activo para comenzar.</p>
              ) : (
                <table className="assets-table" data-testid="risks-table">
                  <thead>
                    <tr>
                      <th>Activo</th>
                      <th>Amenaza / Vulnerabilidad</th>
                      <th>Nivel de Riesgo</th>
                      <th>Tratamiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map(risk => {
                      const isCritical = risk.risk_level >= 15;
                      const isMedium = risk.risk_level >= 8 && risk.risk_level < 15;
                      const riskClass = isCritical ? 'risk-high' : isMedium ? 'risk-medium' : 'risk-low';

                      return (
                        <tr key={risk.id} data-testid={`risk-row-${risk.id}`}>
                          <td>{risk.asset_name}</td>
                          <td>
                            <strong>A:</strong> {risk.threat}<br/>
                            <strong>V:</strong> {risk.vulnerability}
                          </td>
                          <td>
                            <span className={`status-badge risk-score ${riskClass}`}>
                              {risk.risk_level}
                            </span>
                            <div className="text-small text-secondary mt-1">
                              (P:{risk.likelihood} × I:{risk.impact})
                            </div>
                          </td>
                          <td>
                            <span className="badge">{risk.treatment_decision}</span>
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

      </div>
    </div>
  );
};

export default RiskAssessment;
