import React, { useState, useEffect } from 'react';
import { CampService, UserService } from '../services/api';

const emptyForm = {
  nume: '', locatie: '', dataInceput: '', dataSfarsit: '',
  capacitate: '', pret: '', varstaMin: '', varstaMax: '',
  tipPublic: 'mixt', latitudine: '', longitudine: '',
  idCoordonatorPrincipal: ''
};

const CampManagement = () => {
  const [tabere, setTabere] = useState([]);
  const [coordonatori, setCoordonatori] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit'
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    fetchTabere();
    fetchCoordonatori();
  }, []);

  const fetchTabere = async () => {
    try {
      setLoading(true);
      const res = await CampService.getAll();
      setTabere(res.data);
    } catch (e) {
      showFeedback('error', 'Eroare la încărcarea taberelor.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCoordonatori = async () => {
    try {
      // Endpoint-ul care returnează doar userii cu rol 2 (coordonator)
      const res = await UserService.getCoordonatori();
      setCoordonatori(res.data);
    } catch (e) {
      console.error('Eroare la încărcarea coordonatorilor', e);
    }
  };

  const showFeedback = (type, msg) => {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3500);
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setModal('add');
  };

  const openEdit = (tabara) => {
    setForm({
      nume: tabara.nume || '',
      locatie: tabara.locatie || '',
      dataInceput: tabara.dataInceput || '',
      dataSfarsit: tabara.dataSfarsit || '',
      capacitate: tabara.capacitate || '',
      pret: tabara.pret || '',
      varstaMin: tabara.varstaMin || '',
      varstaMax: tabara.varstaMax || '',
      tipPublic: tabara.tipPublic || 'mixt',
      latitudine: tabara.latitudine || '',
      longitudine: tabara.longitudine || '',
      idCoordonatorPrincipal: tabara.idCoordonatorPrincipal || '',
    });
    setEditId(tabara.id);
    setModal('edit');
  };

  const closeModal = () => { setModal(null); setForm(emptyForm); setEditId(null); };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async () => {
    if (!form.nume || !form.locatie || !form.dataInceput || !form.dataSfarsit || !form.capacitate || !form.pret) {
      showFeedback('error', 'Completează toate câmpurile obligatorii (*).');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        // Trimitem null dacă nu s-a selectat niciun coordonator
        idCoordonatorPrincipal: form.idCoordonatorPrincipal || null,
      };
      if (modal === 'add') {
        await CampService.create(payload);
        showFeedback('success', 'Tabăra a fost adăugată cu succes!');
      } else {
        await CampService.update(editId, payload);
        showFeedback('success', 'Tabăra a fost actualizată cu succes!');
      }
      closeModal();
      fetchTabere();
    } catch (e) {
      showFeedback('error', 'Eroare la salvare. Încearcă din nou.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, nume) => {
    if (!window.confirm(`Sigur vrei să ștergi tabăra "${nume}"?`)) return;
    try {
      await CampService.delete(id);
      showFeedback('success', 'Tabăra a fost ștearsă.');
      fetchTabere();
    } catch (e) {
      // Mesajul vine de la backend (ex: "Nu poți șterge tabăra! Are înscrieri.")
      const msg = e.response?.data || 'Nu se poate șterge tabăra.';
      showFeedback('error', msg);
    }
  };

  const filtered = tabere.filter(t =>
    t.nume?.toLowerCase().includes(search.toLowerCase()) ||
    t.locatie?.toLowerCase().includes(search.toLowerCase())
  );

  const tipColor = (tip) => {
    const map = { 'baieti': '#2563EB', 'fete': '#DB2777', 'mixt': '#16A34A' };
    return map[tip] || '#6B7280';
  };

  // Găsește emailul coordonatorului după ID — pentru afișare în tabel
  const emailCoordonator = (idCoord) => {
    if (!idCoord) return '—';
    const c = coordonatori.find(u => u.id === idCoord || u.id === Number(idCoord));
    return c ? c.email : `#${idCoord}`;
  };

  if (loading) return (
    <div style={s.centered}>
      <div style={s.spinner} />
      <p style={{ color: '#6B7280', marginTop: 12 }}>Se încarcă taberele...</p>
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
          <h1 style={s.title}>Gestiune Tabere</h1>
          <p style={s.subtitle}>{tabere.length} tabere în sistem</p>
        </div>
       <button
                           className="btn btn-outline-primary"
                           onClick={() => window.location.href='/admin/adauga-tabara'}
                       >
                        Adauga tabara
                       </button>
      </div>

      {/* Search */}
      <div style={s.searchWrap}>
        <span style={s.searchIcon}>🔍</span>
        <input style={s.searchInput} type="text"
          placeholder="Caută după nume sau locație..."
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button style={s.clearBtn} onClick={() => setSearch('')}>✕</button>}
      </div>

      {/* Tabel */}
      <div style={s.card}>
        {filtered.length === 0 ? (
          <div style={s.empty}>
            <p style={{ fontSize: 36, margin: 0 }}>🏕️</p>
            <p style={{ color: '#6B7280', marginTop: 8 }}>
              {search ? 'Nicio tabără găsită.' : 'Nu există tabere. Adaugă prima tabără!'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  {['ID', 'Nume', 'Locație', 'Perioadă', 'Locuri', 'Preț', 'Vârstă', 'Tip', 'Coordonator', 'Acțiuni'].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => (
                  <tr key={t.id}
                    style={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#F9FAFB' }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EFF6FF'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = idx % 2 === 0 ? '#fff' : '#F9FAFB'}>
                    <td style={s.td}><span style={s.idBadge}>#{t.id}</span></td>
                    <td style={s.td}><strong style={{ color: '#111827' }}>{t.nume}</strong></td>
                    <td style={s.td}><span style={{ color: '#6B7280' }}>📍 {t.locatie}</span></td>
                    <td style={s.td}>
                      <span style={{ fontSize: 12, color: '#374151' }}>
                        {t.dataInceput} → {t.dataSfarsit}
                      </span>
                    </td>
                    <td style={s.td}><span style={s.numBadge}>{String(t.capacitate)}</span></td>
                    <td style={s.td}><strong style={{ color: '#16A34A' }}>{String(t.pret)} RON</strong></td>
                    <td style={s.td}>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>
                        {String(t.varstaMin)}–{String(t.varstaMax)} ani
                      </span>
                    </td>
                    <td style={s.td}>
                      <span style={{ ...s.tipBadge, backgroundColor: tipColor(t.tipPublic) }}>
                        {t.tipPublic}
                      </span>
                    </td>
                    <td style={s.td}>
                      {t.idCoordonatorPrincipal ? (
                        <span style={s.coordBadge}>
                          👤 {emailCoordonator(t.idCoordonatorPrincipal)}
                        </span>
                      ) : (
                        <span style={{ color: '#D1D5DB', fontSize: 12 }}>Neasignat</span>
                      )}
                    </td>
                    <td style={s.td}>
                      <div style={s.actions}>
                        <button onClick={() => openEdit(t)} style={s.btnEdit}>✏️ Editează</button>
                        <button onClick={() => handleDelete(t.id, t.nume)} style={s.btnDelete}>🗑️ Șterge</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <p style={s.footerCount}>{filtered.length} din {tabere.length} tabere afișate</p>
      )}

      {/* Modal */}
      {modal && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modalBox} onClick={e => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {modal === 'add' ? '🏕️ Tabără nouă' : `✏️ Editează — ${form.nume}`}
              </h2>
              <button style={s.closeBtn} onClick={closeModal}>✕</button>
            </div>

            <div style={s.modalBody}>
              <div style={s.formGrid}>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={s.label}>Nume tabără *</label>
                  <input style={s.input} type="text" name="nume"
                    value={form.nume} onChange={handleChange} placeholder="ex: Tabăra de Vară 2025" />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={s.label}>Locație *</label>
                  <input style={s.input} type="text" name="locatie"
                    value={form.locatie} onChange={handleChange} placeholder="ex: Sinaia, Prahova" />
                </div>

                <div>
                  <label style={s.label}>Data început *</label>
                  <input style={s.input} type="date" name="dataInceput"
                    value={form.dataInceput} onChange={handleChange} />
                </div>

                <div>
                  <label style={s.label}>Data sfârșit *</label>
                  <input style={s.input} type="date" name="dataSfarsit"
                    value={form.dataSfarsit} onChange={handleChange} />
                </div>

                <div>
                  <label style={s.label}>Capacitate (locuri) *</label>
                  <input style={s.input} type="number" name="capacitate"
                    value={form.capacitate} onChange={handleChange} placeholder="ex: 30" />
                </div>

                <div>
                  <label style={s.label}>Preț (RON) *</label>
                  <input style={s.input} type="number" name="pret"
                    value={form.pret} onChange={handleChange} placeholder="ex: 2500" />
                </div>

                <div>
                  <label style={s.label}>Vârstă minimă</label>
                  <input style={s.input} type="number" name="varstaMin"
                    value={form.varstaMin} onChange={handleChange} placeholder="ex: 7" />
                </div>

                <div>
                  <label style={s.label}>Vârstă maximă</label>
                  <input style={s.input} type="number" name="varstaMax"
                    value={form.varstaMax} onChange={handleChange} placeholder="ex: 18" />
                </div>

                <div>
                  <label style={s.label}>Tip public</label>
                  <select style={s.input} name="tipPublic" value={form.tipPublic} onChange={handleChange}>
                    <option value="mixt">Mixt</option>
                    <option value="baieti">Băieți</option>
                    <option value="fete">Fete</option>
                  </select>
                </div>

                {/* Dropdown coordonator — doar la editare */}
                {modal === 'edit' && (
                  <div>
                    <label style={s.label}>Coordonator principal</label>
                    <select style={s.input} name="idCoordonatorPrincipal"
                      value={form.idCoordonatorPrincipal || ''}
                      onChange={handleChange}>
                      <option value="">— Neasignat —</option>
                      {coordonatori.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.email}
                        </option>
                      ))}
                    </select>
                    <p style={s.hint}>
                      {coordonatori.length === 0
                        ? 'Nu există coordonatori în sistem.'
                        : `${coordonatori.length} coordonatori disponibili`}
                    </p>
                  </div>
                )}

                <div>
                  <label style={s.label}>Latitudine</label>
                  <input style={s.input} type="number" name="latitudine"
                    value={form.latitudine} onChange={handleChange} placeholder="ex: 45.3521" />
                </div>

                <div>
                  <label style={s.label}>Longitudine</label>
                  <input style={s.input} type="number" name="longitudine"
                    value={form.longitudine} onChange={handleChange} placeholder="ex: 25.5372" />
                </div>

              </div>
            </div>

            <div style={s.modalFooter}>
              <button onClick={closeModal} style={s.btnCancel}>Anulează</button>
              <button onClick={handleSave} style={s.btnSave} disabled={saving}>
                {saving ? 'Se salvează...' : modal === 'add' ? 'Adaugă tabăra' : 'Salvează modificările'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const s = {
  page: { maxWidth: 1200, margin: '0 auto', padding: '40px 24px', fontFamily: "'Inter','Segoe UI',sans-serif" },
  centered: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300 },
  spinner: { width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #2563EB', borderRadius: '50%' },
  toast: { position: 'fixed', top: 20, right: 24, padding: '12px 20px', borderRadius: 8, border: '1px solid', fontSize: 14, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: 400 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 },
  eyebrow: { fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#2563EB', margin: '0 0 6px 0' },
  title: { fontSize: 28, fontWeight: 700, color: '#111827', margin: '0 0 4px 0' },
  subtitle: { fontSize: 14, color: '#6B7280', margin: 0 },
  btnPrimary: { backgroundColor: '#2563EB', color: '#fff', padding: '10px 20px', borderRadius: 8, border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer' },
  searchWrap: { position: 'relative', marginBottom: 20, display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: 12, fontSize: 14, pointerEvents: 'none' },
  searchInput: { width: '100%', padding: '10px 40px 10px 36px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827' },
  clearBtn: { position: 'absolute', right: 12, background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  empty: { textAlign: 'center', padding: '60px 20px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
  th: { padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6B7280', backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', fontSize: 13, color: '#374151', borderBottom: '1px solid #F3F4F6', verticalAlign: 'middle' },
  idBadge: { fontFamily: 'monospace', fontSize: 12, color: '#6B7280', backgroundColor: '#F3F4F6', padding: '2px 7px', borderRadius: 4 },
  numBadge: { fontWeight: 600, color: '#2563EB' },
  tipBadge: { color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, display: 'inline-block' },
  coordBadge: { fontSize: 12, color: '#374151', backgroundColor: '#F0F9FF', padding: '3px 8px', borderRadius: 6, border: '1px solid #BAE6FD' },
  actions: { display: 'flex', gap: 6 },
  btnEdit: { backgroundColor: '#EFF6FF', color: '#2563EB', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: '1px solid #BFDBFE', cursor: 'pointer', whiteSpace: 'nowrap' },
  btnDelete: { backgroundColor: '#FEF2F2', color: '#DC2626', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, border: '1px solid #FECACA', cursor: 'pointer', whiteSpace: 'nowrap' },
  footerCount: { marginTop: 12, fontSize: 13, color: '#9CA3AF', textAlign: 'right' },
  overlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 },
  modalBox: { backgroundColor: '#fff', borderRadius: 14, width: '100%', maxWidth: 680, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #E5E7EB' },
  modalTitle: { fontSize: 18, fontWeight: 700, color: '#111827', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: 18, cursor: 'pointer', color: '#9CA3AF', padding: 4 },
  modalBody: { padding: '24px', overflowY: 'auto', flex: 1 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  label: { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 7, fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#111827', backgroundColor: '#fff' },
  hint: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  modalFooter: { padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', justifyContent: 'flex-end', gap: 10 },
  btnCancel: { padding: '9px 18px', borderRadius: 7, border: '1px solid #D1D5DB', backgroundColor: '#fff', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' },
  btnSave: { padding: '9px 20px', borderRadius: 7, border: 'none', backgroundColor: '#2563EB', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

export default CampManagement;