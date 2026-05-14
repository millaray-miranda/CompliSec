import React, { useState } from 'react';
import axios from '../../utils/axiosSetup';

/**
 * Formulario de Onboarding para registrar el "Contexto de la Organizacion".
 * Fundamental para la Clausula 4 de ISO 27001.
 *
 * @param {Object} props - Propiedades del componente.
 * @param {Function} props.onComplete - Callback que se ejecuta cuando el registro es exitoso.
 * @returns {JSX.Element} Componente de registro inicial.
 */
const OnboardingForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    organization: {
      name: '',
      industry: '',
      size: 'MICRO'
    },
    admin: {
      name: '',
      email: '',
      password: ''
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Maneja los cambios en los inputs de la organizacion.
   *
   * @param {React.ChangeEvent<HTMLInputElement | HTMLSelectElement>} e - Evento de cambio.
   */
  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      organization: { ...prev.organization, [name]: value }
    }));
    
    if (formErrors[`organization.${name}`]) {
      setFormErrors(prev => ({ ...prev, [`organization.${name}`]: null }));
    }
  };

  /**
   * Maneja los cambios en los inputs del administrador.
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - Evento de cambio.
   */
  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      admin: { ...prev.admin, [name]: value }
    }));
    
    if (formErrors[`admin.${name}`]) {
      setFormErrors(prev => ({ ...prev, [`admin.${name}`]: null }));
    }
  };

  /**
   * Envia la solicitud POST al BFF para registrar la organizacion.
   *
   * @param {React.FormEvent} e - Evento de envio.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    setServerError('');

    try {
      const response = await axios.post('/api/onboarding', formData);

      if (response.status === 201) {
        // Pasar todos los datos que necesita App.jsx: token, user y organizationId
        onComplete(response.data.data);
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
    <div className="onboarding-container glass-panel" style={{ maxWidth: '600px', margin: '2rem auto' }}>
      <div className="section-header">
        <h2>Contexto de la Organización (Cláusula 4)</h2>
        <p className="subtitle">Paso 1: Perfil de Organización y Administrador</p>
      </div>

      {serverError && <div className="alert-error" data-testid="server-error">{serverError}</div>}

      <form onSubmit={handleSubmit} data-testid="onboarding-form">
        <fieldset>
          <legend>Detalles de la Organización</legend>
          
          <div className="form-group">
            <label htmlFor="org-name">Nombre de la Empresa</label>
            <input 
              id="org-name"
              type="text" 
              name="name" 
              value={formData.organization.name} 
              onChange={handleOrgChange}
              className={formErrors['organization.name'] ? 'input-error' : ''}
              data-testid="input-org-name"
            />
            {formErrors['organization.name'] && 
              <span className="error-text" data-testid="error-org-name">{formErrors['organization.name']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="org-industry">Industria</label>
            <input 
              id="org-industry"
              type="text" 
              name="industry" 
              value={formData.organization.industry} 
              onChange={handleOrgChange}
              className={formErrors['organization.industry'] ? 'input-error' : ''}
              data-testid="input-org-industry"
            />
            {formErrors['organization.industry'] && 
              <span className="error-text" data-testid="error-org-industry">{formErrors['organization.industry']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="org-size">Tamaño de la Empresa</label>
            <select 
              id="org-size"
              name="size" 
              value={formData.organization.size} 
              onChange={handleOrgChange}
              className={formErrors['organization.size'] ? 'input-error' : ''}
              data-testid="select-org-size"
            >
              <option value="MICRO">Micro (1-9 empleados)</option>
              <option value="SMALL">Pequeña (10-49 empleados)</option>
              <option value="MEDIUM">Mediana (50-249 empleados)</option>
              <option value="LARGE">Grande (250+ empleados)</option>
            </select>
            {formErrors['organization.size'] && 
              <span className="error-text" data-testid="error-org-size">{formErrors['organization.size']}</span>}
          </div>
        </fieldset>

        <fieldset>
          <legend>Perfil del Administrador</legend>
          
          <div className="form-group">
            <label htmlFor="admin-name">Nombre Completo</label>
            <input 
              id="admin-name"
              type="text" 
              name="name" 
              value={formData.admin.name} 
              onChange={handleAdminChange}
              className={formErrors['admin.name'] ? 'input-error' : ''}
              data-testid="input-admin-name"
            />
            {formErrors['admin.name'] && 
              <span className="error-text" data-testid="error-admin-name">{formErrors['admin.name']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="admin-email">Correo Electrónico</label>
            <input 
              id="admin-email"
              type="email" 
              name="email" 
              value={formData.admin.email} 
              onChange={handleAdminChange}
              className={formErrors['admin.email'] ? 'input-error' : ''}
              data-testid="input-admin-email"
            />
            {formErrors['admin.email'] && 
              <span className="error-text" data-testid="error-admin-email">{formErrors['admin.email']}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Contraseña Fuerte</label>
            <input 
              id="admin-password"
              type="password" 
              name="password" 
              value={formData.admin.password} 
              onChange={handleAdminChange}
              className={formErrors['admin.password'] ? 'input-error' : ''}
              data-testid="input-admin-password"
            />
            {formErrors['admin.password'] && 
              <span className="error-text" data-testid="error-admin-password">{formErrors['admin.password']}</span>}
          </div>
        </fieldset>

        <button type="submit" className="btn-primary full-width" disabled={isSubmitting} data-testid="submit-btn">
          {isSubmitting ? 'Inicializando...' : 'Comenzar Implementación ISO 27001'}
        </button>
      </form>
    </div>
  );
};

export default OnboardingForm;
