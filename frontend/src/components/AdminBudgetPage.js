import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminBudgetPage = () => {
    const [buget, setBuget] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchBugetAgregat();
    }, []);

    const fetchBugetAgregat = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await axios.get(
                `http://localhost:8080/buget/agregat`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setBuget(res.data);
            setError(null);
        } catch (e) {
            console.error('Eroare la încărcarea bugetului agregat', e);
            setError('Nu am putut încărca bugetul agregat.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.centered}>
                <div style={styles.spinner} />
                <p style={{ color: '#6B7280', marginTop: 12 }}>Se încarcă bugetul agregat...</p>
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

    const soldPozitiv = parseFloat(buget.soldNetGlobal) >= 0;
    const perTaberaSortat = [...buget.perTabara].sort(
        (a, b) => parseFloat(b.soldNet) - parseFloat(a.soldNet)
    );

    return (
        <div style={styles.page}>

            <div style={styles.header}>
                <div>
                    <p style={styles.eyebrow}>Supervizare Financiară · Admin</p>
                    <h1 style={styles.title}>Buget Agregat — Toate Taberele</h1>
                    <p style={styles.subtitle}>{buget.perTabara.length} tabere incluse în calcul</p>
                </div>
            </div>

            <div style={styles.grid3}>
                <div style={{ ...styles.sumCard, borderColor: '#16A34A' }}>
                    <p style={styles.sumLabel}>Total încasat (toate taberele)</p>
                    <p style={{ ...styles.sumValue, color: '#16A34A' }}>
                        {parseFloat(buget.totalIncasatGlobal).toFixed(2)} RON
                    </p>
                </div>
                <div style={{ ...styles.sumCard, borderColor: '#DC2626' }}>
                    <p style={styles.sumLabel}>Total rambursat (toate taberele)</p>
                    <p style={{ ...styles.sumValue, color: '#DC2626' }}>
                        -{parseFloat(buget.totalRambursatGlobal).toFixed(2)} RON
                    </p>
                </div>
                <div style={{
                    ...styles.sumCard,
                    borderColor: soldPozitiv ? '#2563EB' : '#D97706',
                    backgroundColor: soldPozitiv ? '#EFF6FF' : '#FFFBEB'
                }}>
                    <p style={styles.sumLabel}>Sold net global</p>
                    <p style={{ ...styles.sumValue, color: soldPozitiv ? '#2563EB' : '#D97706' }}>
                        {parseFloat(buget.soldNetGlobal).toFixed(2)} RON
                    </p>
                </div>
            </div>

            <div style={styles.card}>
                <p style={styles.cardTitle}>Defalcare pe tabere</p>
                {perTaberaSortat.length === 0 ? (
                    <div style={styles.emptyBox}>
                        <p style={{ fontSize: 32, margin: 0 }}>📭</p>
                        <p style={{ color: '#6B7280', marginTop: 8 }}>Nu există încă tabere cu tranzacții.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    {['Tabără', 'Total încasat', 'Total rambursat', 'Sold net'].map(h => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {perTaberaSortat.map((t, idx) => {
                                    const soldTaberaPozitiv = parseFloat(t.soldNet) >= 0;
                                    return (
                                        <tr key={t.idTabara}
                                            style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}>
                                            <td style={{ ...styles.td, fontWeight: 600, color: '#111827' }}>
                                                {t.numeTabara}
                                            </td>
                                            <td style={{ ...styles.td, color: '#16A34A' }}>
                                                +{parseFloat(t.totalIncasat).toFixed(2)} RON
                                            </td>
                                            <td style={{ ...styles.td, color: '#DC2626' }}>
                                                -{parseFloat(t.totalRambursat).toFixed(2)} RON
                                            </td>
                                            <td style={{
                                                ...styles.td,
                                                fontWeight: 700,
                                                color: soldTaberaPozitiv ? '#2563EB' : '#D97706'
                                            }}>
                                                {parseFloat(t.soldNet).toFixed(2)} RON
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    page: { maxWidth: 1000, margin: '0 auto', padding: '40px 24px', fontFamily: "'Inter','Segoe UI',sans-serif" },
    centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
    spinner: { width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #2563EB', borderRadius: '50%' },
    header: { marginBottom: 28 },
    eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#D97706', margin: '0 0 6px 0' },
    title: { fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' },
    subtitle: { fontSize: 14, color: '#6B7280', margin: 0 },
    grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 24 },
    sumCard: { padding: '16px 18px', borderRadius: 12, border: '1px solid', backgroundColor: '#F9FAFB' },
    sumLabel: { margin: '0 0 6px', fontSize: 12, color: '#6B7280', fontWeight: 500 },
    sumValue: { margin: 0, fontSize: 20, fontWeight: 700 },
    card: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
    cardTitle: { fontSize: 14, fontWeight: 600, color: '#111827', margin: '0 0 14px 0' },
    emptyBox: { textAlign: 'center', padding: '40px 20px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' },
    td: { padding: '10px 12px', fontSize: 13, borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' },
};

export default AdminBudgetPage;