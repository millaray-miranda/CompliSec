import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';

/**
 * Dashboard principal de CompliSec.
 * Carga datos reales desde el BFF: riesgos, activos y controles SoA.
 *
 * @param {Object}   props
 * @param {string}   props.organizationId - ID de la organización del usuario.
 * @param {Function} props.onNavigate     - Cambia la vista en App.jsx.
 */
const Dashboard = ({ organizationId, onNavigate }) => {
  const [risks, setRisks]       = useState([]);
  const [assets, setAssets]     = useState([]);
  const [controls, setControls] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [risksRes, assetsRes, soaRes] = await Promise.all([
          axios.get(`/api/risks?organization_id=${organizationId}`),
          axios.get(`/api/assets?organization_id=${organizationId}`),
          axios.get(`/api/soa?organization_id=${organizationId}`),
        ]);
        setRisks(risksRes.data.data || []);
        setAssets(assetsRes.data.data || []);
        setControls(soaRes.data.data || []);
      } catch (err) {
        console.error(err);
        setError('Error al cargar los datos del dashboard.');
      } finally {
        setLoading(false);
      }
    };

    if (organizationId) fetchAll();
  }, [organizationId]);

  // ── Métricas calculadas ─────────────────────────────────────────────────
  const criticalRisks = risks.filter(r => r.risk_level >= 15).length;
  const highRisks     = risks.filter(r => r.risk_level >= 8 && r.risk_level < 15).length;
  const lowRisks      = risks.filter(r => r.risk_level < 8).length;

  const totalControls       = controls.length;
  const implementedControls = controls.filter(c => c.implementation_status === 'FULLY_IMPLEMENTED').length;
  const partialControls     = controls.filter(c => c.implementation_status === 'PARTIAL').length;
  const pendingControls     = controls.filter(c => c.soa_id && c.implementation_status === 'NOT_IMPLEMENTED').length;
  const compliancePct       = totalControls > 0
    ? Math.round((implementedControls / totalControls) * 100)
    : 0;

  // ── Helpers de color ────────────────────────────────────────────────────
  const riskClass = (level) => {
    if (level >= 15) return 'risk-high';
    if (level >= 8)  return 'risk-medium';
    return 'risk-low';
  };

  const ciaClass = (sum) => {
    if (sum >= 12) return 'risk-high';
    if (sum >= 8)  return 'risk-medium';
    return 'risk-low';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h2>Panel de Control</h2>
        <span className="badge" style={{ fontSize: '0.85rem', padding: '0.4rem 0.75rem' }}>
          ISO/IEC 27001:2022
        </span>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {/* ── KPIs ── */}
      <div className="dashboard-summary">
        <div className="glass-panel summary-card">
          <div className="big-number" style={{ color: 'var(--accent)' }}>
            {compliancePct}%
          </div>
          <div className="card-label">Cumplimiento general</div>
        </div>

        <div className="glass-panel summary-card">
          <div className="big-number" style={{ color: 'var(--success)' }}>
            {implementedControls}
          </div>
          <div className="card-label">Controles implementados</div>
        </div>

        <div className="glass-panel summary-card">
          <div className="big-number" style={{ color: 'var(--warning)' }}>
            {partialControls}
          </div>
          <div className="card-label">Controles parciales</div>
        </div>

        <div className="glass-panel summary-card">
          <div className="big-number" style={{ color: 'var(--danger)' }}>
            {criticalRisks}
          </div>
          <div className="card-label">Riesgos críticos</div>
        </div>

        <div className="glass-panel summary-card">
          <div className="big-number" style={{ color: 'var(--text-primary)' }}>
            {assets.length}
          </div>
          <div className="card-label">Activos registrados</div>
        </div>
      </div>

      {/* ── Barra de cumplimiento ── */}
      <div className="glass-panel" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontWeight: 600 }}>Progreso global de implementación</span>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {implementedControls} de {totalControls} controles
          </span>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '9999px', height: '10px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${compliancePct}%`,
              height: '100%',
              background: compliancePct >= 70
                ? 'var(--success)'
                : compliancePct >= 40
                  ? 'var(--warning)'
                  : 'var(--danger)',
              borderRadius: '9999px',
              transition: 'width 0.6s ease',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>✅ Implementados: <strong style={{ color: 'var(--success)' }}>{implementedControls}</strong></span>
          <span>🟡 Parciales: <strong style={{ color: 'var(--warning)' }}>{partialControls}</strong></span>
          <span>❌ Pendientes: <strong style={{ color: 'var(--danger)' }}>{pendingControls}</strong></span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

        {/* ── Top riesgos ── */}
        <div className="glass-panel">
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>⚠️ Riesgos prioritarios</h3>
            <button
              className="btn-primary outline"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => onNavigate('risks')}
            >
              Ver todos
            </button>
          </div>

          {risks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p className="text-secondary">No hay riesgos evaluados aún.</p>
              <button className="btn-primary" onClick={() => onNavigate('risks')}>
                Evaluar primer riesgo
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {risks.slice(0, 5).map(risk => (
                <div
                  key={risk.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.75rem',
                    background: 'rgba(0,0,0,0.15)',
                    borderRadius: '0.5rem',
                    gap: '1rem',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {risk.asset_name}
                    </div>
                    <div className="text-secondary text-small">{risk.threat}</div>
                  </div>
                  <span className={`status-badge ${riskClass(risk.risk_level)}`}>
                    {risk.risk_level}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Activos recientes ── */}
        <div className="glass-panel">
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>🗃️ Activos recientes</h3>
            <button
              className="btn-primary outline"
              style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
              onClick={() => onNavigate('assets')}
            >
              Ver todos
            </button>
          </div>

          {assets.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p className="text-secondary">No hay activos registrados.</p>
              <button className="btn-primary" onClick={() => onNavigate('assets')}>
                Registrar primer activo
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {assets.slice(0, 5).map(asset => {
                const ciaSum = asset.confidentiality_req + asset.integrity_req + asset.availability_req;
                return (
                  <div
                    key={asset.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.75rem',
                      background: 'rgba(0,0,0,0.15)',
                      borderRadius: '0.5rem',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {asset.name}
                      </div>
                      <div className="text-secondary text-small">
                        C:{asset.confidentiality_req} I:{asset.integrity_req} A:{asset.availability_req}
                      </div>
                    </div>
                    <span className={`status-badge ${ciaClass(ciaSum)}`}>
                      CIA: {ciaSum}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Resumen de riesgo ── */}
        <div className="glass-panel">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>📊 Distribución de riesgos</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {[
              { label: 'Críticos (≥15)',  count: criticalRisks, color: 'var(--danger)'  },
              { label: 'Altos (8–14)',    count: highRisks,     color: 'var(--warning)' },
              { label: 'Bajos (<8)',      count: lowRisks,      color: 'var(--success)' },
            ].map(({ label, count, color }) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  background: 'rgba(0,0,0,0.2)',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{count}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Accesos rápidos ── */}
        <div className="glass-panel">
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>🚀 Acciones rápidas</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Registrar nuevo activo',        view: 'assets',  icon: '➕' },
              { label: 'Evaluar riesgo sobre activo',   view: 'risks',   icon: '⚠️' },
              { label: 'Actualizar controles (SoA)',     view: 'soa',     icon: '📋' },
              { label: 'Subir evidencia de control',    view: 'soa',     icon: '📎' },
            ].map(({ label, view, icon }) => (
              <button
                key={label}
                className="btn-primary outline"
                style={{ textAlign: 'left', padding: '0.65rem 1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}
                onClick={() => onNavigate(view)}
              >
                <span>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
