import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';
import RiskForm from './RiskForm';

/**
 * Hub de evaluación de riesgos (ISO 27001 — Cláusula 6.1.2).
 * Permite seleccionar un activo y registrar amenazas/vulnerabilidades.
 * Muestra la matriz de riesgos ordenada por nivel de riesgo descendente.
 */
const RiskAssessment = ({ organizationId }) => {
  const [assets, setAssets]             = useState([]);
  const [risks, setRisks]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [error, setError]               = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [assetsRes, risksRes] = await Promise.all([
        axios.get(`/api/assets?organization_id=${organizationId}`),
        axios.get(`/api/risks?organization_id=${organizationId}`),
      ]);
      setAssets(assetsRes.data.data || []);
      setRisks(risksRes.data.data || []);
    } catch (err) {
      setError('Error al cargar los datos. Verifique la conexión con el servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) fetchData();
  }, [organizationId]);

  const handleRiskCreated = (newRisk) => {
    const asset = assets.find(a => a.id === newRisk.asset_id);
    const enriched = { ...newRisk, asset_name: asset?.name || 'Desconocido' };
    setRisks(prev => [enriched, ...prev].sort((a, b) => b.risk_level - a.risk_level));
    setSelectedAsset(null);
  };

  const riskClass = (level) => {
    if (level >= 15) return 'risk-high';
    if (level >= 8)  return 'risk-medium';
    return 'risk-low';
  };

  const treatmentLabel = (d) => ({
    MITIGATE: 'Mitigar',
    ACCEPT:   'Aceptar',
    TRANSFER: 'Transferir',
    AVOID:    'Evitar',
  }[d] || d);

  return (
    <div className="risks-container">
      <div className="section-header">
        <div>
          <h2>Evaluación de Riesgos</h2>
          <p className="text-secondary text-small" style={{ margin: '0.25rem 0 0' }}>
            Cláusula 6.1.2 — {risks.length} riesgo{risks.length !== 1 ? 's' : ''} registrado{risks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {error && <div className="alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '2rem' }}>

        {/* Panel izquierdo: selector de activos */}
        <div className="glass-panel" style={{ alignSelf: 'start' }}>
          <h3 style={{ margin: '0 0 0.5rem' }}>Seleccionar activo</h3>
          <p className="text-small text-secondary" style={{ marginBottom: '1rem' }}>
            Elige un activo para registrar una amenaza.
          </p>

          {loading ? (
            <p>Cargando activos...</p>
          ) : assets.length === 0 ? (
            <p className="text-small text-secondary" style={{ color: 'var(--danger)' }}>
              No hay activos. Regístralos primero en "Activos".
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {assets.map(asset => (
                <li key={asset.id} style={{ marginBottom: '0.5rem' }}>
                  <button
                    className={`btn-primary ${selectedAsset === asset.id ? '' : 'outline'} full-width`}
                    onClick={() => setSelectedAsset(selectedAsset === asset.id ? null : asset.id)}
                    style={{ textAlign: 'left' }}
                  >
                    {asset.name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Panel derecho: formulario o matriz */}
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
              <h3 style={{ margin: '0 0 1rem' }}>Matriz de riesgos</h3>
              {loading ? (
                <p>Cargando riesgos...</p>
              ) : risks.length === 0 ? (
                <p className="text-secondary">
                  Aún no se han evaluado riesgos. Selecciona un activo a la izquierda para comenzar.
                </p>
              ) : (
                <table className="assets-table" data-testid="risks-table">
                  <thead>
                    <tr>
                      <th>Activo</th>
                      <th>Amenaza / Vulnerabilidad</th>
                      <th>P × I</th>
                      <th>Nivel</th>
                      <th>Tratamiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {risks.map(risk => (
                      <tr key={risk.id} data-testid={`risk-row-${risk.id}`}>
                        <td><strong>{risk.asset_name}</strong></td>
                        <td>
                          <div><strong>A:</strong> {risk.threat}</div>
                          <div className="text-secondary text-small"><strong>V:</strong> {risk.vulnerability}</div>
                        </td>
                        <td className="text-secondary text-small">
                          {risk.likelihood} × {risk.impact}
                        </td>
                        <td>
                          <span className={`status-badge ${riskClass(risk.risk_level)}`}>
                            {risk.risk_level}
                          </span>
                        </td>
                        <td>
                          <span className="badge">{treatmentLabel(risk.treatment_decision)}</span>
                        </td>
                      </tr>
                    ))}
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
