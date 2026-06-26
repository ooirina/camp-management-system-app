import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CategorieManagement = () => {
  const [categorii, setCategorii] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tipNou, setTipNou] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCategorii();
  }, []);

  const fetchCategorii = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/categorii/lista');
      setCategorii(res.data);
    } catch (e) {
      showFeedback('error', 'Eroare la încărcarea tipurilor de tabără.');
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleAdd = async () => {
    const tipCuratat = tipNou.trim().toUpperCase();
    if (!tipCuratat) {
      showFeedback('error', 'Introdu un nume pentru noul tip de tabără.');
      return;
    }
    // Verificare locală dacă tipul există deja, ca să nu se creeze dubluri
    const existaDeja = categorii.some(
      c => c.tip.toLowerCase() === tipCuratat.toLowerCase()
    );
    if (existaDeja) {
      showFeedback('error', `Tipul "${tipCuratat}" există deja în listă.`);
      return;
    }
    setSaving(true);
    try {
      await axios.post('http://localhost:8080/categorii/creare', { tip: tipCuratat });
      showFeedback('success', `Tipul "${tipCuratat}" a fost adăugat cu succes!`);
      setTipNou('');
      fetchCategorii();
    } catch (e) {
      const msg = e.response?.data || 'Eroare la salvare. Încearcă din nou.';
      showFeedback('error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, tip) => {
    if (!window.confirm(`Sigur vrei să ștergi tipul de tabără "${tip}"?`)) return;
    try {
      await axios.delete(`http://localhost:8080/categorii/stergere/${id}`);
      showFeedback('success', 'Tipul de tabără a fost șters.');
      fetchCategorii();
    } catch (e) {
      const msg = e.response?.data || 'Nu se poate șterge acest tip de tabără.';
      showFeedback('error', msg);
    }
  };

  const filtered = categorii.filter(c =>
    c.tip?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={s.centered}>
      <div style={s.spinner} />
      <p style={{ color: '#6B7280', marginTop: 12 }}>Se încarcă tipurile de tabără...</p>
    </div>
  );

  return (
    <div style={s.page}>

      {/* Feedback toast */}
      {feedback && (
        <div style={{
          ...s.toast,
          backgroundColor: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
          borderColor: feedback.type === 'success' ? '#16A34A' : '#DC2626',
          color: feedback.type === 'success' ? '#15803D' : '#DC2626'
        }}>
          {feedback.type === 'success' ? '✅' : '❌'} {feedback.msg}
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div>
          <p style={s.eyebrow}>Panou Administrare</p>
          <h1 style={s.title}>Gestiune Tipuri de Tabără</h1>
          <p style={s.subtitle}>{categorii.length} tipuri existente în sistem</p>
        </div>
      </div>

      {/* Formular adăugare tip nou */}
      <div style={s.addCard}>
        <label style={s.label}>Adaugă un tip de tabără nou</label>
        <div style={s.addRow}>
          <input
            style={s.input}
            type="text"
            value={tipNou}
            onChange={(e) => setTipNou(e.target.value)}
            placeholder="ex: Aventură montană"
          />
          <button style={s.btnPrimary} onClick={handleAdd} disabled={saving}>
            {saving ? 'Se salvează...' : '+ Adaugă tip'}
          </button>
        </div>
        <p style={s.hint}>
          Tipurile existente sunt verificate automat — nu se pot adăuga dubluri.
        </p>
      </div>

      {/* Search */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input
          style={s.searchInput}
          type="text"
          placeholder="Caută după tip de tabără..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && <button style={s.clearBtn} onClick={() => setSearch('')}>✕</button>}
      </div>

      {/* Listă tipuri existente */}
      <div style={s.card}>
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <p style={{ color: '#6B7280' }}>
              {search ? 'Niciun tip de tabără găsit.' : 'Nu există încă niciun tip de tabără definit.'}
            </p>
          </div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>ID</th>
                <th style={s.th}>Tip tabără</th>
                <th style={{ ...s.th, textAlign: 'right' }}>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={s.td}><span style={s.idBadge}>#{c.id}</span></td>
                  <td style={s.td}>{c.tip}</td>
                  <td style={{ ...s.td, textAlign: 'right' }}>
                    <button style={s.btnDelete} onClick={() => handleDelete(c.id, c.tip)}>
                      Șterge
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
};

const s = {
  page: { maxWidth: 800, margin: '0 auto', padding: '40px 24px', fontFamily: "'Inter','Segoe UI',sans-serif" },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  spinner: { width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #2563EB', borderRadius: '50%' },
  toast: { position: 'fixed', top: 20, right: 24, padding: '12px 20px', borderRadius: 8, border: '1px solid', fontSize: 14, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: 400 },
  header: { marginBottom: 28 },
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563EB', margin: '0 0 6px 0' },
  title: { fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' },
  subtitle: { fontSize: 14, color: '#6B7280', margin: 0 },
  addCard: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  addRow: { display: 'flex', gap: 10, marginTop: 6 },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  input: { flex: 1, padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 7, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827' },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  btnPrimary: { backgroundColor: '#2563EB', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' },
  searchWrap: { position: 'relative', marginBottom: 20, display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 12, fontSize: 14, pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '10px 40px 10px 36px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827' },
  clearBtn: { position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  empty: { textAlign: 'center', padding: '40px 20px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' },
  td: { padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' },
  idBadge: { fontFamily: 'monospace', fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', padding: '2px 7px', borderRadius: 4 },
  btnDelete: { backgroundColor: '#FEF2F2', color: '#DC2626', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: '1px solid #FECACA', cursor: 'pointer' },
};

export default CategorieManagement;