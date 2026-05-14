import React, { useState } from 'react';
import axios from '../../utils/axiosSetup';

/**
 * Formulario para registrar un nuevo activo de informacion.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {string} props.organizationId - El ID de la organizacion actual.
 * @param {Function} props.onSuccess - Callback que se ejecuta cuando el activo se crea exitosamente.
 * @returns {JSX.Element} El componente del formulario de activos.
 */
const AssetForm = ({ organizationId, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    confidentiality_req: 3,
    integrity_req: 3,
    availability_req: 3,
    organization_id: organizationId
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja el cambio de los valores del formulario.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio del input.
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
   * Envía el formulario al BFF y maneja la respuesta o los errores de validacion.
   *
   * @param {React.FormEvent} e - Evento de envio del formulario.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    setServerError('');

    try {
      const response = await axios.post('http://localhost:4000/api/assets', formData);
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
        setServerError('Ocurrió un error inesperado. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
      <form onSubmit={handleSubmit} data-testid="asset-form">
        <fieldset>
          <legend>Registrar Activo de Información</legend>
          
          {serverError && <div className="alert-error">{serverError}</div>}

          <div className="form-group">
            <label htmlFor="asset-name">Nombre del Activo</label>
            <input 
              id="asset-name"
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange}
              className={formErrors['name'] ? 'input-error' : ''}
              data-testid="input-asset-name"
            />
            {formErrors['name'] && <span className="error-text" data-testid="error-asset-name">{formErrors['name']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="asset-desc">Descripción</label>
            <input 
              id="asset-desc"
              type="text" 
              name="description" 
              value={formData.description} 
              onChange={handleChange}
              data-testid="input-asset-desc"
            />
          </div>

          <div className="metrics" style={{ marginTop: '1.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
            <div className="form-group">
              <label>Confidencialidad (1-5): {formData.confidentiality_req}</label>
              <input 
                type="range" min="1" max="5" name="confidentiality_req" 
                value={formData.confidentiality_req} onChange={handleChange}
                data-testid="slider-asset-c"
              />
            </div>
            <div className="form-group">
              <label>Integridad (1-5): {formData.integrity_req}</label>
              <input 
                type="range" min="1" max="5" name="integrity_req" 
                value={formData.integrity_req} onChange={handleChange}
                data-testid="slider-asset-i"
              />
            </div>
            <div className="form-group">
              <label>Disponibilidad (1-5): {formData.availability_req}</label>
              <input 
                type="range" min="1" max="5" name="availability_req" 
                value={formData.availability_req} onChange={handleChange}
                data-testid="slider-asset-a"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary full-width" disabled={isSubmitting} data-testid="submit-asset-btn">
            {isSubmitting ? 'Guardando...' : 'Guardar Activo'}
          </button>
        </fieldset>
      </form>
    </div>
  );
};

export default AssetForm;
