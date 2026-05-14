import React, { useState } from 'react';
import axios from '../../utils/axiosSetup';

/**
 * Formulario para registrar y evaluar un riesgo sobre un activo.
 * Calcula el nivel de riesgo como Probabilidad × Impacto (ISO 27005).
 */
const RiskForm = ({ organizationId, assetId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    organization_id:    organizationId,
    asset_id:           assetId,
    threat:             '',
    vulnerability:      '',
    likelihood:         3,
    impact:             3,
    treatment_decision: 'MITIGATE',
  });

  const [formErrors, setFormErrors]   = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'range' ? parseInt(value, 10) : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    setServerError('');

    try {
      const response = await axios.post('/api/risks', formData);
      if (response.status === 201) {
        onSuccess(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.details) {
        const map = {};
        error.response.data.details.forEach(e => { map[e.path] = e.message; });
        setFormErrors(map);
      } else {
        setServerError(error.response?.data?.message || 'Error inesperado. Inténtelo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const riskScore = formData.likelihood * formData.impact;
  const riskColor = riskScore >= 15 ? 'var(--danger)' : riskScore >= 8 ? 'var(--warning)' : 'var(--success)';
  const riskLabel = riskScore >= 15 ? 'CRÍTICO' : riskScore >= 8 ? 'ALTO' : 'BAJO';

  return (
    <div className="glass-panel" style={{ marginTop: '1rem', borderLeft: '4px solid var(--accent)' }}>
      <form onSubmit={handleSubmit} data-testid="risk-form">
        <fieldset>
          <legend>Evaluar Riesgo</legend>

          {serverError && <div className="alert-error">{serverError}</div>}

          <div className="form-group">
            <label htmlFor="risk-threat">Amenaza *</label>
            <input
              id="risk-threat" type="text" name="threat"
              value={formData.threat} onChange={handleChange}
              className={formErrors.threat ? 'input-error' : ''}
              placeholder="Ej: Ransomware, Acceso no autorizado, Falla de hardware..."
              data-testid="input-risk-threat"
            />
            {formErrors.threat && <span className="error-text" data-testid="error-risk-threat">{formErrors.threat}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="risk-vuln">Vulnerabilidad *</label>
            <input
              id="risk-vuln" type="text" name="vulnerability"
              value={formData.vulnerability} onChange={handleChange}
              className={formErrors.vulnerability ? 'input-error' : ''}
              placeholder="Ej: Sistemas sin parchear, Contraseñas débiles, Sin cifrado..."
              data-testid="input-risk-vuln"
            />
            {formErrors.vulnerability && <span className="error-text" data-testid="error-risk-vuln">{formErrors.vulnerability}</span>}
          </div>

          {/* Sliders + score en vivo */}
          <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '0.75rem', padding: '1rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Valoración del riesgo</span>
              <span style={{ fontWeight: 700, color: riskColor, fontSize: '1.1rem' }}>
                Nivel: {riskScore} — {riskLabel}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Probabilidad</label>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{formData.likelihood}/5</span>
                </div>
                <input
                  type="range" min="1" max="5" name="likelihood"
                  value={formData.likelihood} onChange={handleChange}
                  style={{ width: '100%' }}
                  data-testid="slider-risk-likelihood"
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label>Impacto</label>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{formData.impact}/5</span>
                </div>
                <input
                  type="range" min="1" max="5" name="impact"
                  value={formData.impact} onChange={handleChange}
                  style={{ width: '100%' }}
                  data-testid="slider-risk-impact"
                />
              </div>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="treatment-decision">Decisión de Tratamiento</label>
            <select
              id="treatment-decision" name="treatment_decision"
              value={formData.treatment_decision} onChange={handleChange}
              className={formErrors.treatment_decision ? 'input-error' : ''}
              data-testid="select-treatment"
            >
              <option value="MITIGATE">Mitigar — Implementar controles</option>
              <option value="ACCEPT">Aceptar — Riesgo dentro de tolerancia</option>
              <option value="TRANSFER">Transferir — Seguro o tercerización</option>
              <option value="AVOID">Evitar — Cesar la actividad</option>
            </select>
            {formErrors.treatment_decision && <span className="error-text">{formErrors.treatment_decision}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-primary outline" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting} data-testid="submit-risk-btn">
              {isSubmitting ? 'Guardando...' : 'Guardar Perfil de Riesgo'}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default RiskForm;
