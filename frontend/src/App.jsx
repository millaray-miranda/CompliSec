import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Layout from './components/layout/Layout';
import RiskCard from './components/dashboard/RiskCard';
import OnboardingForm from './components/onboarding/OnboardingForm';
import Login from './components/auth/Login';
import AssetList from './components/assets/AssetList';
import RiskAssessment from './components/risks/RiskAssessment';
import SoAList from './components/soa/SoAList';

/**
 * Componente principal de la aplicacion que gestiona el estado global
 * y la navegacion entre los modulos de Onboarding, Login, Dashboard, Activos, Riesgos y SoA.
 *
 * @returns {JSX.Element} El arbol de componentes renderizado.
 */
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' o 'register'
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    // Verificar si hay un token guardado al cargar la página
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Comprobar si el token expiro (exp esta en segundos)
        if (decoded.exp * 1000 > Date.now()) {
          setCurrentUser({
            id: decoded.userId,
            organization_id: decoded.organizationId,
            role: decoded.role
          });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        localStorage.removeItem('token');
      }
    }
  }, []);

  /**
   * Maneja el éxito del login o registro.
   */
  const handleAuthSuccess = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  /**
   * Cierra la sesión eliminando el token.
   */
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthView('login');
  };

  // Renderizado para usuarios NO autenticados
  if (!isAuthenticated) {
    return (
      <Layout>
        {authView === 'login' ? (
          <Login 
            onLoginSuccess={handleAuthSuccess} 
            onGoToRegister={() => setAuthView('register')} 
          />
        ) : (
          <div>
            <OnboardingForm onComplete={(data) => {
              // El endpoint de onboarding devuelve el token en la version refactorizada
              if (data.token) {
                localStorage.setItem('token', data.token);
              }
              handleAuthSuccess({
                id: data.user?.id,
                organization_id: data.organizationId || data.organization_id,
                role: data.user?.role || 'ADMIN'
              });
            }} />
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button 
                className="btn-link" 
                style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
                onClick={() => setAuthView('login')}
              >
                Volver al inicio de sesión
              </button>
            </div>
          </div>
        )}
      </Layout>
    );
  }

  // Renderizado para usuarios AUTENTICADOS
  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <div className="main-container">
        {/* Selector de vistas principal */}
        <div className="view-selector" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button 
            className={`btn-primary ${currentView === 'dashboard' ? '' : 'outline'}`} 
            onClick={() => setCurrentView('dashboard')}
            style={{ opacity: currentView === 'dashboard' ? 1 : 0.6 }}
          >
            Panel de Riesgos
          </button>
          
          <button 
            className={`btn-primary ${currentView === 'assets' ? '' : 'outline'}`} 
            onClick={() => setCurrentView('assets')}
            style={{ opacity: currentView === 'assets' ? 1 : 0.6 }}
          >
            Inventario de Activos
          </button>
          
          {/* Ocultar Evaluacion de Riesgos si es empleado */}
          {currentUser.role !== 'EMPLOYEE' && (
            <button 
              className={`btn-primary ${currentView === 'risks' ? '' : 'outline'}`} 
              onClick={() => setCurrentView('risks')}
              style={{ opacity: currentView === 'risks' ? 1 : 0.6 }}
            >
              Evaluación de Riesgos
            </button>
          )}

          <button 
            className={`btn-primary ${currentView === 'soa' ? '' : 'outline'}`} 
            onClick={() => setCurrentView('soa')}
            style={{ opacity: currentView === 'soa' ? 1 : 0.6 }}
          >
            Declaración de Aplicabilidad (SoA)
          </button>
        </div>

        {currentView === 'dashboard' && (
          <div className="dashboard-grid" data-testid="dashboard-view">
            <RiskCard 
              controlNumber="5.1" 
              controlName="Políticas de seguridad de la información" 
              status="IMPLEMENTED"
              likelihood={2}
              impact={3}
            />
            <RiskCard 
              controlNumber="8.1" 
              controlName="Dispositivos de punto final de usuario" 
              status="PARTIAL"
              likelihood={4}
              impact={4}
            />
          </div>
        )}
        
        {currentView === 'assets' && (
          <AssetList organizationId={currentUser.organization_id} />
        )}

        {currentView === 'risks' && currentUser.role !== 'EMPLOYEE' && (
          <RiskAssessment organizationId={currentUser.organization_id} />
        )}

        {currentView === 'soa' && (
          <SoAList organizationId={currentUser.organization_id} />
        )}
      </div>
    </Layout>
  );
}

export default App;
