import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const navigate = useNavigate();
    const email = localStorage.getItem('userEmail');
    const userRole = parseInt(localStorage.getItem('userRole'));
    const esteAdmin = userRole === 1;
    const esteCoordonator = userRole === 2;
    const estePrincipal = localStorage.getItem('esteCoordonatorPrincipal') === 'true';

    const rolLabel = esteAdmin ? 'Administrator' : estePrincipal ? 'Coordonator Principal' : 'Coordonator';
    const rolColor = esteAdmin ? '#DC2626' : estePrincipal ? '#2563EB' : '#7C3AED';

    // Carduri pentru ADMIN
    const carduriAdmin = [
        { icon: '🏕️', titlu: 'Gestiune Tabere', desc: 'Adaugă, editează și șterge tabere din sistem.', ruta: '/admin/tabere', culoare: '#2563EB' },
        { icon: '👥', titlu: 'Gestiune Utilizatori', desc: 'Vizualizează toți utilizatorii, rolurile și înscrierile lor.', ruta: '/admin/utilizatori', culoare: '#7C3AED' },
        { icon: '👨‍👩‍👧', titlu: 'Participanți (CRM)', desc: 'Registrul global al tuturor participanților din sistem.', ruta: '/participanti', culoare: '#0891B2' },
        { icon: '📋', titlu: 'Management Înscrieri', desc: 'Vizualizează și gestionează toate înscrierile.', ruta: '/management-inscrieri', culoare: '#D97706' },
        { icon: '📊', titlu: 'Rapoarte', desc: 'Rapoarte financiare, medicale și operaționale.', ruta: '/raport-manager', culoare: '#16A34A' },
        { icon: '📢', titlu: 'Broadcast Email', desc: 'Trimite emailuri către toți participanții plătiți.', ruta: '/broadcast', culoare: '#DB2777' },
    ];

    // Carduri pentru COORDONATOR PRINCIPAL
    const carduriPrincipal = [
        { icon: '📝', titlu: 'Catalog Prezență', desc: 'Bifează prezența participanților la activitățile tale.', ruta: '/prezenta', culoare: '#7C3AED' },
        { icon: '📋', titlu: 'Management Înscrieri', desc: 'Confirmă sau respinge înscrierile taberei tale.', ruta: '/management-inscrieri', culoare: '#D97706' },
        { icon: '🛏️', titlu: 'Cazare Camere', desc: 'Gestionează alocarea participanților pe camere.', ruta: '/cazare', culoare: '#0891B2' },
        { icon: '🏥', titlu: 'Panou Medical', desc: 'Vizualizează fișele medicale și alergiile.', ruta: '/panou-medical', culoare: '#DC2626' },
        { icon: '📊', titlu: 'Rapoarte', desc: 'Rapoarte pentru tabăra ta activă.', ruta: '/raport-manager', culoare: '#16A34A' },
        { icon: '📢', titlu: 'Broadcast Email', desc: 'Trimite emailuri participanților taberei tale.', ruta: '/broadcast', culoare: '#DB2777' },
    ];

    // Carduri pentru COORDONATOR simplu
    const carduriCoordonator = [
        { icon: '📝', titlu: 'Catalog Prezență', desc: 'Bifează prezența participanților la activitățile tale.', ruta: '/prezenta', culoare: '#7C3AED' },
        { icon: '🏥', titlu: 'Panou Medical', desc: 'Vizualizează fișele medicale și alergiile participanților.', ruta: '/panou-medical', culoare: '#DC2626' },
        { icon: '✅', titlu: 'Check-in / Check-out', desc: 'Gestionează sosirile și plecările participanților.', ruta: '/check-in-out', culoare: '#16A34A' },
    ];

    const carduri = esteAdmin ? carduriAdmin : estePrincipal ? carduriPrincipal : carduriCoordonator;

    return (
        <div style={s.page}>

            {/* Header */}
            <div style={s.header}>
                <div style={s.avatarWrap}>
                    <div style={{ ...s.avatar, backgroundColor: rolColor }}>
                        {email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                        <p style={s.welcomeText}>Bine ai venit,</p>
                        <p style={s.emailText}>{email}</p>
                        <span style={{ ...s.rolBadge, backgroundColor: rolColor }}>
                            {esteAdmin ? '👑' : estePrincipal ? '⭐' : '🎯'} {rolLabel}
                        </span>
                    </div>
                </div>
                <div style={s.headerRight}>
                    <p style={s.headerLabel}>Panou de control</p>
                    <p style={s.headerSub}>
                        {esteAdmin
                            ? 'Acces complet la toate funcționalitățile sistemului.'
                            : estePrincipal
                            ? 'Gestionezi tabăra ta și echipa de coordonatori.'
                            : 'Gestionezi activitățile și participanții taberei.'}
                    </p>
                </div>
            </div>

            {/* Grid carduri */}
            <div style={s.grid}>
                {carduri.map((card) => (
                    <div
                        key={card.ruta}
                        style={s.card}
                        onClick={() => navigate(card.ruta)}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-3px)';
                            e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
                            e.currentTarget.style.borderColor = card.culoare;
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)';
                            e.currentTarget.style.borderColor = '#E5E7EB';
                        }}
                    >
                        <div style={{ ...s.cardIcon, backgroundColor: card.culoare + '15', color: card.culoare }}>
                            {card.icon}
                        </div>
                        <div style={s.cardBody}>
                            <p style={s.cardTitlu}>{card.titlu}</p>
                            <p style={s.cardDesc}>{card.desc}</p>
                        </div>
                        <div style={{ ...s.cardArrow, color: card.culoare }}>→</div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const s = {
    page: {
        maxWidth: 960, margin: '0 auto', padding: '40px 24px',
        fontFamily: "'Inter','Segoe UI',sans-serif"
    },
    header: {
        backgroundColor: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
        padding: '28px 32px', marginBottom: 32,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    },
    avatarWrap: { display: 'flex', alignItems: 'center', gap: 16 },
    avatar: {
        width: 60, height: 60, borderRadius: '50%',
        color: '#fff', fontSize: 24, fontWeight: 700,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
    },
    welcomeText: { margin: 0, fontSize: 13, color: '#9CA3AF' },
    emailText: { margin: '2px 0 8px', fontSize: 18, fontWeight: 700, color: '#111827' },
    rolBadge: {
        color: '#fff', fontSize: 12, fontWeight: 600,
        padding: '4px 12px', borderRadius: 20, display: 'inline-block'
    },
    headerRight: { textAlign: 'right' },
    headerLabel: { margin: '0 0 4px', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF' },
    headerSub: { margin: 0, fontSize: 14, color: '#6B7280', maxWidth: 280, textAlign: 'right' },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 16
    },
    card: {
        backgroundColor: '#fff', borderRadius: 12,
        border: '1px solid #E5E7EB', padding: '20px',
        display: 'flex', alignItems: 'center', gap: 16,
        cursor: 'pointer', transition: 'all 0.18s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
    },
    cardIcon: {
        width: 48, height: 48, borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, flexShrink: 0
    },
    cardBody: { flex: 1 },
    cardTitlu: { margin: '0 0 4px', fontSize: 15, fontWeight: 600, color: '#111827' },
    cardDesc: { margin: 0, fontSize: 13, color: '#6B7280', lineHeight: 1.4 },
    cardArrow: { fontSize: 18, fontWeight: 600, flexShrink: 0 },
};

export default AdminDashboard;