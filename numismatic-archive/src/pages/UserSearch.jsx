import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.jsx';
import { useWindowSize, isMobile } from '../hooks/useWindowSize.js';
import { fetchUsers } from '../services/usersService.js';
import { useToast } from '../context/ToastContext.jsx';

const F = {
  display: "'Cormorant Garamond', 'Playfair Display', serif",
  body:    "'Inter', sans-serif",
  mono:    "'JetBrains Mono', monospace",
};
const C = {
  navy:       '#011e4b',
  navyLight:  '#1c3461',
  gold:       '#785a00',
  goldLight:  '#ffdf9c',
  goldDim:    '#ecc15d',
  cream:      '#f4ece1',
  parchment:  '#fff8f2',
  parchmentLow: '#fff2df',
  inkDark:    '#241a07',
  inkLight:   '#44474f',
  outline:    '#757780',
  outlineVar: '#c4c6d0',
  bronze:     '#b89871',
};

function Corners() {
  const s = (t,l,r,b) => ({
    position:'absolute', width:12, height:12,
    borderTop: t ? `1px solid rgba(120,90,0,0.3)` : 'none',
    borderLeft: l ? `1px solid rgba(120,90,0,0.3)` : 'none',
    borderRight: r ? `1px solid rgba(120,90,0,0.3)` : 'none',
    borderBottom: b ? `1px solid rgba(120,90,0,0.3)` : 'none',
  });
  return (
    <>
      <div style={{ ...s(true,true,false,false), top:6, left:6 }} />
      <div style={{ ...s(true,false,true,false), top:6, right:6 }} />
      <div style={{ ...s(false,true,false,true), bottom:6, left:6 }} />
      <div style={{ ...s(false,false,true,true), bottom:6, right:6 }} />
    </>
  );
}

const BADGE_META = {
  workspace_premium: { color:'#ffdf9c', glow:'rgba(255,223,156,0.4)' },
  military_tech:     { color:'#cbd5e1', glow:'rgba(203,213,225,0.3)' },
  stars:             { color:'#fb923c', glow:'rgba(251,146,60,0.3)' },
};

const ROLE_COLORS = {
  usuario:      { bg:'rgba(1,30,75,0.08)',   color:'#011e4b', border:'rgba(1,30,75,0.2)' },
  certificador: { bg:'rgba(120,90,0,0.1)',   color:'#785a00', border:'rgba(120,90,0,0.3)' },
  admin:        { bg:'rgba(186,26,26,0.08)', color:'#ba1a1a', border:'rgba(186,26,26,0.2)' },
};

export default function UserSearch() {
  const { width } = useWindowSize();
  const mobile = isMobile(width);
  const navigate = useNavigate();
  const toast = useToast();
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('todos');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(() => toast.error('No se pudo cargar el directorio de eruditos.'))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter(u => {
      const matchQ = !q || u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q);
      const matchR = roleFilter === 'todos' || u.role === roleFilter;
      return matchQ && matchR;
    });
  }, [users, query, roleFilter]);

  return (
    <AppLayout>
      <div style={{ minHeight:'100vh', padding: mobile ? '16px' : '40px 48px', maxWidth: 900, margin:'0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <p style={{ fontFamily: F.mono, fontSize: 10, letterSpacing:'0.2em', textTransform:'uppercase', color: C.gold, marginBottom: 6 }}>
            ARCHIVO · DIRECTORIO
          </p>
          <h1 style={{ fontFamily: F.display, fontSize: mobile ? 28 : 38, fontWeight: 700, fontStyle:'italic', color: C.navy, margin: 0, lineHeight: 1.1 }}>
            Directorio de Eruditos
          </h1>
          <p style={{ fontFamily: F.body, fontSize: 14, color: C.inkLight, marginTop: 8, fontStyle:'italic' }}>
            Encuentre coleccionistas, archivistas y peritos del registro numismático.
          </p>
        </div>

        {/* Search bar */}
        <div data-tutorial="search-bar" style={{ position:'relative', marginBottom: 20 }}>
          <span className="material-symbols-outlined" style={{
            position:'absolute', left:16, top:'50%', transform:'translateY(-50%)',
            color: C.outline, fontSize: 22, pointerEvents:'none',
          }}>search</span>
          <input
            type="text"
            placeholder="Buscar por nombre o usuario..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              width:'100%', boxSizing:'border-box',
              padding:'14px 16px 14px 48px',
              fontFamily: F.body, fontSize: 15, color: C.inkDark,
              backgroundColor: C.parchmentLow,
              border:`1px solid ${C.outlineVar}`,
              borderRadius: 6, outline:'none',
              transition:'border-color 0.2s, box-shadow 0.2s',
              boxShadow:'0 2px 8px rgba(0,0,0,0.04)',
            }}
            onFocus={e => { e.target.style.borderColor = C.gold; e.target.style.boxShadow = `0 0 0 3px rgba(120,90,0,0.1)`; }}
            onBlur={e => { e.target.style.borderColor = C.outlineVar; e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{
              position:'absolute', right:14, top:'50%', transform:'translateY(-50%)',
              background:'none', border:'none', cursor:'pointer', color: C.outline, padding:4,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize:20 }}>close</span>
            </button>
          )}
        </div>

        {/* Filtro de rol */}
        <div style={{ display:'flex', gap:8, marginBottom:28, flexWrap:'wrap' }}>
          {[
            { key:'todos', label:'Todos' },
            { key:'usuario', label:'Usuarios' },
            { key:'certificador', label:'Certificadores' },
            { key:'admin', label:'Admins' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              style={{
                padding:'6px 16px',
                fontFamily: F.mono, fontSize: 10, letterSpacing:'0.1em', textTransform:'uppercase',
                border:`1px solid ${roleFilter === f.key ? C.gold : C.outlineVar}`,
                backgroundColor: roleFilter === f.key ? 'rgba(120,90,0,0.08)' : 'transparent',
                color: roleFilter === f.key ? C.gold : C.inkLight,
                borderRadius: 4, cursor:'pointer', transition:'all 0.15s',
              }}
            >
              {f.label}
            </button>
          ))}
          <span style={{ fontFamily: F.mono, fontSize: 10, color: C.outline, alignSelf:'center', marginLeft:'auto' }}>
            {results.length} resultado{results.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Resultados */}
        <div data-tutorial="search-results">
        {loading ? (
          <div style={{ textAlign:'center', padding:'64px 0', color: C.inkLight }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, display:'block', marginBottom:16, opacity:0.3 }}>hourglass_top</span>
            <p style={{ fontFamily: F.body, fontSize: 15, fontStyle:'italic' }}>Consultando el directorio del Archivo...</p>
          </div>
        ) : results.length === 0 ? (
          <div style={{ textAlign:'center', padding:'64px 0', color: C.inkLight }}>
            <span className="material-symbols-outlined" style={{ fontSize: 48, display:'block', marginBottom:16, opacity:0.3 }}>person_search</span>
            <p style={{ fontFamily: F.body, fontSize: 15, fontStyle:'italic' }}>No se encontraron eruditos con ese nombre.</p>
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap: 12 }}>
            {results.map(u => {
              const rc = ROLE_COLORS[u.role] || ROLE_COLORS.usuario;
              return (
                <div
                  key={u.id}
                  onClick={() => navigate(`/profile/${u.id}`)}
                  style={{
                    position:'relative', overflow:'hidden',
                    backgroundColor:'#ffffff',
                    border:`1px solid ${C.outlineVar}`,
                    borderRadius: 6,
                    padding: mobile ? '16px' : '20px 24px',
                    cursor:'pointer', transition:'all 0.15s',
                    display:'flex', alignItems:'center', gap: mobile ? 14 : 20,
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = C.goldDim || '#ecc15d';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = C.outlineVar;
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <Corners />

                  {/* Avatar */}
                  <div style={{
                    width: mobile ? 48 : 60, height: mobile ? 48 : 60, borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg, #5a4200 0%, #001230 100%)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    border:`2px solid rgba(255,223,156,0.3)`,
                    boxShadow:'0 2px 8px rgba(0,0,0,0.15)',
                  }}>
                    <span style={{ fontFamily: F.display, fontSize: mobile ? 18 : 22, fontWeight:700, fontStyle:'italic', color:'#ffffff', userSelect:'none' }}>
                      {u.name.split(' ').map(w=>w[0]).filter(c=>/[A-Z]/i.test(c)).slice(0,2).join('')}
                    </span>
                  </div>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                      <h3 style={{ fontFamily: F.display, fontSize: mobile ? 16 : 18, fontWeight:700, fontStyle:'italic', color: C.navy, margin:0 }}>
                        {u.name}
                      </h3>
                      <span style={{
                        padding:'3px 10px', borderRadius:9999,
                        fontFamily: F.mono, fontSize: 9, letterSpacing:'0.1em', textTransform:'uppercase',
                        backgroundColor: rc.bg, color: rc.color, border:`1px solid ${rc.border}`,
                      }}>
                        {u.roleLabel}
                      </span>
                    </div>
                    <p style={{ fontFamily: F.mono, fontSize: 10, color: C.outline, margin:'4px 0 8px', letterSpacing:'0.05em' }}>
                      @{u.username}
                    </p>
                    <div style={{ display:'flex', gap: mobile ? 12 : 20, flexWrap:'wrap' }}>
                      {u.role === 'usuario' && (
                        <>
                          <Stat icon="toll" label="Monedas" value={u.coins} />
                          <Stat icon="verified" label="Certif." value={u.certifications} />
                          <Stat icon="gavel" label="Subastas" value={u.auctions} />
                        </>
                      )}
                      {u.role === 'certificador' && (
                        <Stat icon="fact_check" label="Certificaciones" value={u.certifications} />
                      )}
                      <Stat icon="calendar_month" label="Desde" value={u.joined} text />
                    </div>
                  </div>

                  {/* Badges + rating */}
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8, flexShrink:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:4, backgroundColor:'#ffdf9c', borderRadius:9999, padding:'3px 10px', boxShadow:'0 1px 4px rgba(0,0,0,0.15)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize:12, fontVariationSettings:"'FILL' 1", color:'#251a00' }}>star</span>
                      <span style={{ fontFamily: F.mono, fontSize:11, fontWeight:700, color:'#251a00' }}>{u.rating}</span>
                    </div>
                    {!mobile && (
                      <div style={{ display:'flex', gap:6 }}>
                        {u.badges.map(b => {
                          const bm = BADGE_META[b] || { color:'#ffdf9c', glow:'rgba(255,223,156,0.3)' };
                          return (
                            <div key={b} style={{ width:28, height:28, borderRadius:'50%', backgroundColor:'rgba(0,0,0,0.06)', display:'flex', alignItems:'center', justifyContent:'center', border:`1px solid rgba(0,0,0,0.1)` }}>
                              <span className="material-symbols-outlined" style={{ fontSize:16, color: bm.color, fontVariationSettings:"'FILL' 1" }}>{b}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <span className="material-symbols-outlined" style={{ fontSize:20, color: C.outlineVar }}>chevron_right</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </div>{/* /search-results */}
      </div>{/* /main padding */}
    </AppLayout>
  );
}

function Stat({ icon, label, value, text }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
      <span className="material-symbols-outlined" style={{ fontSize:14, color:'#785a00', opacity:0.7 }}>{icon}</span>
      <span style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:10, color:'#44474f' }}>
        {text ? value : <><strong style={{ color:'#011e4b' }}>{value}</strong> {label}</>}
        {text && <> · <strong style={{ color:'#011e4b' }}>{value}</strong></>}
      </span>
    </div>
  );
}
