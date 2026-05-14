import React, { useState } from 'react';
import axios from '../../utils/axiosSetup';

/**
 * Componente de formulario para registrar y evaluar un riesgo sobre un activo.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.organizationId - ID de la organizacion.
 * @param {string} props.assetId - ID del activo siendo evaluado.
 * @param {Function} props.onSuccess - Callback ejecutado al guardar exitosamente.
 * @param {Function} props.onCancel - Callback para cancelar la edicion.
 * @returns {JSX.Element} Formulario de evaluacion de riesgo.
 */
const RiskForm = ({ organizationId, assetId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    organization_id: organizationId,
    asset_id: assetId,
    threat: '',
    vulnerability: '',
    likelihood: 3,
    impact: 3,
    treatment_decision: 'MITIGATE'
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja el cambio de valores de los inputs.
   */
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const parsedValue = type === 'range' ? parseInt(value, 10) : value;
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  /**
   * Envia los datos al BFF para persistir el riesgo y manejar errores.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    setServerError('');

    try {
      const response = await axios.post('http://localhost:4000/api/risks', formData);
      if (response.status === 201) {
        onSuccess(response.data.data);
      }
    } catch (error) {
      if (error.response && error.response.status === 400 && error.response.data.details) {
        const errorsMap = {};
        error.response.data.details.forEach(err => {
          errorsMap[err.path] = err.message;
        });
        setFormErrors(errorsMap);
      } else if (error.response && error.response.data.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Ocurrió un error inesperado. Inténtelo más tarde.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ marginTop: '1rem', borderLeft: '4px solid var(--accent)' }}>
      <form onSubmit={handleSubmit} data-testid="risk-form">
        <fieldset>
          <legend>Evaluar Riesgo</legend>
          
          {serverError && <div className="alert-error">{serverError}</div>}

          <div className="form-group">
            <label htmlFor="risk-threat">Amenaza</label>
            <input 
              id="risk-threat" type="text" name="threat" 
              value={formData.threat} onChange={handleChange}
              className={formErrors['threat'] ? 'input-error' : ''}
              placeholder="Ej. Ransomware, Falla de Hardware..."
              data-testid="input-risk-threat"
            />
            {formErrors['threat'] && <span className="error-text" data-testid="error-risk-threat">{formErrors['threat']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="risk-vuln">Vulnerabilidad</label>
            <input 
              id="risk-vuln" type="text" name="vulnerability" 
              value={formData.vulnerability} onChange={handleChange}
              className={formErrors['vulnerability'] ? 'input-error' : ''}
              placeholder="Ej. Sistemas sin parchear, Falta de seguridad física..."
              data-testid="input-risk-vuln"
            />
            {formErrors['vulnerability'] && <span className="error-text" data-testid="error-risk-vuln">{formErrors['vulnerability']}</span>}
          </div>

          <div className="metrics" style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Probabilidad (1-5): {formData.likelihood}</label>
              <input 
                type="range" min="1" max="5" name="likelihood" 
                value={formData.likelihood} onChange={handleChange}
                data-testid="slider-risk-likelihood"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Impacto (1-5): {formData.impact}</label>
              <input 
                type="range" min="1" max="5" name="impact" 
                value={formData.impact} onChange={handleChange}
                data-testid="slider-risk-impact"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="treatment-decision">Decisión de Tratamiento</label>
            <select 
              id="treatment-decision" name="treatment_decision" 
              value={formData.treatment_decision} onChange={handleChange}
              className={formErrors['treatment_decision'] ? 'input-error' : ''}
              data-testid="select-treatment"
            >
              <option value="MITIGATE">Mitigar (Implementar controles)</option>
              <option value="ACCEPT">Aceptar (Riesgo dentro de tolerancia)</option>
              <option value="TRANSFER">Transferir (Seguro, tercerización)</option>
              <option value="AVOID">Evitar (Cesar actividad)</option>
            </select>
            {formErrors['treatment_decision'] && <span className="error-text">{formErrors['treatment_decision']}</span>}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-primary outline" onClick={onCancel}>Cancelar</button>
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
