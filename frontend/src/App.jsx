import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from './utils/axiosSetup';
import Layout from './components/layout/Layout';
import OnboardingForm from './components/onboarding/OnboardingForm';
import Login from './components/auth/Login';
import AssetList from './components/assets/AssetList';
import RiskAssessment from './components/risks/RiskAssessment';
import SoAList from './components/soa/SoAList';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          setCurrentUser({
            id: decoded.userId,
            name: decoded.name || decoded.email || 'Usuario',
            organization_id: decoded.organizationId,
            role: decoded.role,
          });
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('token');
        }
      } catch {
        localStorage.removeItem('token');
      }
    }
  }, []);

  /**
   * Llamada al BFF para obtener el nombre del usuario después de autenticarse,
   * ya que el JWT no siempre incluye el campo "name".
   */
  const fetchUserName = async (userId, token) => {
    try {
      const res = await axios.get(`/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data?.data?.name || 'Usuario';
    } catch {
      return 'Usuario';
    }
  };

  const handleAuthSuccess = async (userData, token) => {
    const savedToken = token || localStorage.getItem('token');
    let name = userData.name;

    // Si no viene el nombre (solo viene del JWT decode), lo pedimos al BFF
    if (!name && savedToken) {
      name = await fetchUserName(userData.id, savedToken);
    }

    setCurrentUser({
      id: userData.id,
      name: name || userData.email || 'Usuario',
      organization_id: userData.organization_id || userData.organizationId,
      role: userData.role || 'ADMIN',
    });
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthView('login');
    setCurrentView('dashboard');
  };

  // ── Vista no autenticada ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <Layout>
        {authView === 'login' ? (
          <Login
            onLoginSuccess={(userData, token) => handleAuthSuccess(userData, token)}
            onGoToRegister={() => setAuthView('register')}
          />
        ) : (
          <div>
            <OnboardingForm
              onComplete={(data) => {
                if (data.token) {
                  localStorage.setItem('token', data.token);
                }
                handleAuthSuccess(
                  {
                    id: data.user?.id,
                    name: data.user?.name,
                    organization_id: data.organizationId || data.organization_id,
                    role: data.user?.role || 'ADMIN',
                  },
                  data.token
                );
              }}
            />
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

  // ── Vista autenticada ─────────────────────────────────────────────────────
  return (
    <Layout user={currentUser} onLogout={handleLogout}>
      <div className="main-content">

        {/* Navegación principal */}
        <div
          className="view-selector"
          style={{ marginBottom: '2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}
        >
          {[
            { key: 'dashboard', label: '📊 Dashboard' },
            { key: 'assets',    label: '🗃️ Activos' },
            ...(currentUser.role !== 'EMPLOYEE'
              ? [{ key: 'risks', label: '⚠️ Riesgos' }]
              : []),
            { key: 'soa', label: '📋 SoA' },
          ].map(({ key, label }) => (
            <button
              key={key}
              className={`btn-primary ${currentView === key ? '' : 'outline'}`}
              onClick={() => setCurrentView(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Vistas */}
        {currentView === 'dashboard' && (
          <Dashboard
            organizationId={currentUser.organization_id}
            onNavigate={setCurrentView}
          />
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
