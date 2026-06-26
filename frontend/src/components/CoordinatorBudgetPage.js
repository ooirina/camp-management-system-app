import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CoordinatorBudgetPage = () => {
    const tabaraActivaId = localStorage.getItem('tabaraActivaId');
    const tabaraActivaNume = localStorage.getItem('tabaraActivaNume');

    const [buget, setBuget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        if (!tabaraActivaId) {
            setLoading(false);
            return;
        }
        fetchBuget();
    }, [tabaraActivaId]);

    const fetchBuget = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `http://localhost:8080/buget/tabara/${tabaraActivaId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBuget(res.data);
            setError(null);
        } catch (e) {
            console.error('Eroare la încărcarea bugetului', e);
            setError('Nu am putut încărca bugetul pentru această tabără.');
        } finally {
            setLoading(false);
        }
    };

    if (!tabaraActivaId) {
        return (
            <div style={styles.page}>
                <div style={styles.emptyBox}>
                    <p style={{ fontSize: 36, margin: 0 }}>🏕️</p>
                    <p style={{ color: '#6B7280', marginTop: 12 }}>
                        Nu ai selectată o tabără activă. Alege o tabără din profilul tău de coordonator
                        pentru a vedea bugetul acesteia.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div style={styles.centered}>
                <div style={styles.spinner} />
                <p style={{ color: '#6B7280', marginTop: 12 }}>Se încarcă bugetul...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.centered}>
                <p style={{ color: '#DC2626' }}>{error}</p>
            </div>
        );
    }

    const soldPozitiv = parseFloat(buget.soldNet) >= 0;

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <div>
                    <p style={styles.eyebrow}>Modul Financiar</p>
                    <h1 style={styles.title}>Buget Tabără</h1>
                    <p style={styles.subtitle}>{tabaraActivaNume || `Tabăra #${tabaraActivaId}`}</p>
                </div>
                <span style={styles.countBadge}>{buget.nrTranzactii} tranzacții</span>
            </div>

            <div style={styles.grid3}>
                <div style={{ ...styles.sumCard, borderColor: '#16A34A' }}>
                    <p style={styles.sumLabel}>Total încasat</p>
                    <p style={{ ...styles.sumValue, color: '#16A34A' }}>
                        {parseFloat(buget.totalIncasat).toFixed(2)} RON
                    </p>
                </div>
                <div style={{ ...styles.sumCard, borderColor: '#DC2626' }}>
                    <p style={styles.sumLabel}>Total rambursat</p>
                    <p style={{ ...styles.sumValue, color: '#DC2626' }}>
                        -{parseFloat(buget.totalRambursat).toFixed(2)} RON
                    </p>
                </div>
                <div style={{
                    ...styles.sumCard,
                    borderColor: soldPozitiv ? '#2563EB' : '#D97706',
                    backgroundColor: soldPozitiv ? '#EFF6FF' : '#FFFBEB'
                }}>
                    <p style={styles.sumLabel}>Sold net</p>
                    <p style={{ ...styles.sumValue, color: soldPozitiv ? '#2563EB' : '#D97706' }}>
                        {parseFloat(buget.soldNet).toFixed(2)} RON
                    </p>
                </div>
            </div>

            <div style={styles.card}>
                {buget.nrTranzactii === 0 ? (
                    <div style={styles.emptyBox}>
                        <p style={{ fontSize: 32, margin: 0 }}>📭</p>
                        <p style={{ color: '#6B7280', marginTop: 8 }}>
                            Nicio tranzacție înregistrată încă pentru această tabără.
                        </p>
                    </div>
                ) : (
                    <>
                        <button style={styles.toggleBtn} onClick={() => setExpanded(!expanded)}>
                            {expanded ? '▲ Ascunde istoricul tranzacțiilor' : '▼ Vezi istoricul tranzacțiilor'}
                        </button>

                        {expanded && (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            {['Data', 'Tip', 'Sumă', 'Descriere'].map(h => (
                                                <th key={h} style={styles.th}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {buget.istoric.map((t, idx) => (
                                            <tr key={t.id || idx}
                                                style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                                                <td style={styles.td}>
                                                    <span style={{ fontSize: 12, color: '#6B7280' }}>
                                                        {t.dataTranzactie?.substring(0, 16).replace('T', ' ')}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <span style={{
                                                        ...styles.tipBadge,
                                                        backgroundColor: t.tip === 'INCASARE' ? '#DCFCE7' : '#FEE2E2',
                                                        color: t.tip === 'INCASARE' ? '#15803D' : '#DC2626'
                                                    }}>
                                                        {t.tip === 'INCASARE' ? '↑ Încasare' : '↓ Rambursare'}
                                                    </span>
                                                </td>
                                                <td style={styles.td}>
                                                    <strong style={{ color: t.tip === 'INCASARE' ? '#15803D' : '#DC2626' }}>
                                                        {t.tip === 'INCASARE' ? '+' : '-'}{parseFloat(t.suma).toFixed(2)} RON
                                                    </strong>
                                                </td>
                                                <td style={{ ...styles.td, fontSize: 12, color: '#6B7280', maxWidth: 320 }}>
                                                    {t.descriere}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { maxWidth: 900, margin: '0 auto', padding: '40px 24px', fontFamily: "'Inter','Segoe UI',sans-serif" },
    centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
    spinner: { width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #2563EB', borderRadius: '50%' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
    eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2563EB', margin: '0 0 6px 0' },
    title: { fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' },
    subtitle: { fontSize: 14, color: '#6B7280', margin: 0 },
    countBadge: { fontSize: 13, color: '#6B7280', backgroundColor: '#F3F4F6', padding: '6px 14px', borderRadius: 20, height: 'fit-content' },
    grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 },
    sumCard: { padding: '16px 18px', borderRadius: 12, border: '1px solid', backgroundColor: '#F9FAFB' },
    sumLabel: { margin: '0 0 6px', fontSize: 12, color: '#6B7280', fontWeight: 500 },
    sumValue: { margin: 0, fontSize: 20, fontWeight: 700 },
    card: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    emptyBox: { textAlign: 'center', padding: '40px 20px' },
    toggleBtn: { background: 'none', border: 'none', color: '#2563EB', fontSize: 13, fontWeight: 500, cursor: 'pointer', padding: '4px 0', marginBottom: 12 },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' },
    td: { padding: '10px 12px', fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' },
    tipBadge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, display: 'inline-block' },
};

export default CoordinatorBudgetPage;