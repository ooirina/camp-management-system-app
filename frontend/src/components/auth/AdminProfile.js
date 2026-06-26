import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const AdminProfile = () => {
    const navigate = useNavigate();
    const email = localStorage.getItem('userEmail');
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    const [stats, setStats] = useState({ nrTabere: 0, nrUseri: 0, nrParticipanti: 0, nrInscrieri: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [t, u, p, i] = await Promise.all([
                    axios.get('http://localhost:8080/tabere/lista', { headers }),
                    axios.get('http://localhost:8080/utilizatori/lista', { headers }),
                    axios.get('http://localhost:8080/participanti/lista', { headers }),
                    axios.get('http://localhost:8080/inscrieri/lista', { headers }),
                ]);
                setStats({ nrTabere: t.data.length, nrUseri: u.data.length, nrParticipanti: p.data.length, nrInscrieri: i.data.length });
            } catch (e) { console.error(e); } finally { setLoading(false); }
        };
        fetchStats();
    }, []);

    const actiuni = [
        { icon: '🏕️', label: 'Gestiune Tabere', sub: 'Adaugă, editează, șterge', ruta: '/admin/tabere', culoare: '#2563EB' },
        { icon: '👥', label: 'Utilizatori', sub: 'Conturi și roluri', ruta: '/admin/utilizatori', culoare: '#7C3AED' },
        { icon: '👨‍👩‍👧', label: 'Participanți', sub: 'Registru global CRM', ruta: '/participanti', culoare: '#0891B2' },
        { icon: '📋', label: 'Înscrieri', sub: 'Management complet', ruta: '/management-inscrieri', culoare: '#D97706' },
        { icon: '📊', label: 'Rapoarte', sub: 'Financiar, medical, operațional', ruta: '/raport-manager', culoare: '#16A34A' },
        { icon: '📢', label: 'Broadcast Email', sub: 'Comunicare participanți', ruta: '/broadcast', culoare: '#DB2777' },
    ];

    return (
        <div style={s.page}>
            <div style={s.headerCard}>
                <div style={s.avatarWrap}>
                    <div style={s.avatar}>{email?.[0]?.toUpperCase() || 'A'}</div>
                    <div>
                        <p style={s.eyebrow}>Administrator sistem</p>
                        <p style={s.emailText}>{email}</p>
                        <span style={s.rolBadge}>Admin</span>
                    </div>
                </div>
                <button style={s.btnLogout} onClick={() => { localStorage.clear(); navigate('/login'); }}>
                    Deconectare
                </button>
            </div>

            <div style={s.statsGrid}>
                {[
                    { label: 'Tabere', val: stats.nrTabere, icon: '🏕️', color: '#2563EB' },
                    { label: 'Utilizatori', val: stats.nrUseri, icon: '👥', color: '#7C3AED' },
                    { label: 'Participanți', val: stats.nrParticipanti, icon: '👦', color: '#0891B2' },
                    { label: 'Înscrieri', val: stats.nrInscrieri, icon: '📋', color: '#D97706' },
                ].map(stat => (
                    <div key={stat.label} style={s.statCard}>
                        <div style={{ ...s.statIcon, color: stat.color }}>{stat.icon}</div>
                        <div>
                            <p style={s.statVal}>{loading ? '...' : stat.val}</p>
                            <p style={s.statLabel}>{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <p style={s.sectionTitle}>Acțiuni rapide</p>
            <div style={s.actiuniGrid}>
                {actiuni.map(a => (
                    <div key={a.ruta} style={s.actiuneCard} onClick={() => navigate(a.ruta)}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = a.culoare; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <div style={{ ...s.actiuneIcon, backgroundColor: a.culoare + '15', color: a.culoare }}>{a.icon}</div>
                        <div>
                            <p style={s.actiuneLabel}>{a.label}</p>
                            <p style={s.actiuneSub}>{a.sub}</p>
                        </div>
                        <span style={{ color: a.culoare, marginLeft: 'auto', fontSize: 18 }}>→</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const s = {
    page: { maxWidth: 960, margin: '0 auto', padding: '40px 24px', fontFamily: "'Inter','Segoe UI',sans-serif" },
    headerCard: { backgroundColor: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: '24px 28px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    avatarWrap: { display: 'flex', alignItems: 'center', gap: 16 },
    avatar: { width: 60, height: 60, borderRadius: '50%', backgroundColor: '#DC2626', color: '#fff', fontSize: 24, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    eyebrow: { margin: '0 0 4px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' },
    emailText: { margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' },
    rolBadge: { backgroundColor: '#DC2626', color: '#fff', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 20 },
    btnLogout: { padding: '8px 18px', borderRadius: 8, border: '1px solid #E5E7EB', backgroundColor: '#fff', color: '#6B7280', fontSize: 14, cursor: 'pointer', fontWeight: 500 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 },
    statCard: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    statIcon: { fontSize: 26 },
    statVal: { margin: '0 0 2px', fontSize: 24, fontWeight: 700, color: '#111827' },
    statLabel: { margin: 0, fontSize: 12, color: '#6B7280' },
    sectionTitle: { margin: '0 0 12px', fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' },
    actiuniGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 },
    actiuneCard: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'all 0.16s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    actiuneIcon: { width: 44, height: 44, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 },
    actiuneLabel: { margin: '0 0 3px', fontSize: 14, fontWeight: 600, color: '#111827' },
    actiuneSub: { margin: 0, fontSize: 12, color: '#9CA3AF' },
};

export default AdminProfile;