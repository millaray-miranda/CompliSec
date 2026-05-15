import React, { useState } from 'react';
import axios from '../../utils/axiosSetup';

const AssetForm = ({ organizationId, initialData, onSuccess, onCancel }) => {
  const isEditing = !!initialData;

  const [formData, setFormData] = useState({
    name:                initialData?.name                || '',
    description:         initialData?.description         || '',
    confidentiality_req: initialData?.confidentiality_req ?? 3,
    integrity_req:       initialData?.integrity_req       ?? 3,
    availability_req:    initialData?.availability_req    ?? 3,
    organization_id:     organizationId,
  });

  const [formErrors, setFormErrors]     = useState({});
  const [serverError, setServerError]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'range' ? parseInt(value, 10) : value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true); setFormErrors({}); setServerError('');
    // Validación local
    const errs = {};
    if (!formData.name.trim()) errs.name = 'El nombre del activo es obligatorio.';
    if (Object.keys(errs).length) { setFormErrors(errs); setIsSubmitting(false); return; }

    try {
      let response;
      if (isEditing) {
        response = await axios.put(`/api/assets/${initialData.id}`, formData);
      } else {
        response = await axios.post('/api/assets', formData);
      }
      onSuccess(response.data.data);
    } catch (error) {
      if (error.response?.status === 400 && error.response.data.details) {
        const map = {};
        error.response.data.details.forEach(e => { map[e.path] = e.message; });
        setFormErrors(map);
      } else {
        setServerError(error.response?.data?.message || 'Error inesperado. Inténtelo de nuevo.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const riskScore  = formData.confidentiality_req + formData.integrity_req + formData.availability_req;
  const scoreColor = riskScore >= 12 ? 'var(--danger)' : riskScore >= 8 ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="glass-panel" style={{ marginBottom: '2rem', borderLeft: isEditing ? '4px solid var(--warning)' : undefined }}>
      <form onSubmit={handleSubmit} data-testid="asset-form">
        <fieldset>
          <legend>{isEditing ? `✏️ Editando: ${initialData.name}` : 'Registrar Activo de Información'}</legend>

          {serverError && <div className="alert-error">{serverError}</div>}

          <div className="form-group">
            <label htmlFor="asset-name">Nombre del Activo *</label>
            <input
              id="asset-name" type="text" name="name"
              value={formData.name} onChange={handleChange}
              className={formErrors.name ? 'input-error' : ''}
              placeholder="Ej: Base de datos de clientes, Servidor web..."
              data-testid="input-asset-name"
            />
            {formErrors.name && <span className="error-text" data-testid="error-asset-name">{formErrors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="asset-desc">Descripción</label>
            <input
              id="asset-desc" type="text" name="description"
              value={formData.description} onChange={handleChange}
              placeholder="Descripción breve del activo..."
              data-testid="input-asset-desc"
            />
          </div>

          <div style={{ background:'rgba(0,0,0,0.15)', borderRadius:'.75rem', padding:'1rem', marginTop:'.5rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'1rem', alignItems:'center' }}>
              <span style={{ fontWeight:600, fontSize:'.9rem' }}>Valoración C-I-A</span>
              <span style={{ fontWeight:700, color:scoreColor }}>Criticidad: {riskScore}/15</span>
            </div>
            {[
              { name:'confidentiality_req', label:'Confidencialidad', hint:'Impacto si los datos son expuestos' },
              { name:'integrity_req',       label:'Integridad',       hint:'Impacto si los datos son alterados' },
              { name:'availability_req',    label:'Disponibilidad',   hint:'Impacto si el activo deja de funcionar' },
            ].map(({ name, label, hint }) => (
              <div className="form-group" key={name} style={{ marginBottom:'.75rem' }}>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <label style={{ marginBottom:0 }}>{label}</label>
                  <span style={{ fontWeight:700, color:'var(--accent)' }}>{formData[name]}/5</span>
                </div>
                <input type="range" min="1" max="5" name={name} value={formData[name]} onChange={handleChange} style={{ width:'100%' }} data-testid={`slider-asset-${name[0]}`} />
                <span className="text-secondary text-small">{hint}</span>
              </div>
            ))}
          </div>

          <div style={{ display:'flex', gap:'1rem', marginTop:'1rem' }}>
            {(isEditing || onCancel) && (
              <button type="button" className="btn-primary outline" onClick={onCancel || (() => {})}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn-primary full-width" disabled={isSubmitting} data-testid="submit-asset-btn" style={{ flex:1 }}>
              {isSubmitting ? 'Guardando…' : isEditing ? '💾 Guardar cambios' : 'Guardar Activo'}
            </button>
          </div>
        </fieldset>
      </form>
    </div>
  );
};

export default AssetForm;