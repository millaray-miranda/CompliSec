import React, { useState } from 'react';
import axios from '../../utils/axiosSetup';

/**
 * Componente de inicio de sesión para la plataforma CompliSec.
 *
 * @param {Object} props
 * @param {Function} props.onLoginSuccess - Callback invocado al iniciar sesión exitosamente.
 * @param {Function} props.onGoToRegister - Callback para cambiar a la vista de Onboarding.
 */
const Login = ({ onLoginSuccess, onGoToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/auth/login', formData);
      const { user, token } = response.data.data;
      
      // Guardar el token en localStorage
      localStorage.setItem('token', token);
      
      // Notificar a App.jsx
      onLoginSuccess(user);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Correo o contraseña incorrectos.');
      } else if (err.response && err.response.status === 400 && err.response.data.details) {
        // Zod validation errors
        setError(err.response.data.details[0].message);
      } else {
        setError('Ocurrió un error inesperado al intentar iniciar sesión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="onboarding-container glass-panel" style={{ maxWidth: '400px', margin: '4rem auto' }}>
      <div className="section-header" style={{ textAlign: 'center' }}>
        <div className="logo-icon" style={{ margin: '0 auto 1rem auto', width: '40px', height: '40px' }}></div>
        <h2>Iniciar Sesión</h2>
        <p className="subtitle">Accede a tu plataforma ISO 27001</p>
      </div>

      {error && <div className="alert-error" data-testid="login-error">{error}</div>}

      <form onSubmit={handleSubmit} data-testid="login-form">
        <fieldset>
          <div className="form-group">
            <label htmlFor="login-email">Correo Electrónico</label>
            <input 
              id="login-email"
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              required
              data-testid="input-login-email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password">Contraseña</label>
            <input 
              id="login-password"
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange}
              required
              data-testid="input-login-password"
            />
          </div>
        </fieldset>

        <button type="submit" className="btn-primary full-width" disabled={isLoading} data-testid="submit-login-btn">
          {isLoading ? 'Autenticando...' : 'Ingresar'}
        </button>

        <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          <p className="text-small text-secondary">
            ¿No tienes una cuenta?{' '}
            <button 
              type="button" 
              className="btn-link" 
              style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
              onClick={onGoToRegister}
            >
              Registra tu organización
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default Login;
