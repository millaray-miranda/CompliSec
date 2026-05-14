import React from 'react';

/**
 * Componente de diseño (Layout) que envuelve las vistas principales de la aplicacion.
 * Proporciona la estructura general, incluyendo el encabezado y el pie de pagina.
 *
 * @param {Object} props - Las propiedades del componente.
 * @param {React.ReactNode} props.children - Los elementos hijos a renderizar dentro del layout.
 * @param {Object} [props.user] - El usuario actual (opcional).
 * @param {Function} [props.onLogout] - Función para cerrar sesión (opcional).
 * @returns {JSX.Element} La estructura de diseño de la aplicacion.
 */
const Layout = ({ children, user, onLogout }) => {
  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon"></div>
          <h1>CompliSec</h1>
        </div>
        <nav className="header-nav" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <span className="badge">Plataforma ISO/IEC 27001</span>
          {user && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border)' }}>
              <span className="text-small" style={{ color: 'var(--text-light)' }}>
                {user.name} ({user.role})
              </span>
              <button 
                onClick={onLogout} 
                style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer', fontSize: '0.9rem' }}
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </nav>
      </header>
      
      <main className="app-content">
        {children}
      </main>

      <footer className="app-footer">
        <p>&copy; 2026 CompliSec SaaS. Todos los derechos reservados.</p>
        <p className="text-secondary">Cumplimiento Simplificado para Pymes</p>
      </footer>
    </div>
  );
};

export default Layout;
