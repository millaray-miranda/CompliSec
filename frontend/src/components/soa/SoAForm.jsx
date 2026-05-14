import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';

/**
 * Formulario para establecer la aplicabilidad y justificacion de un control del Anexo A.
 *
 * @param {Object} props
 * @param {Object} props.control - Datos del control a evaluar.
 * @param {string} props.organizationId - ID de la organización.
 * @param {Function} props.onSuccess - Callback para actualizar la lista padre.
 * @param {Function} props.onCancel - Callback para cerrar el formulario.
 */
const SoAForm = ({ control, organizationId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    organization_id: organizationId,
    control_id: control.control_id,
    is_applicable: control.is_applicable !== null ? control.is_applicable : true,
    justification: control.justification || '',
    implementation_status: control.implementation_status || 'NOT_IMPLEMENTED'
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Si la justificacion esta vacia, podemos poner un placeholder dependiendo de si aplica o no
    if (!formData.justification) {
      setFormData(prev => ({
        ...prev,
        justification: prev.is_applicable 
          ? 'Aplicable debido a los requerimientos de negocio y riesgos identificados en...' 
          : 'No aplicable debido a que la organización no realiza actividades de...'
      }));
    }
  }, [formData.is_applicable]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const parsedValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({ ...prev, [name]: parsedValue }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    setServerError('');

    try {
      const response = await axios.post('http://localhost:4000/api/soa', formData);
      if (response.status === 200 || response.status === 201) {
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
        setServerError('Error al guardar el estado del control.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent)' }}>
      <form onSubmit={handleSubmit} data-testid="soa-form">
        <fieldset>
          <legend>
            Evaluar Control: {control.control_number} - {control.control_name}
          </legend>
          <p className="text-small text-secondary mb-2">{control.description}</p>
          
          {serverError && <div className="alert-error">{serverError}</div>}

          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
            <input 
              id="soa-applicable" 
              type="checkbox" 
              name="is_applicable" 
              checked={formData.is_applicable} 
              onChange={handleChange}
              style={{ width: 'auto', transform: 'scale(1.5)' }}
              data-testid="input-soa-applicable"
            />
            <label htmlFor="soa-applicable" style={{ margin: 0 }}>
              ¿Este control es aplicable a la organización?
            </label>
          </div>

          <div className="form-group mt-2">
            <label htmlFor="soa-justification">Justificación (Obligatoria)</label>
            <textarea 
              id="soa-justification" 
              name="justification" 
              value={formData.justification} 
              onChange={handleChange}
              rows="3"
              className={formErrors['justification'] ? 'input-error' : ''}
              data-testid="input-soa-justification"
            />
            {formErrors['justification'] && <span className="error-text" data-testid="error-soa-justification">{formErrors['justification']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="soa-status">Estado de Implementación</label>
            <select 
              id="soa-status" 
              name="implementation_status" 
              value={formData.implementation_status} 
              onChange={handleChange}
              disabled={!formData.is_applicable}
              className={formErrors['implementation_status'] ? 'input-error' : ''}
              data-testid="select-soa-status"
            >
              <option value="NOT_IMPLEMENTED">No Implementado</option>
              <option value="PARTIAL">Parcial</option>
              <option value="FULLY_IMPLEMENTED">Completamente Implementado</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn-primary outline" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting} data-testid="submit-soa-btn">
              {isSubmitting ? 'Guardando...' : 'Guardar Declaración'}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default SoAForm;
