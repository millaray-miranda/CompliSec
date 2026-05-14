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
      password: '',
      confirmPassword: ''
    }
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    const errorsMap = {};

    // Validación de contraseña robusta
    const pwd = formData.admin.password;
    const pwdErrors = [];
    if (pwd.length < 8) pwdErrors.push('8 caracteres');
    if (!/[A-Z]/.test(pwd)) pwdErrors.push('1 mayúscula');
    if (!/[a-z]/.test(pwd)) pwdErrors.push('1 minúscula');
    if (!/[0-9]/.test(pwd)) pwdErrors.push('1 número');
    if (!/[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\]/.test(pwd)) pwdErrors.push('1 carácter especial');

    if (pwdErrors.length > 0) {
      errorsMap['admin.password'] = 'Debe incluir al menos: ' + pwdErrors.join(', ');
    }

    if (pwd !== formData.admin.confirmPassword) {
      errorsMap['admin.confirmPassword'] = 'Las contraseñas no coinciden.';
    }

    if (Object.keys(errorsMap).length > 0) {
      setFormErrors(errorsMap);
      setIsSubmitting(false);
      return;
    }

    const payload = {
      organization: formData.organization,
      admin: {
        name: formData.admin.name,
        email: formData.admin.email,
        password: formData.admin.password
      }
    };

    try {
      const response = await axios.post('/api/onboarding', payload);

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

  const hasMinLength = formData.admin.password.length >= 8;
  const hasUppercase = /[A-Z]/.test(formData.admin.password);
  const hasNumber = /[0-9]/.test(formData.admin.password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\]/.test(formData.admin.password);
  const criteriaCount = [hasMinLength, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;

  const getStrengthClass = (index) => {
    if (criteriaCount === 0) return '';
    if (criteriaCount === 1 && index === 0) return 'active-weak';
    if (criteriaCount === 2 && index < 2) return 'active-fair';
    if (criteriaCount === 3 && index < 3) return 'active-good';
    if (criteriaCount === 4 && index < 4) return 'active-strong';
    return '';
  };

  const EyeIcon = ({ show }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show ? (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </>
      ) : (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </>
      )}
    </svg>
  );

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
          <legend>Perfil del Administrador de la Organización</legend>

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

          <div className="form-group" style={{ marginBottom: '0.5rem' }}>
            <label htmlFor="admin-password">Nueva contraseña</label>
            <div className="password-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.admin.password}
                onChange={handleAdminChange}
                className={formErrors['admin.password'] ? 'input-error' : ''}
                data-testid="input-admin-password"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <EyeIcon show={showPassword} />
              </button>
            </div>
            {formErrors['admin.password'] &&
              <span className="error-text" data-testid="error-admin-password">{formErrors['admin.password']}</span>}
          </div>

          <div className="password-strength-bars">
            <div className={`strength-bar ${getStrengthClass(0)}`}></div>
            <div className={`strength-bar ${getStrengthClass(1)}`}></div>
            <div className={`strength-bar ${getStrengthClass(2)}`}></div>
            <div className={`strength-bar ${getStrengthClass(3)}`}></div>
          </div>

          <div className="password-checklist">
            <div className={`check-item ${hasMinLength ? 'valid' : ''}`}>
              <span className="check-circle"></span> Mínimo 8 caracteres
            </div>
            <div className={`check-item ${hasUppercase ? 'valid' : ''}`}>
              <span className="check-circle"></span> Al menos una mayúscula
            </div>
            <div className={`check-item ${hasNumber ? 'valid' : ''}`}>
              <span className="check-circle"></span> Al menos un número
            </div>
            <div className={`check-item ${hasSymbol ? 'valid' : ''}`}>
              <span className="check-circle"></span> Al menos un símbolo (!@#$...)
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="admin-confirm-password">Confirmar nueva contraseña</label>
            <div className="password-wrapper">
              <input
                id="admin-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Repite tu nueva contraseña"
                value={formData.admin.confirmPassword}
                onChange={handleAdminChange}
                className={formErrors['admin.confirmPassword'] ? 'input-error' : ''}
                data-testid="input-admin-confirm-password"
              />
              <button 
                type="button" 
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                <EyeIcon show={showConfirmPassword} />
              </button>
            </div>
            {formErrors['admin.confirmPassword'] &&
              <span className="error-text" data-testid="error-admin-confirm-password">{formErrors['admin.confirmPassword']}</span>}
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
