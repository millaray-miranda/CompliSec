import React, { useState, useEffect } from 'react';
import axios from '../../utils/axiosSetup';
import AssetForm from './AssetForm';

const PAGE_SIZE = 8;

const SkeletonRow = () => (
  <tr>
    {[180, 220, 120, 90, 80].map((w, i) => (
      <td key={i}>
        <div style={{
          height: 14, width: w, borderRadius: 6,
          background: 'linear-gradient(90deg,rgba(255,255,255,.04) 25%,rgba(255,255,255,.1) 50%,rgba(255,255,255,.04) 75%)',
          backgroundSize: '200% 100%', animation: 'shimmer 1.4s infinite',
        }} />
      </td>
    ))}
  </tr>
);

const AssetList = ({ organizationId }) => {
  const [assets, setAssets]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [error, setError]               = useState('');
  const [page, setPage]                 = useState(1);
  const [deletingId, setDeletingId]     = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchAssets = async () => {
    setLoading(true); setError('');
    try {
      const res = await axios.get(`/api/assets?organization_id=${organizationId}`);
      setAssets(res.data.data || []);
    } catch { setError('Error al cargar los activos.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (organizationId) fetchAssets(); }, [organizationId]);

  const handleAssetCreated = (a) => { setAssets(p => [a, ...p]); setShowForm(false); setPage(1); };
  const handleAssetUpdated = (a) => { setAssets(p => p.map(x => x.id === a.id ? a : x)); setEditingAsset(null); };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await axios.delete(`/api/assets/${id}?organization_id=${organizationId}`);
      const next = assets.filter(a => a.id !== id);
      setAssets(next);
      setConfirmDelete(null);
      if ((page - 1) * PAGE_SIZE >= next.length && page > 1) setPage(p => p - 1);
    } catch { setError('No se pudo eliminar el activo.'); }
    finally { setDeletingId(null); }
  };

  const getCiaClass = (s) => s >= 12 ? 'risk-high' : s >= 8 ? 'risk-medium' : 'risk-low';
  const getCiaLabel = (s) => s >= 12 ? 'ALTA' : s >= 8 ? 'MEDIA' : 'BAJA';

  const totalPages = Math.ceil(assets.length / PAGE_SIZE);
  const paginated  = assets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="assets-container">
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        .act-btn{background:none;border:1px solid var(--border);border-radius:6px;padding:.3rem .65rem;font-size:.75rem;cursor:pointer;color:var(--text-secondary);transition:all .15s}
        .act-btn:disabled{opacity:.4;cursor:not-allowed}
        .act-btn:not(:disabled):hover{background:rgba(255,255,255,.07)}
        .act-btn.edit:not(:disabled):hover{border-color:rgba(59,130,246,.5);color:var(--accent);background:rgba(59,130,246,.08)}
        .act-btn.danger:not(:disabled):hover{border-color:rgba(239,68,68,.5);color:var(--danger);background:rgba(239,68,68,.08)}
        .act-btn.active{background:var(--accent);border-color:var(--accent);color:#fff;font-weight:700}
      `}</style>

      <div className="section-header">
        <div>
          <h2>Inventario de Activos</h2>
          <p className="text-secondary text-small" style={{ margin: '0.25rem 0 0' }}>
            Cláusula A.8 — {assets.length} activo{assets.length !== 1 ? 's' : ''} registrado{assets.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(p => !p); setEditingAsset(null); }} data-testid="toggle-asset-form">
          {showForm ? 'Cancelar' : '+ Registrar Activo'}
        </button>
      </div>

      {showForm && !editingAsset && <AssetForm organizationId={organizationId} onSuccess={handleAssetCreated} />}
      {editingAsset && (
        <AssetForm
          organizationId={organizationId}
          initialData={editingAsset}
          onSuccess={handleAssetUpdated}
          onCancel={() => setEditingAsset(null)}
        />
      )}

      {error && <div className="alert-error">{error}</div>}

      {/* Modal confirmación borrado */}
      {confirmDelete && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.65)', zIndex:200, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div className="glass-panel" style={{ maxWidth:380, width:'90%', padding:'1.75rem', textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:'.75rem' }}>⚠️</div>
            <h3 style={{ margin:'0 0 .5rem' }}>¿Eliminar activo?</h3>
            <p className="text-secondary" style={{ marginBottom:'1.5rem', fontSize:'.88rem' }}>
              Esta acción no se puede deshacer. Los riesgos asociados también serán eliminados.
            </p>
            <div style={{ display:'flex', gap:'.75rem', justifyContent:'center' }}>
              <button className="act-btn" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button
                className="btn-primary"
                style={{ background:'var(--danger)', borderColor:'var(--danger)', opacity:deletingId ? .7 : 1 }}
                disabled={!!deletingId}
                onClick={() => handleDelete(confirmDelete)}
              >
                {deletingId ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {!showForm && !editingAsset && (
        <div className="glass-panel">
          {loading ? (
            <table className="assets-table">
              <thead><tr><th>Nombre</th><th>Descripción</th><th>Puntaje C-I-A</th><th>Criticidad</th><th>Acciones</th></tr></thead>
              <tbody>{[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}</tbody>
            </table>
          ) : assets.length === 0 ? (
            <div style={{ textAlign:'center', padding:'3rem' }}>
              <p className="text-secondary" style={{ marginBottom:'1rem' }}>No hay activos registrados. Comienza añadiendo tus sistemas y datos críticos.</p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>Registrar primer activo</button>
            </div>
          ) : (
            <>
              <table className="assets-table" data-testid="assets-table">
                <thead>
                  <tr>
                    <th>Nombre del Activo</th><th>Descripción</th><th>Puntaje C-I-A</th><th>Criticidad</th>
                    <th style={{ textAlign:'right' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(asset => {
                    const s = asset.confidentiality_req + asset.integrity_req + asset.availability_req;
                    return (
                      <tr key={asset.id} data-testid={`asset-row-${asset.id}`}>
                        <td><strong>{asset.name}</strong></td>
                        <td><span className="text-secondary text-small">{asset.description || '—'}</span></td>
                        <td>
                          <span className="badge" style={{ marginRight:'.25rem' }}>C:{asset.confidentiality_req}</span>
                          <span className="badge" style={{ marginRight:'.25rem' }}>I:{asset.integrity_req}</span>
                          <span className="badge">A:{asset.availability_req}</span>
                        </td>
                        <td><span className={`status-badge ${getCiaClass(s)}`}>{getCiaLabel(s)} ({s})</span></td>
                        <td>
                          <div style={{ display:'flex', gap:'.4rem', justifyContent:'flex-end' }}>
                            <button className="act-btn edit" onClick={() => { setEditingAsset(asset); setShowForm(false); }}>✏️ Editar</button>
                            <button className="act-btn danger" onClick={() => setConfirmDelete(asset.id)}>🗑️ Eliminar</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {totalPages > 1 && (
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'.8rem', color:'var(--text-secondary)' }}>
                    Mostrando {(page-1)*PAGE_SIZE+1}–{Math.min(page*PAGE_SIZE, assets.length)} de {assets.length}
                  </span>
                  <div style={{ display:'flex', gap:'.4rem' }}>
                    <button className="act-btn" disabled={page===1} onClick={() => setPage(p=>p-1)}>← Anterior</button>
                    {[...Array(totalPages)].map((_,i) => (
                      <button key={i} className={`act-btn${page===i+1?' active':''}`} onClick={() => setPage(i+1)}>{i+1}</button>
                    ))}
                    <button className="act-btn" disabled={page===totalPages} onClick={() => setPage(p=>p+1)}>Siguiente →</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default AssetList;