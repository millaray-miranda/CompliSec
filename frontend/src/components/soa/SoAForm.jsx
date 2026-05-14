import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';

const SoAForm = ({ control, organizationId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    organization_id:       organizationId,
    control_id:            control.control_id,
    is_applicable:         control.is_applicable !== null ? control.is_applicable : true,
    justification:         control.justification || '',
    implementation_status: control.implementation_status || 'NOT_IMPLEMENTED',
  });

  const [formErrors, setFormErrors]     = useState({});
  const [serverError, setServerError]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sugerir justificación automática según si aplica o no
  useEffect(() => {
    if (!control.justification) {
      setFormData(prev => ({
        ...prev,
        justification: prev.is_applicable
          ? 'Aplicable por los requerimientos de negocio y riesgos identificados.'
          : 'No aplicable: la organización no realiza actividades relacionadas con este control.',
      }));
    }
  }, [formData.is_applicable]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});
    setServerError('');

    try {
      // URL relativa — el proxy de Vite lo redirige al BFF
      const response = await axios.post('/api/soa', formData);
      if (response.status === 200 || response.status === 201) {
        onSuccess(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.details) {
        const map = {};
        error.response.data.details.forEach(e => { map[e.path] = e.message; });
        setFormErrors(map);
      } else {
        setServerError(error.response?.data?.message || 'Error al guardar el estado del control.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'NOT_IMPLEMENTED', label: '❌ No implementado',            color: 'var(--danger)'  },
    { value: 'PARTIAL',         label: '🟡 Parcialmente implementado',  color: 'var(--warning)' },
    { value: 'FULLY_IMPLEMENTED',label: '✅ Completamente implementado', color: 'var(--success)' },
  ];

  return (
    <div className="glass-panel" style={{ borderLeft: '3px solid var(--accent)', marginBottom: '1.5rem' }}>
      <form onSubmit={handleSubmit} data-testid="soa-form">
        <fieldset style={{ border: 'none', padding: 0 }}>
          {/* Header del control */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--success)', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 20, padding: '2px 10px' }}>
                {control.control_number}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,.06)', borderRadius: 10, padding: '2px 8px' }}>
                {control.control_domain}
              </span>
            </div>
            <h3 style={{ margin: '0 0 0.4rem', fontSize: '1rem', fontWeight: 700 }}>{control.control_name}</h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{control.description}</p>
          </div>

          {serverError && <div className="alert-error" style={{ marginBottom: '1rem' }}>{serverError}</div>}

          {/* ¿Es aplicable? */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.85rem 1rem', background: formData.is_applicable ? 'rgba(16,185,129,.06)' : 'rgba(239,68,68,.06)', border: `1px solid ${formData.is_applicable ? 'rgba(16,185,129,.25)' : 'rgba(239,68,68,.25)'}`, borderRadius: 10, marginBottom: '1rem', cursor: 'pointer' }}
            onClick={() => setFormData(p => ({ ...p, is_applicable: !p.is_applicable }))}>
            <div style={{ width: 20, height: 20, borderRadius: 5, border: `2px solid ${formData.is_applicable ? 'var(--success)' : 'var(--border)'}`, background: formData.is_applicable ? 'var(--success)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all .15s' }}>
              {formData.is_applicable && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><path d="M1 4.5l3 3 6-7" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <input type="checkbox" name="is_applicable" checked={formData.is_applicable} onChange={handleChange} style={{ display: 'none' }} data-testid="input-soa-applicable" />
            <span style={{ fontSize: '0.88rem', fontWeight: 500, color: formData.is_applicable ? 'var(--success)' : 'var(--text-secondary)' }}>
              {formData.is_applicable ? '✅ Este control es aplicable a la organización' : '❌ Este control NO es aplicable a la organización'}
            </span>
          </div>

          {/* Justificación */}
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label htmlFor="soa-justification" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
              Justificación <span style={{ color: 'var(--danger)' }}>*</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '0.4rem' }}>(requerido por la norma)</span>
            </label>
            <textarea
              id="soa-justification" name="justification"
              value={formData.justification} onChange={handleChange}
              rows={3}
              className={formErrors['justification'] ? 'input-error' : ''}
              placeholder="Explica por qué este control aplica o no aplica a tu organización..."
              data-testid="input-soa-justification"
            />
            {formErrors['justification'] && <span className="error-text">{formErrors['justification']}</span>}
          </div>

          {/* Estado de implementación */}
          {formData.is_applicable && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', display: 'block' }}>
                Estado de implementación
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.6rem' }}>
                {statusOptions.map(({ value, label, color }) => (
                  <div key={value} onClick={() => setFormData(p => ({ ...p, implementation_status: value }))}
                    style={{ border: `1.5px solid ${formData.implementation_status === value ? color : 'var(--border)'}`, borderRadius: 10, padding: '0.65rem', cursor: 'pointer', textAlign: 'center', background: formData.implementation_status === value ? `${color}12` : 'rgba(255,255,255,.03)', transition: 'all .15s' }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: formData.implementation_status === value ? color : 'var(--text-secondary)' }}>{label}</div>
                  </div>
                ))}
              </div>
              <input type="hidden" name="implementation_status" value={formData.implementation_status} data-testid="select-soa-status" />
            </div>
          )}

          {/* Botones */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="button" className="btn-primary outline" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting} data-testid="submit-soa-btn">
              {isSubmitting ? 'Guardando...' : 'Guardar declaración'}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default SoAForm;