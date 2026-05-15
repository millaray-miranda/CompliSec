import React, { useState } from 'react';
import axios from '../../utils/axiosSetup';

const calcScore = (prob, impact) => Math.round((prob / 100) * (impact / 100) * 100);

const riskMeta = (score) => {
  if (score >= 70) return { color: 'var(--danger)',  label: 'Crítico' };
  if (score >= 45) return { color: 'var(--warning)', label: 'Alto'    };
  if (score >= 20) return { color: 'var(--accent)',  label: 'Medio'   };
  return               { color: 'var(--success)', label: 'Bajo'    };
};

const STEPS = ['Empresa','Infraestructura','Acceso A.9','Operaciones A.12','Incidentes A.16','Perfil de riesgo','Revisión'];
const TRI_MAP = { no: 88, sin: 52, ok: 14 };

// ─── TriGroup ────────────────────────────────────────────────────────────────
function TriGroup({ groupKey, state, onSelect, options }) {
  const vs = {
    no:  { border:'var(--danger)',  bg:'rgba(239,68,68,.08)',  text:'var(--danger)'  },
    sin: { border:'var(--warning)', bg:'rgba(245,158,11,.08)', text:'var(--warning)' },
    ok:  { border:'var(--success)', bg:'rgba(16,185,129,.08)', text:'var(--success)' },
  };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'0.6rem' }}>
      {options.map(([v, title, desc]) => {
        const active = state[groupKey] === v;
        return (
          <div key={v} onClick={() => onSelect(groupKey, v)} style={{
            border: `1.5px solid ${active ? vs[v].border : 'var(--border)'}`,
            borderRadius:10, padding:'0.75rem', cursor:'pointer', textAlign:'center',
            background: active ? vs[v].bg : 'rgba(255,255,255,.03)', transition:'all .15s',
          }}>
            <div style={{ fontSize:'0.85rem', fontWeight:600, marginBottom:3, color: active ? vs[v].text : 'var(--text-primary)' }}>{title}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{desc}</div>
          </div>
        );
      })}
    </div>
  );
}

const DEFAULT_TRI = [['no','No existe','Sin registro'],['sin','Existe','Sin documentar'],['ok','Documentado','Con evidencia']];

// ─── UI helpers ──────────────────────────────────────────────────────────────
const FG = ({ label, iso, children }) => (
  <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
    <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', flexWrap:'wrap' }}>
      <span style={{ fontSize:'0.88rem', color:'var(--text-secondary)', fontWeight:500 }}>{label}</span>
      {iso && <span style={{ fontSize:'0.7rem', fontWeight:600, color:'var(--success)', background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', borderRadius:20, padding:'1px 8px' }}>{iso}</span>}
    </div>
    {children}
  </div>
);

const Sel = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={onChange} style={{ background:'rgba(0,0,0,.25)', border:'1px solid var(--border)', borderRadius:8, padding:'0.7rem 1rem', color:'var(--text-primary)', fontSize:'0.9rem', outline:'none', width:'100%', cursor:'pointer' }}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}
  </select>
);

const Badge = ({ children }) => (
  <span style={{ display:'inline-flex', alignItems:'center', background:'rgba(16,185,129,.08)', border:'1px solid rgba(16,185,129,.2)', borderRadius:20, padding:'3px 10px', fontSize:'0.75rem', color:'var(--success)', fontWeight:600 }}>{children}</span>
);

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
const DiagnosticWizard = ({ organizationId, userName, onComplete }) => {
  const [step, setStep]     = useState(0);
  const [tri, setTri]       = useState({});
  const [checks, setChecks] = useState({});
  const [evSel, setEvSel]   = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const [sel, setSels] = useState({ dataSensitivity:'', regulation:'No aplica', providers:'', systems:'', patches:'', rto:'', training:'', providerClauses:'' });
  const s = (k,v) => setSels(p => ({...p, [k]:v}));

  const [riskData, setRiskData] = useState({
    acceso: { label:'Control de acceso (A.9)', prob:0, impact:0 },
    cripto: { label:'Criptografía (A.10)',      prob:0, impact:0 },
    ops:    { label:'Operaciones (A.12)',        prob:0, impact:0 },
    inc:    { label:'Incidentes (A.16)',         prob:0, impact:0 },
    cont:   { label:'Continuidad (A.17)',        prob:0, impact:0 },
  });

  const handleTri = (group, v) => {
    setTri(prev => ({...prev, [group]:v}));
    const p = TRI_MAP[v] ?? 0;
    setRiskData(prev => {
      const n = {...prev};
      if (group==='mfa')     n.acceso = {...n.acceso, prob:p, impact:80};
      if (group==='cripto')  n.cripto = {...n.cripto, prob:p, impact:85};
      if (group==='logs')    n.ops    = {...n.ops,    prob:p, impact:75};
      if (group==='backup')  n.cont   = {...n.cont,   prob:p, impact:78};
      if (group==='inc')     n.inc    = {...n.inc,    prob:p, impact:70};
      if (group==='accesos') n.acceso = {...n.acceso, prob:p, impact:80};
      return n;
    });
  };

  const handleFinish = async () => {
    setSaving(true); setError('');
    const risks = Object.entries(riskData).map(([key,r]) => {
      const score = calcScore(r.prob, r.impact);
      const { label } = riskMeta(score);
      return { domain_key:key, domain_label:r.label, probability:r.prob, impact_value:r.impact, risk_score:score, risk_level_label:label };
    });
    try {
      await axios.post('/api/diagnostic', { organization_id:organizationId, risks });
      onComplete(risks);
    } catch {
      setError('No se pudo guardar el diagnóstico. Puedes intentarlo más tarde desde el dashboard.');
      setSaving(false);
    }
  };

  // Sidebar vertical de pasos
  const Stepbar = () => (
    <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
      {STEPS.map((label, i) => {
        const done = i < step, active = i === step;
        return (
          <div key={i}
            onClick={() => done && setStep(i)}
            style={{
              display:'flex', alignItems:'center', gap:'0.75rem',
              padding:'0.55rem 0.75rem', borderRadius:8,
              cursor: done ? 'pointer' : 'default',
              background: active ? 'rgba(59,130,246,.12)' : 'transparent',
              border: active ? '1px solid rgba(59,130,246,.25)' : '1px solid transparent',
              transition:'all .2s',
            }}
          >
            <div style={{
              width:28, height:28, borderRadius:'50%', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'0.75rem', fontWeight:700,
              border:`2px solid ${done ? 'var(--success)' : active ? 'var(--accent)' : 'var(--border)'}`,
              color: done ? 'var(--success)' : active ? '#fff' : 'var(--text-secondary)',
              background: active ? 'var(--accent)' : done ? 'rgba(16,185,129,.1)' : 'transparent',
              transition:'all .2s',
            }}>
              {done ? '✓' : i+1}
            </div>
            <span style={{
              fontSize:'0.82rem', fontWeight:600,
              color: active ? 'var(--text-primary)' : done ? 'var(--success)' : 'var(--text-secondary)',
            }}>{label}</span>
          </div>
        );
      })}
    </div>
  );

  // ── Pasos ────────────────────────────────────────────────────────────────
  const steps = [

    // 0 — Empresa
    <div key={0} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div><h2 style={{ fontSize:'1.5rem', fontWeight:700, margin:'0 0 .4rem', letterSpacing:'-.02em' }}>Contexto de tu organización</h2>
      <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.9rem' }}>Este diagnóstico calcula tu perfil de riesgo ISO 27001 basado en el estado actual de tu seguridad.</p></div>
      <FG label="¿Qué tipo de datos manejan?" iso="define impacto base">
        <Sel value={sel.dataSensitivity} onChange={e=>s('dataSensitivity',e.target.value)} placeholder="Seleccionar..." options={[['pub','Datos públicos'],['int','Datos internos'],['conf','Datos confidenciales de clientes'],['crit','Datos críticos (salud, financiero, legal)']]} />
      </FG>
      <FG label="¿Tienen requisitos regulatorios externos?" iso="A.18">
        <Sel value={sel.regulation} onChange={e=>s('regulation',e.target.value)} options={[['No aplica','No aplica'],['RGPD / Ley 19.628','RGPD / Ley 19.628'],['PCI-DSS','PCI-DSS (pagos)'],['HIPAA','HIPAA (salud)'],['SOC 2','SOC 2'],['Otro','Otro']]} />
      </FG>
      <FG label="Tipo de infraestructura principal">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
          {[['cloud','☁️ Nube pública','AWS, Azure, GCP'],['hybrid','🔀 Nube híbrida','On-premise + nube'],['own','🖥️ Servidores propios','Data center local'],['saas','📦 Solo SaaS','Apps de terceros']].map(([k,t,d]) => (
            <div key={k} onClick={()=>setTri(p=>({...p,infra:k}))} style={{ border:`1.5px solid ${tri.infra===k?'var(--accent)':'var(--border)'}`, borderRadius:10, padding:'0.85rem 1rem', cursor:'pointer', background: tri.infra===k?'rgba(59,130,246,.08)':'rgba(255,255,255,.03)', transition:'all .15s' }}>
              <div style={{ fontSize:'0.85rem', fontWeight:600, color: tri.infra===k?'var(--accent)':'var(--text-primary)', marginBottom:2 }}>{t}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{d}</div>
            </div>
          ))}
        </div>
      </FG>
    </div>,

    // 1 — Infraestructura
    <div key={1} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div><h2 style={{ fontSize:'1.5rem', fontWeight:700, margin:'0 0 .4rem', letterSpacing:'-.02em' }}>Infraestructura y proveedores</h2>
      <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.9rem' }}>Determina la superficie de riesgo técnico y los controles aplicables.</p></div>
      <FG label="¿Proveedores externos con acceso a sus sistemas o datos?" iso="A.15">
        <Sel value={sel.providers} onChange={e=>s('providers',e.target.value)} placeholder="Seleccionar..." options={[['no','No, todo es interno'],['con','Sí, con contrato de confidencialidad'],['sin','Sí, sin contratos formales']]} />
      </FG>
      <FG label="¿Tienen inventario documentado de activos de información?" iso="A.8">
        <TriGroup groupKey="inv" state={tri} onSelect={handleTri} options={DEFAULT_TRI} />
      </FG>
      <FG label="¿Cuántos sistemas o aplicaciones críticas tienen?" iso="A.8.1">
        <Sel value={sel.systems} onChange={e=>s('systems',e.target.value)} placeholder="Seleccionar..." options={[['1-3','Entre 1 y 3'],['4-10','Entre 4 y 10'],['10+','Más de 10']]} />
      </FG>
    </div>,

    // 2 — Acceso
    <div key={2} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div><div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.6rem', flexWrap:'wrap' }}><Badge>A.9 Control de acceso</Badge><Badge>A.10 Criptografía</Badge></div>
      <h2 style={{ fontSize:'1.5rem', fontWeight:700, margin:'0 0 .4rem', letterSpacing:'-.02em' }}>Identidad y protección de datos</h2>
      <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.9rem' }}>Tus respuestas calculan la probabilidad de riesgo en estos dominios en tiempo real.</p></div>
      <FG label="¿Tienen proceso para dar/quitar accesos cuando alguien entra o sale?" iso="A.9.2">
        <TriGroup groupKey="accesos" state={tri} onSelect={handleTri} options={[['no','No existe','Informal'],['sin','Existe','Sin documentar'],['ok','Documentado','Con responsable']]} />
      </FG>
      <FG label="¿Los sistemas críticos usan autenticación de doble factor (MFA)?" iso="A.9.4.2">
        <TriGroup groupKey="mfa" state={tri} onSelect={handleTri} options={[['no','No existe','Solo contraseña'],['sin','Parcial','Solo algunos'],['ok','Implementado','Con evidencia']]} />
      </FG>
      <FG label="¿Los datos sensibles están cifrados en reposo y en tránsito?" iso="A.10.1.1">
        <TriGroup groupKey="cripto" state={tri} onSelect={handleTri} options={[['no','No existe','Sin cifrado'],['sin','Parcial','Solo HTTPS'],['ok','Completo','Reposo + tránsito']]} />
      </FG>
    </div>,

    // 3 — Operaciones
    <div key={3} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div><div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.6rem', flexWrap:'wrap' }}><Badge>A.12 Operaciones</Badge><Badge>A.17 Continuidad</Badge></div>
      <h2 style={{ fontSize:'1.5rem', fontWeight:700, margin:'0 0 .4rem', letterSpacing:'-.02em' }}>Trazabilidad y respaldo</h2>
      <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.9rem' }}>La ausencia de logs y backups probados son los hallazgos más frecuentes en Pymes.</p></div>
      <FG label="¿Tienen logs de acceso conservados por al menos 90 días?" iso="A.12.4.1">
        <TriGroup groupKey="logs" state={tri} onSelect={handleTri} options={[['no','No existen','Sin registro'],['sin','Existen','Retención < 90d'],['ok','Configurados','≥90d, exportables']]} />
      </FG>
      <FG label="¿Aplican parches de seguridad con frecuencia definida?" iso="A.12.6.1">
        <Sel value={sel.patches} onChange={e=>s('patches',e.target.value)} placeholder="Seleccionar..." options={[['nunca','Nunca / cuando recordamos'],['incidente','Solo al haber incidente'],['mensual-sr','Mensual, sin registro'],['mensual-cr','Mensual, con registro']]} />
      </FG>
      <FG label="¿Tienen backups probados de datos críticos?" iso="A.17.1">
        <TriGroup groupKey="backup" state={tri} onSelect={handleTri} options={[['no','Sin backups','Sin proceso'],['sin','Backups activos','Sin prueba'],['ok','Probados','Restauración doc.']]} />
      </FG>
      <FG label="¿Cuánto tardarían en volver a operar si el sistema falla?" iso="A.17 RTO">
        <Sel value={sel.rto} onChange={e=>s('rto',e.target.value)} placeholder="Seleccionar..." options={[['?','No lo sabemos'],['48+','Más de 48 horas'],['4-48','Entre 4 y 48 horas'],['<4','Menos de 4 horas (documentado)']]} />
      </FG>
    </div>,

    // 4 — Incidentes
    <div key={4} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div><div style={{ display:'flex', gap:'0.5rem', marginBottom:'0.6rem', flexWrap:'wrap' }}><Badge>A.16 Incidentes</Badge><Badge>A.7 RRHH</Badge><Badge>A.15 Proveedores</Badge></div>
      <h2 style={{ fontSize:'1.5rem', fontWeight:700, margin:'0 0 .4rem', letterSpacing:'-.02em' }}>Respuesta y personas</h2>
      <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.9rem' }}>Los procedimientos deben estar documentados y las personas deben conocerlos.</p></div>
      <FG label="Si detectan acceso no autorizado mañana, ¿tienen documentado qué hacer?" iso="A.16.1.1">
        <TriGroup groupKey="inc" state={tri} onSelect={handleTri} options={[['no','No existe','Actuaríamos ad-hoc'],['sin','Existe','Sin documentar'],['ok','Documentado','Responsable asignado']]} />
      </FG>
      <FG label="¿Sus empleados han recibido capacitación en seguridad en el último año?" iso="A.7.2.2">
        <Sel value={sel.training} onChange={e=>s('training',e.target.value)} placeholder="Seleccionar..." options={[['nunca','Nunca han recibido'],['1año+','Hace más de un año'],['1año-sr','En el último año, sin registro'],['1año-cr','En el último año, con registro']]} />
      </FG>
      <FG label="¿Sus proveedores con acceso a datos tienen cláusulas de seguridad?" iso="A.15.1">
        <Sel value={sel.providerClauses} onChange={e=>s('providerClauses',e.target.value)} placeholder="Seleccionar..." options={[['na','No tenemos proveedores con acceso'],['sin-cc','Sí, pero sin cláusulas'],['nda','Sí, con NDA básico'],['cc','Sí, con cláusulas detalladas']]} />
      </FG>
    </div>,

    // 5 — Perfil de riesgo
    (() => {
      const riskList = Object.entries(riskData).map(([key,r]) => {
        const score = calcScore(r.prob, r.impact);
        return { key, ...r, score, ...riskMeta(score) };
      });
      const critical = riskList.filter(r=>r.score>=70).length;
      const high     = riskList.filter(r=>r.score>=45&&r.score<70).length;
      const low      = riskList.filter(r=>r.score<45).length;
      return (
        <div key={5} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div><h2 style={{ fontSize:'1.5rem', fontWeight:700, margin:'0 0 .4rem', letterSpacing:'-.02em' }}>Tu perfil de riesgo inicial</h2>
          <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.9rem' }}>Calculado en base a tus respuestas. Aparecerá en el dashboard hasta que evalúes riesgos específicos por activo.</p></div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem' }}>
            {[['Críticos',critical,'var(--danger)'],['Altos',high,'var(--warning)'],['Controlados',low,'var(--success)']].map(([l,n,c]) => (
              <div key={l} className="glass-panel" style={{ textAlign:'center', padding:'1.25rem' }}>
                <div style={{ fontSize:'2.5rem', fontWeight:700, color:c, lineHeight:1 }}>{n}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', marginTop:'0.35rem', textTransform:'uppercase', letterSpacing:'.05em' }}>{l}</div>
              </div>
            ))}
          </div>
          <div className="glass-panel">
            <div style={{ fontSize:'0.78rem', fontWeight:600, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'.06em', marginBottom:'1rem' }}>Exposición por dominio</div>
            {riskList.map(r => (
              <div key={r.key} style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.85rem' }}>
                <span style={{ fontSize:'0.82rem', color:'var(--text-secondary)', width:185, flexShrink:0 }}>{r.label}</span>
                <div style={{ flex:1, height:6, background:'rgba(255,255,255,.06)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:6, width:`${r.score||2}%`, background:r.color, borderRadius:3, transition:'width .6s ease' }} />
                </div>
                <span style={{ fontSize:'0.78rem', fontWeight:600, color:r.color, width:52, textAlign:'right', flexShrink:0 }}>{r.label}</span>
              </div>
            ))}
          </div>
          <FG label="¿Qué tipo de evidencia tienen disponible hoy?">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              {[['doc','📄 Documento / política','PDF o Word con fecha y firma'],['config','⚙️ Configuración exportada','Captura o export del sistema'],['log','📋 Registro de actividad','Log con timestamps'],['test','🧪 Resultado de prueba','Test o simulacro documentado']].map(([k,t,d]) => (
                <div key={k} onClick={()=>setEvSel(k)} style={{ border:`1.5px solid ${evSel===k?'var(--accent)':'var(--border)'}`, borderRadius:10, padding:'0.85rem 1rem', cursor:'pointer', background: evSel===k?'rgba(59,130,246,.08)':'rgba(255,255,255,.03)', transition:'all .15s' }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, color: evSel===k?'var(--accent)':'var(--text-primary)', marginBottom:2 }}>{t}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-secondary)' }}>{d}</div>
                </div>
              ))}
            </div>
          </FG>
          <div style={{ background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.2)', borderRadius:8, padding:'0.75rem 1rem', fontSize:'0.82rem', color:'var(--warning)' }}>
            ⚠️ Una política escrita NO es evidencia de implementación. Se requieren ambas por separado.
          </div>
        </div>
      );
    })(),

    // 6 — Revisión
    <div key={6} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <div><h2 style={{ fontSize:'1.5rem', fontWeight:700, margin:'0 0 .4rem', letterSpacing:'-.02em' }}>Revisión y compromisos</h2>
      <p style={{ color:'var(--text-secondary)', margin:0, fontSize:'0.9rem' }}>Un auditor externo rechazará evidencias que nadie interno haya validado.</p></div>
      <FG label="Responsable interno de seguridad" iso="segunda firma requerida">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
          {['Nombre completo','Cargo o rol'].map(ph => (
            <input key={ph} placeholder={ph} style={{ background:'rgba(0,0,0,.25)', border:'1px solid var(--border)', borderRadius:8, padding:'0.7rem 1rem', color:'var(--text-primary)', fontSize:'0.9rem', outline:'none' }} />
          ))}
        </div>
      </FG>
      <FG label="Checklist de compromisos auditables">
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
          {[['r1','Las evidencias serán revisadas por otra persona antes de cada auditoría','A.6'],['r2','Los controles se revisarán al menos cada 12 meses','Cláusula 9'],['r3','Los hallazgos tendrán un plazo de subsanación definido','Cláusula 10'],['r4','Los cambios en controles quedarán en historial con fecha y responsable','A.12.4'],['r5','El SoA (Declaración de Aplicabilidad) será mantenido actualizado','Anexo A']].map(([k,txt,iso]) => (
            <div key={k} onClick={()=>setChecks(p=>({...p,[k]:!p[k]}))} style={{ display:'flex', alignItems:'center', gap:'0.75rem', background: checks[k]?'rgba(16,185,129,.06)':'rgba(255,255,255,.03)', border:`1px solid ${checks[k]?'rgba(16,185,129,.3)':'var(--border)'}`, borderRadius:8, padding:'0.75rem 1rem', cursor:'pointer', transition:'all .15s' }}>
              <div style={{ width:18, height:18, borderRadius:4, flexShrink:0, border:`2px solid ${checks[k]?'var(--success)':'var(--border)'}`, background: checks[k]?'var(--success)':'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>
                {checks[k] && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)', flex:1 }}>{txt}</span>
              <span style={{ fontSize:'0.7rem', color:'var(--success)', background:'rgba(16,185,129,.1)', border:'1px solid rgba(16,185,129,.2)', borderRadius:10, padding:'1px 7px', flexShrink:0, fontWeight:600 }}>{iso}</span>
            </div>
          ))}
        </div>
      </FG>
      <FG label="Frecuencia de revisión interna comprometida">
        <Sel value="12m" onChange={()=>{}} options={[['6m','Cada 6 meses'],['12m','Cada 12 meses (mínimo ISO)'],['3m','Trimestral']]} />
      </FG>
      {error && <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.3)', borderRadius:8, padding:'0.75rem 1rem', fontSize:'0.85rem', color:'var(--danger)' }}>{error}</div>}
    </div>,
  ];

  const pct = Math.round((step / (STEPS.length - 1)) * 100);

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg-color)', display:'flex', flexDirection:'column' }}>
      <style>{`select option { background: #2d3748; color: #f8fafc; }`}</style>

      {/* Header */}
      <div style={{ borderBottom:'1px solid var(--border)', padding:'0.85rem 2rem', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:10, background:'rgba(15,23,42,.9)', backdropFilter:'blur(12px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.6rem' }}>
          <img src="/logo.png" alt="CompliSec" width={28} height={28} style={{ borderRadius:6, objectFit:'contain' }} onError={e=>{e.target.style.display='none';}} />
          <span style={{ fontWeight:700, fontSize:'1rem' }}>Compli<span style={{ color:'var(--success)' }}>Sec</span></span>
          <span style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginLeft:4 }}>— Diagnóstico ISO 27001</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          {userName && <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>Hola, {userName.split(' ')[0]} 👋</span>}
          <button onClick={()=>onComplete([])} style={{ background:'none', border:'1px solid var(--border)', color:'var(--text-secondary)', fontSize:'0.8rem', padding:'0.35rem 0.9rem', borderRadius:6, cursor:'pointer' }}>
            Completar más tarde
          </button>
        </div>
      </div>

      {/* Contenido — sidebar + área principal */}
      <div style={{ flex:1, maxWidth:1000, width:'100%', margin:'0 auto', padding:'2.5rem 1.5rem', display:'flex', gap:'1.5rem', alignItems:'flex-start' }}>

        {/* Sidebar vertical */}
        <div className="glass-panel" style={{ width:210, flexShrink:0, padding:'1.25rem 1rem', position:'sticky', top:'4.5rem' }}>
          <div style={{ marginBottom:'1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.4rem' }}>
              <span style={{ fontSize:'0.72rem', color:'var(--text-secondary)' }}>Progreso</span>
              <span style={{ fontSize:'0.72rem', color:'var(--success)', fontWeight:700 }}>{pct}%</span>
            </div>
            <div style={{ height:3, background:'rgba(255,255,255,.06)', borderRadius:2, overflow:'hidden' }}>
              <div style={{ height:3, width:`${pct}%`, background:'linear-gradient(90deg,var(--accent),var(--success))', borderRadius:2, transition:'width .4s ease' }} />
            </div>
          </div>
          <Stepbar />
        </div>

        {/* Área de contenido */}
        <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'1.25rem' }}>
          <div className="glass-panel" style={{ padding:'2rem' }}>
            {steps[step]}
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <button onClick={()=>step>0&&setStep(s=>s-1)} disabled={step===0} style={{ padding:'0.75rem 1.75rem', borderRadius:8, fontSize:'0.9rem', fontWeight:600, cursor: step===0?'not-allowed':'pointer', background:'transparent', color: step===0?'var(--border)':'var(--text-secondary)', border:`1px solid ${step===0?'var(--border)':'rgba(255,255,255,.15)'}` }}>
              ← Anterior
            </button>
            <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)' }}>Paso {step+1} de {STEPS.length}</span>
            {step < STEPS.length-1 ? (
              <button onClick={()=>setStep(s=>s+1)} className="btn-primary" style={{ padding:'0.75rem 1.75rem', fontSize:'0.9rem' }}>
                Siguiente →
              </button>
            ) : (
              <button onClick={handleFinish} disabled={saving} className="btn-primary" style={{ padding:'0.75rem 2rem', fontSize:'0.9rem', opacity:saving?0.7:1, cursor:saving?'not-allowed':'pointer' }}>
                {saving ? 'Guardando...' : '✅ Generar perfil de cumplimiento'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticWizard;