import React, { useState } from 'react';
import axios from '../../utils/axiosSetup';

const OnboardingForm = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    organization: { name: '', industry: '', size: 'MICRO' },
    admin: { name: '', email: '', password: '', confirmPassword: '' }
  });

  const [formErrors, setFormErrors]     = useState({});
  const [serverError, setServerError]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOrgChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, organization: { ...prev.organization, [name]: value } }));
    if (formErrors[`organization.${name}`]) setFormErrors(prev => ({ ...prev, [`organization.${name}`]: null }));
  };

  const handleAdminChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, admin: { ...prev.admin, [name]: value } }));
    if (formErrors[`admin.${name}`]) setFormErrors(prev => ({ ...prev, [`admin.${name}`]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    setServerError('');

    const errorsMap = {};

    // Campos obligatorios
    if (!formData.admin.name.trim())                  errorsMap['admin.name']              = 'El nombre es obligatorio.';
    if (!formData.admin.email.trim())                 errorsMap['admin.email']             = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.admin.email)) errorsMap['admin.email'] = 'Ingresa un correo válido.';
    if (!formData.organization.name.trim())           errorsMap['organization.name']       = 'El nombre de la empresa es obligatorio.';
    if (!formData.organization.industry.trim())       errorsMap['organization.industry']   = 'La industria es obligatoria.';

    const pwd = formData.admin.password;
    const pwdErrors = [];
    if (!pwd) {
      errorsMap['admin.password'] = 'La contraseña es obligatoria.';
    } else {
      if (pwd.length < 8)                                               pwdErrors.push('8 caracteres');
      if (!/[A-Z]/.test(pwd))                                           pwdErrors.push('1 mayúscula');
      if (!/[a-z]/.test(pwd))                                           pwdErrors.push('1 minúscula');
      if (!/[0-9]/.test(pwd))                                           pwdErrors.push('1 número');
      if (!/[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\]/.test(pwd))             pwdErrors.push('1 carácter especial');
      if (pwdErrors.length > 0) errorsMap['admin.password'] = 'Debe incluir: ' + pwdErrors.join(', ');
    }
    if (!formData.admin.confirmPassword)              errorsMap['admin.confirmPassword']   = 'Debes confirmar la contraseña.';
    else if (pwd !== formData.admin.confirmPassword)  errorsMap['admin.confirmPassword']   = 'Las contraseñas no coinciden.';

    if (Object.keys(errorsMap).length > 0) { setFormErrors(errorsMap); setIsSubmitting(false); return; }

    try {
      const response = await axios.post('/api/onboarding', {
        organization: formData.organization,
        admin: { name: formData.admin.name, email: formData.admin.email, password: formData.admin.password }
      });
      if (response.status === 201) onComplete(response.data.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.details) {
        const map = {};
        error.response.data.details.forEach(err => { map[err.path] = err.message; });
        setFormErrors(map);
      } else if (error.response?.data?.message) {
        setServerError(error.response.data.message);
      } else {
        setServerError('Ocurrió un error inesperado. Por favor, inténtelo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const pwd = formData.admin.password;
  const hasMinLength = pwd.length >= 8;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber    = /[0-9]/.test(pwd);
  const hasSymbol    = /[!@#$%^&*(),.?":{}|<>_+\-=\[\]\\]/.test(pwd);
  const criteriaCount = [hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSymbol].filter(Boolean).length;
  const strengthPct   = (criteriaCount / 5) * 100;
  const strengthColor = criteriaCount <= 1 ? 'var(--danger)' : criteriaCount <= 3 ? 'var(--warning)' : 'var(--success)';
  const strengthLabel = criteriaCount === 0 ? '' : criteriaCount <= 1 ? 'Débil' : criteriaCount <= 3 ? 'Regular' : criteriaCount === 4 ? 'Buena' : 'Fuerte';

  const EyeIcon = ({ show }) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {show ? (
        <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
      ) : (
        <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
      )}
    </svg>
  );

  const Field = ({ id, label, error, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.1rem' }}>
      <label htmlFor={id} style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}<span style={{ color: 'var(--danger)', marginLeft: '0.2rem' }}>*</span>
      </label>
      {children}
      {error && <span style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: 500 }}>{error}</span>}
    </div>
  );

  const inputStyle = (hasError) => ({
    background: 'rgba(0,0,0,0.25)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.12)'}`,
    borderRadius: '0.6rem',
    color: 'var(--text-primary)',
    padding: '0.7rem 0.9rem',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxShadow: hasError ? '0 0 0 2px rgba(239,68,68,0.15)' : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      <div style={{ width: '100%', maxWidth: '860px' }}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <span style={{
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#60a5fa',
              fontSize: '0.72rem', fontWeight: 700,
              padding: '0.25rem 0.75rem', borderRadius: 9999,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>ISO/IEC 27001:2022</span>
          </div>
          <h1 style={{
            margin: '0 0 0.5rem',
            fontSize: '2rem', fontWeight: 800,
            background: 'linear-gradient(to right, #60a5fa, #34d399)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}>
            Configura tu organización
          </h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Cláusula 4 · Contexto de la organización y usuario administrador
          </p>
        </div>

        {/* ── Steps indicator ────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0', marginBottom: '2.5rem' }}>
          {[
            { n: 1, label: 'Organización' },
            { n: 2, label: 'Administrador' },
            { n: 3, label: 'Listo' },
          ].map((step, i, arr) => (
            <React.Fragment key={step.n}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem',
                  background: step.n <= 2 ? 'linear-gradient(135deg,#3b82f6,#10b981)' : 'rgba(255,255,255,0.06)',
                  border: step.n <= 2 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: step.n <= 2 ? 'white' : 'var(--text-secondary)',
                  boxShadow: step.n <= 2 ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
                }}>{step.n}</div>
                <span style={{ fontSize: '0.7rem', color: step.n <= 2 ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 500 }}>
                  {step.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div style={{ width: 60, height: 1, background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem', marginBottom: '1.4rem' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        {serverError && (
          <div style={{
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '0.75rem', padding: '0.9rem 1.1rem',
            color: '#fca5a5', fontSize: '0.875rem', marginBottom: '1.5rem',
            display: 'flex', gap: '0.6rem', alignItems: 'center',
          }}>
            <span>⚠️</span> {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} data-testid="onboarding-form">
          {/* ── Two-column grid ───────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch' }}>

            {/* ── LEFT: Administrador ─────────────────────────────── */}
            <div style={{
              background: 'var(--panel-bg)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border)',
              borderRadius: '1rem',
              padding: '1.75rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa',
                }}>1</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Cuenta del administrador</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Acceso inicial a la plataforma</div>
                </div>
              </div>

              <Field id="admin-name" label="Nombre completo" error={formErrors['admin.name']}>
                <input
                  id="admin-name" type="text" name="name"
                  value={formData.admin.name} onChange={handleAdminChange}
                  placeholder="Ej: María García"
                  style={inputStyle(!!formErrors['admin.name'])}
                  data-testid="input-admin-name"
                />
              </Field>

              <Field id="admin-email" label="Correo electrónico" error={formErrors['admin.email']}>
                <input
                  id="admin-email" type="email" name="email"
                  value={formData.admin.email} onChange={handleAdminChange}
                  placeholder="admin@empresa.com"
                  style={inputStyle(!!formErrors['admin.email'])}
                  data-testid="input-admin-email"
                />
              </Field>

              {/* Password */}
              <Field id="admin-password" label="Contraseña" error={formErrors['admin.password']}>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Mínimo 8 caracteres"
                    value={formData.admin.password}
                    onChange={handleAdminChange}
                    style={{ ...inputStyle(!!formErrors['admin.password']), paddingRight: '2.75rem' }}
                    data-testid="input-admin-password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', padding: 0, display: 'flex',
                  }} aria-label={showPassword ? 'Ocultar' : 'Mostrar'}>
                    <EyeIcon show={showPassword} />
                  </button>
                </div>
              </Field>

              {/* Strength bar */}
              {pwd.length > 0 && (
                <div style={{ marginTop: '-0.6rem', marginBottom: '0.9rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Seguridad</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: strengthColor }}>{strengthLabel}</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${strengthPct}%`, background: strengthColor, borderRadius: 2, transition: 'width 0.3s, background 0.3s' }} />
                  </div>
                  {/* Criteria grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.3rem', marginTop: '0.6rem' }}>
                    {[
                      [hasMinLength, '8+ caracteres'],
                      [hasUppercase, 'Mayúscula'],
                      [hasLowercase, 'Minúscula'],
                      [hasNumber,    'Número'],
                      [hasSymbol,    'Símbolo especial'],
                    ].map(([ok, label]) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', color: ok ? 'var(--success)' : 'var(--text-secondary)' }}>
                        <span style={{
                          width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                          background: ok ? 'var(--success)' : 'rgba(255,255,255,0.1)',
                          border: ok ? 'none' : '1px solid rgba(255,255,255,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.55rem', color: 'white', fontWeight: 700,
                        }}>{ok ? '✓' : ''}</span>
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Confirm password */}
              <Field id="admin-confirm-password" label="Confirmar contraseña" error={formErrors['admin.confirmPassword']}>
                <div style={{ position: 'relative' }}>
                  <input
                    id="admin-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Repite tu contraseña"
                    value={formData.admin.confirmPassword}
                    onChange={handleAdminChange}
                    style={{ ...inputStyle(!!formErrors['admin.confirmPassword']), paddingRight: '2.75rem' }}
                    data-testid="input-admin-confirm-password"
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{
                    position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-secondary)',
                    cursor: 'pointer', padding: 0, display: 'flex',
                  }} aria-label={showConfirmPassword ? 'Ocultar' : 'Mostrar'}>
                    <EyeIcon show={showConfirmPassword} />
                  </button>
                </div>
              </Field>
            </div>

            {/* ── RIGHT: Organización ─────────────────────────────── */}
            <div style={{
              background: 'var(--panel-bg)',
              backdropFilter: 'blur(10px)',
              border: '1px solid var(--border)',
              borderRadius: '1rem',
              padding: '1.75rem',
              boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#34d399',
                }}>2</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Datos de la organización</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Contexto institucional</div>
                </div>
              </div>

              <Field id="org-name" label="Nombre de la empresa" error={formErrors['organization.name']}>
                <input
                  id="org-name" type="text" name="name"
                  value={formData.organization.name} onChange={handleOrgChange}
                  placeholder="Ej: Acme Technologies S.A."
                  style={inputStyle(!!formErrors['organization.name'])}
                  data-testid="input-org-name"
                />
              </Field>

              <Field id="org-industry" label="Industria / Sector" error={formErrors['organization.industry']}>
                <input
                  id="org-industry" type="text" name="industry"
                  value={formData.organization.industry} onChange={handleOrgChange}
                  placeholder="Ej: Tecnología, Salud, Finanzas…"
                  style={inputStyle(!!formErrors['organization.industry'])}
                  data-testid="input-org-industry"
                />
              </Field>

              <Field id="org-size" label="Tamaño de la empresa" error={formErrors['organization.size']}>
                <select
                  id="org-size" name="size"
                  value={formData.organization.size} onChange={handleOrgChange}
                  style={{ ...inputStyle(!!formErrors['organization.size']), cursor: 'pointer' }}
                  data-testid="select-org-size"
                >
                  <option value="MICRO">Micro — 1 a 9 empleados</option>
                  <option value="SMALL">Pequeña — 10 a 49 empleados</option>
                  <option value="MEDIUM">Mediana — 50 a 249 empleados</option>
                  <option value="LARGE">Grande — 250 o más empleados</option>
                </select>
              </Field>

              {/* ISO clause callout */}
              <div style={{
                marginTop: '0.5rem',
                background: 'rgba(59,130,246,0.06)',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: '0.6rem',
                padding: '0.75rem 0.9rem',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
              }}>
                📌 Esta información corresponde a la <strong style={{ color: '#60a5fa' }}>Cláusula 4.1</strong> de ISO 27001 — Comprender el contexto de la organización.
              </div>
            </div>
          </div>

          {/* ── Submit ─────────────────────────────────────────────── */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center' }}>
            <button
              type="submit"
              disabled={isSubmitting}
              data-testid="submit-btn"
              style={{
                background: isSubmitting ? 'rgba(59,130,246,0.4)' : 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
                border: 'none', borderRadius: '0.75rem',
                color: 'white', fontWeight: 700, fontSize: '1rem',
                padding: '0.9rem 3rem', cursor: isSubmitting ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.2s, transform 0.1s',
                boxShadow: isSubmitting ? 'none' : '0 0 24px rgba(59,130,246,0.3)',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={e => { if (!isSubmitting) e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.transform = 'none'; }}
            >
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                  <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Configurando plataforma…
                </span>
              ) : '🚀 Comenzar implementación ISO 27001'}
            </button>

            <p style={{ marginTop: '1rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Al continuar, aceptas que esta plataforma procesará los datos de tu organización para la gestión del SGSI.
            </p>
          </div>
        </form>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          input::placeholder, textarea::placeholder { color: rgba(148,163,184,0.5); }
          input:focus, select:focus {
            border-color: rgba(59,130,246,0.5) !important;
            box-shadow: 0 0 0 2px rgba(59,130,246,0.15) !important;
          }
          select option { background: #2d3748; color: #f8fafc; }
        `}</style>
      </div>
    </div>
  );
};

export default OnboardingForm;