import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = 'http://localhost:8080';

const rolLabel = (idRol) => {
  const map = { 1: 'Admin', 2: 'Coordonator', 5: 'User' };
  return map[Number(idRol)] || `Rol ${idRol}`;
};

const rolColor = (idRol) => {
  const map = { 1: '#DC2626', 2: '#2563EB', 5: '#16A34A' };
  return map[Number(idRol)] || '#6B7280';
};

const statutColor = (statut) => {
  const map = { 'CONFIRMAT': '#16A34A', 'PENDING': '#D97706', 'ANULAT': '#DC2626', 'WAITLIST': '#7C3AED' };
  return map[statut] || '#6B7280';
};

const plataBadge = (status) => status === 'PLATIT'
  ? { bg: '#DCFCE7', color: '#15803D', text: '✅ Plătit' }
  : { bg: '#FEF3C7', color: '#92400E', text: '⏳ Neplătit' };

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [user, setUser] = useState(null);
  const [participanti, setParticipanti] = useState([]);
  const [inscrieri, setInscrieri] = useState([]);
  const [tabereCoord, setTabereCoord] = useState([]);
  const [activitatiCoord, setActivitatiCoord] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('inscrieri');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        // Întâi luăm userul ca să știm rolul
        const userRes = await axios.get(`${API}/utilizatori/${id}`, { headers });
        const u = userRes.data;
        setUser(u);

        const rol = Number(u.idRol);

        if (rol === 5) {
          // User normal — participanți și înscrieri
          const [participantiRes, inscrieriRes] = await Promise.all([
            axios.get(`${API}/participanti/familie/${id}`, { headers }),
            axios.get(`${API}/inscrieri/istoric/${id}`, { headers }),
          ]);
          setParticipanti(participantiRes.data);
          setInscrieri(inscrieriRes.data);
          setActiveTab('inscrieri');

        } else if (rol === 2) {
          // Coordonator — tabere și activități
          const [tabereRes, activitatiRes] = await Promise.all([
            axios.get(`${API}/tabere/coordonator/${id}`, { headers }),
            axios.get(`${API}/activitati/coordonator/${id}`, { headers }),
          ]);
          setTabereCoord(tabereRes.data);
          setActivitatiCoord(activitatiRes.data);
          setActiveTab('tabere');

        } else if (rol === 1) {
          // Admin — nimic suplimentar de afișat
          setActiveTab('info');
        }

      } catch (e) {
        console.error('Eroare la încărcarea datelor userului', e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id]);

  if (loading) return (
    <div style={s.centered}>
      <div style={s.spinner} />
      <p style={{ color: '#6B7280', marginTop: 12 }}>Se încarcă datele...</p>
    </div>
  );

  if (!user) return (
    <div style={s.centered}>
      <p style={{ color: '#DC2626' }}>Utilizatorul nu a fost găsit.</p>
      <button onClick={() => navigate('/admin/utilizatori')} style={s.btnBack}>← Înapoi</button>
    </div>
  );

  const rol = Number(user.idRol);

  return (
    <div style={s.page}>

      {/* Buton înapoi */}
      <button onClick={() => navigate('/admin/utilizatori')} style={s.btnBack}>
        ← Înapoi la utilizatori
      </button>

      {/* Card user */}
      <div style={s.userCard}>
        <div style={s.avatar}>
          {user.email?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={s.userInfo}>
          <div style={s.userEmail}>{user.email}</div>
          <div style={s.userMeta}>
            <span style={{ ...s.rolBadge, backgroundColor: rolColor(user.idRol) }}>
              {rolLabel(user.idRol)}
            </span>
            <span style={s.idText}>ID #{user.id}</span>
          </div>
        </div>

        {/* Statistici diferite per rol */}
        <div style={s.userStats}>
          {rol === 5 && (<>
            <div style={s.statBox}>
              <span style={s.statNum}>{participanti.length}</span>
              <span style={s.statLabel}>Participanți</span>
            </div>
            <div style={s.statBox}>
              <span style={s.statNum}>{inscrieri.length}</span>
              <span style={s.statLabel}>Înscrieri</span>
            </div>
            <div style={s.statBox}>
              <span style={s.statNum}>{inscrieri.filter(i => i.statusPlata === 'PLATIT').length}</span>
              <span style={s.statLabel}>Plătite</span>
            </div>
          </>)}
          {rol === 2 && (<>
            <div style={s.statBox}>
              <span style={s.statNum}>{tabereCoord.length}</span>
              <span style={s.statLabel}>Tabere</span>
            </div>
            <div style={s.statBox}>
              <span style={s.statNum}>{activitatiCoord.length}</span>
              <span style={s.statLabel}>Activități</span>
            </div>
          </>)}
          {rol === 1 && (
            <div style={s.statBox}>

              <span style={s.statLabel}>Administrator</span>
            </div>
          )}
        </div>
      </div>

      {/* ── TABS ROL 5 (User normal) ── */}
      {rol === 5 && (<>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(activeTab === 'inscrieri' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('inscrieri')}>
            📋 Înscrieri ({inscrieri.length})
          </button>
          <button style={{ ...s.tab, ...(activeTab === 'participanti' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('participanti')}>
            👨‍👩‍👧 Participanți ({participanti.length})
          </button>
        </div>

        {activeTab === 'inscrieri' && (
          <div style={s.card}>
            {inscrieri.length === 0 ? (
              <div style={s.empty}><p>📭</p><p style={{ color: '#6B7280' }}>Nicio înscriere.</p></div>
            ) : (
              <table style={s.table}>
                <thead><tr>
                  {['#', 'Tabără', 'Participant', 'Data', 'Sumă', 'Plată', 'Status'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {inscrieri.map((ins, idx) => {
                    const plata = plataBadge(ins.statusPlata);
                    return (
                      <tr key={ins.idInscriere || idx}
                        style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                        <td style={s.td}><span style={s.idBadge}>#{ins.idInscriere}</span></td>
                        <td style={s.td}><strong>{ins.numeTabara || '—'}</strong></td>
                        <td style={s.td}>{ins.numeParticipant} {ins.prenumeParticipant}</td>
                        <td style={s.td}><span style={{ fontSize: 12, color: '#6B7280' }}>{ins.dataInscriere}</span></td>
                        <td style={s.td}><strong style={{ color: '#16A34A' }}>{ins.suma} RON</strong></td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, backgroundColor: plata.bg, color: plata.color }}>{plata.text}</span>
                        </td>
                        <td style={s.td}>
                          <span style={{ ...s.badge, backgroundColor: statutColor(ins.statut) + '20', color: statutColor(ins.statut) }}>
                            {ins.statut}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'participanti' && (
          <div style={s.card}>
            {participanti.length === 0 ? (
              <div style={s.empty}><p>👤</p><p style={{ color: '#6B7280' }}>Niciun participant.</p></div>
            ) : (
              <table style={s.table}>
                <thead><tr>
                  {['#', 'Nume', 'Prenume', 'Data nașterii', 'Gen', 'Telefon', 'Contact urgență', 'Alergii'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {participanti.map((p, idx) => (
                    <tr key={p.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                      <td style={s.td}><span style={s.idBadge}>#{p.id}</span></td>
                      <td style={s.td}><strong>{p.nume}</strong></td>
                      <td style={s.td}>{p.prenume}</td>
                      <td style={s.td}><span style={{ fontSize: 12, color: '#6B7280' }}>{p.dataNasterii}</span></td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, backgroundColor: p.gen === 'M' ? '#EFF6FF' : '#FDF2F8', color: p.gen === 'M' ? '#2563EB' : '#DB2777' }}>
                          {p.gen === 'M' ? '👦 M' : '👧 F'}
                        </span>
                      </td>
                      <td style={s.td}>{p.telefon || '—'}</td>
                      <td style={s.td}><span style={{ fontSize: 12 }}>{p.contactUrgenta || '—'}</span></td>
                      <td style={s.td}>
                        {p.alergii && p.alergii !== 'Fara' && p.alergii !== 'Fără' ? (
                          <span style={{ ...s.badge, backgroundColor: '#FEF3C7', color: '#92400E' }}>⚠️ {p.alergii}</span>
                        ) : (
                          <span style={{ color: '#D1D5DB', fontSize: 12 }}>Fără</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </>)}

      {/* ── TABS ROL 2 (Coordonator) ── */}
      {rol === 2 && (<>
        <div style={s.tabs}>
          <button style={{ ...s.tab, ...(activeTab === 'tabere' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('tabere')}>
            🏕️ Tabere ({tabereCoord.length})
          </button>
          <button style={{ ...s.tab, ...(activeTab === 'activitati' ? s.tabActive : {}) }}
            onClick={() => setActiveTab('activitati')}>
            🎯 Activități ({activitatiCoord.length})
          </button>
        </div>

        {activeTab === 'tabere' && (
          <div style={s.card}>
            {tabereCoord.length === 0 ? (
              <div style={s.empty}><p>🏕️</p><p style={{ color: '#6B7280' }}>Nicio tabără asignată.</p></div>
            ) : (
              <table style={s.table}>
                <thead><tr>
                  {['#', 'Nume', 'Locație', 'Perioadă', 'Capacitate', 'Preț', 'Tip'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {tabereCoord.map((t, idx) => (
                    <tr key={t.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                      <td style={s.td}><span style={s.idBadge}>#{t.id}</span></td>
                      <td style={s.td}><strong>{t.nume}</strong></td>
                      <td style={s.td}><span style={{ color: '#6B7280' }}>📍 {t.locatie}</span></td>
                      <td style={s.td}><span style={{ fontSize: 12, color: '#6B7280' }}>{t.dataInceput} → {t.dataSfarsit}</span></td>
                      <td style={s.td}><span style={{ fontWeight: 600, color: '#2563EB' }}>{String(t.capacitate)}</span></td>
                      <td style={s.td}><strong style={{ color: '#16A34A' }}>{String(t.pret)} RON</strong></td>
                      <td style={s.td}>
                        <span style={{ ...s.badge, backgroundColor: '#F0FDF4', color: '#16A34A' }}>{t.tipPublic}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'activitati' && (
          <div style={s.card}>
            {activitatiCoord.length === 0 ? (
              <div style={s.empty}><p>🎯</p><p style={{ color: '#6B7280' }}>Nicio activitate asignată.</p></div>
            ) : (
              <table style={s.table}>
                <thead><tr>
                  {['#', 'Nume', 'Tabără', 'Data', 'Orar', 'Locație', 'Capacitate'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {activitatiCoord.map((a, idx) => (
                    <tr key={a.id} style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                      <td style={s.td}><span style={s.idBadge}>#{a.id}</span></td>
                      <td style={s.td}><strong>{a.nume}</strong></td>
                      <td style={s.td}><span style={{ color: '#6B7280' }}>🏕️ {a.tabara?.nume || '—'}</span></td>
                      <td style={s.td}><span style={{ fontSize: 12, color: '#6B7280' }}>{a.data}</span></td>
                      <td style={s.td}>
                        <span style={{ fontSize: 12, color: '#374151' }}>
                          {a.oraInceput} – {a.oraSfarsit}
                        </span>
                      </td>
                      <td style={s.td}>{a.locatie || '—'}</td>
                      <td style={s.td}><span style={{ fontWeight: 600, color: '#2563EB' }}>{a.capacitateMax}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </>)}

      {/* ── ROL 1 (Admin) ── */}
      {rol === 1 && (
        <div style={{ ...s.card, padding: 40, textAlign: 'center' }}>

          <p style={{ color: '#374151', fontWeight: 600, fontSize: 16, marginTop: 12 }}>
            Cont de administrator
          </p>
          <p style={{ color: '#6B7280', fontSize: 14 }}>
            Administratorii au acces complet la toate funcționalitățile sistemului.
          </p>
        </div>
      )}
    </div>
  );
};

const s = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '32px 24px', fontFamily: "'Inter','Segoe UI',sans-serif" },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  spinner: { width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #2563EB', borderRadius: '50%' },
  btnBack: { background: 'none', border: 'none', color: '#2563EB', fontSize: 14, fontWeight: 500, cursor: 'pointer', padding: '0 0 20px 0', display: 'block' },
  userCard: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  avatar: { width: 60, height: 60, borderRadius: '50%', backgroundColor: '#2563EB', color: '#fff', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  userInfo: { flex: 1, minWidth: 200 },
  userEmail: { fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 },
  userMeta: { display: 'flex', alignItems: 'center', gap: 10 },
  rolBadge: { color: '#fff', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 },
  idText: { fontSize: 13, color: '#9CA3AF' },
  userStats: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  statBox: { textAlign: 'center', padding: '12px 20px', backgroundColor: '#F9FAFB', borderRadius: 10, border: '1px solid #E5E7EB', minWidth: 80 },
  statNum: { display: 'block', fontSize: 22, fontWeight: 700, color: '#111827' },
  statLabel: { display: 'block', fontSize: 11, color: '#6B7280', marginTop: 2 },
  tabs: { display: 'flex', gap: 4, marginBottom: 16, borderBottom: '2px solid #E5E7EB' },
  tab: { padding: '10px 20px', border: 'none', background: 'none', fontSize: 14, fontWeight: 500, color: '#6B7280', cursor: 'pointer', borderBottom: '2px solid transparent', marginBottom: -2 },
  tabActive: { color: '#2563EB', borderBottomColor: '#2563EB' },
  card: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  empty: { textAlign: 'center', padding: '48px 20px', fontSize: 14 },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' },
  td: { padding: '11px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' },
  idBadge: { fontFamily: 'monospace', fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', padding: '2px 7px', borderRadius: 4 },
  badge: { fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, display: 'inline-block' },
};

export default UserDetails;