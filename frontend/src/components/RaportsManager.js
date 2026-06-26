import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

// ─── Constante coloane disponibile pentru raportul personalizat ───────────────
const COLOANE_DISPONIBILE = {
  Participant: [
    { key: 'numeParticipant',    label: 'Nume' },
    { key: 'prenumeParticipant', label: 'Prenume' },
    { key: 'varsta',             label: 'Vârstă' },
    { key: 'gen',                label: 'Gen' },
    { key: 'alergii',            label: 'Alergii' },
    { key: 'problemeMedicale',   label: 'Probleme Medicale' },
    { key: 'telefon',            label: 'Telefon' },
    { key: 'contactUrgenta',     label: 'Contact Urgență' },
  ],
  Înscriere: [
    { key: 'numeTabara',         label: 'Tabăra' },
    { key: 'dataInscriere',      label: 'Data Înscrierii' },
    { key: 'statut',             label: 'Statut' },
    { key: 'statusPlata',        label: 'Status Plată' },
    { key: 'suma',               label: 'Sumă (RON)' },
    { key: 'dataPlata',          label: 'Data Plată' },
    { key: 'statusSosire',       label: 'Status Sosire' },
    { key: 'dataCheckin',        label: 'Check-in' },
    { key: 'dataCheckout',       label: 'Check-out' },
    { key: 'documentMedical',    label: 'Fișă Medicală' },
  ],
};

const TOATE_COLOANELE = [
  ...COLOANE_DISPONIBILE.Participant,
  ...COLOANE_DISPONIBILE.Înscriere,
];

// ─── Tipuri rapoarte built-in ─────────────────────────────────────────────────
const RAPOARTE_BUILTIN = [
  { id: 'inscrieri',    icon: '📋', label: 'Înscrieri',         desc: 'Toți participanții înscriși, statusuri și date' },
  { id: 'financiar',   icon: '💳', label: 'Financiar',         desc: 'Plăți, sume, restanțe și venituri per tabără' },
  { id: 'medical',     icon: '🩺', label: 'Medical & Alergii', desc: 'Participanți cu alergii sau probleme medicale' },
  { id: 'checkin',     icon: '✅', label: 'Check-in / Check-out', desc: 'Prezențe, sosiri confirmate și plecări' },
  { id: 'participanti',icon: '👥', label: 'Participanți',      desc: 'Statistici per tabără, vârstă și gen' },
  { id: 'custom',      icon: '⚙️', label: 'Raport Personalizat', desc: 'Alege coloanele, filtrele și exportă' },
];

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (val, key) => {
  if (val == null || val === '') return '—';
  if (key && (key.toLowerCase().includes('data') || key.toLowerCase().includes('checkin') || key.toLowerCase().includes('checkout'))) {
    const d = new Date(val);
    return isNaN(d) ? val : d.toLocaleDateString('ro-RO');
  }
  if (key === 'documentMedical') return val ? '✅ Da' : '❌ Nu';
  if (key === 'statusPlata') return val;
  if (key === 'statut') return val;
  return val;
};

const calcVarsta = (dataNasterii) => {
  if (!dataNasterii) return null;
  const d = new Date(dataNasterii);
  const azi = new Date();
  let v = azi.getFullYear() - d.getFullYear();
  if (azi.getMonth() < d.getMonth() || (azi.getMonth() === d.getMonth() && azi.getDate() < d.getDate())) v--;
  return v;
};

function exportCSV(coloane, randuri, numeFisier) {
  const header = coloane.map(c => c.label).join(',');
  const rows = randuri.map(r => coloane.map(c => {
    const v = fmt(r[c.key], c.key);
    return `"${String(v).replace(/"/g, '""')}"`;
  }).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = numeFisier + '.csv'; a.click();
}

// ─── Componente mici ──────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: '10px', padding: '18px 20px', flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: '12px', fontWeight: 600, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>{icon} {label}</div>
      <div style={{ fontSize: '26px', fontWeight: 700, color: color || '#101828' }}>{value}</div>
      {sub && <div style={{ fontSize: '12px', color: '#98A2B3', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function TabelRaport({ coloane, randuri, loading, onExportCSV }) {
  if (loading) return <div style={{ padding: '48px', textAlign: 'center', color: '#98A2B3', fontSize: '13px' }}>Se încarcă datele…</div>;
  if (!randuri.length) return (
    <div style={{ padding: '48px', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', marginBottom: '8px' }}>📭</div>
      <div style={{ fontWeight: 600, color: '#101828', fontSize: '14px' }}>Niciun rezultat</div>
      <div style={{ color: '#98A2B3', fontSize: '13px', marginTop: '4px' }}>Ajustează filtrele pentru a vedea date.</div>
    </div>
  );
  return (
    <div>
      <div style={{ padding: '14px 20px', borderBottom: '1px solid #E4E7EC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: '#475467' }}><strong>{randuri.length}</strong> înregistrări</span>
        <button onClick={onExportCSV} style={{ height: '32px', padding: '0 14px', borderRadius: '7px', border: '1px solid #D0D5DD', background: '#fff', fontSize: '12px', fontWeight: 500, color: '#344054', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⬇ Export CSV
        </button>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: '#F8F9FB' }}>
              {coloane.map(c => (
                <th key={c.key} style={{ padding: '9px 14px', fontSize: '11px', fontWeight: 600, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E4E7EC', whiteSpace: 'nowrap', textAlign: 'left' }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {randuri.map((r, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F2F4F7' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8F9FB'}
                onMouseLeave={e => e.currentTarget.style.background = ''}>
                {coloane.map(c => {
                  const v = fmt(r[c.key], c.key);
                  let style = { padding: '12px 14px', color: '#344054', whiteSpace: 'nowrap' };
                  // colorare specială
                  if (c.key === 'statusPlata') {
                    return (
                      <td key={c.key} style={style}>
                        <span style={{ background: v === 'PLATIT' ? '#DCFCE7' : '#FEF3C7', color: v === 'PLATIT' ? '#16A34A' : '#D97706', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>{v}</span>
                      </td>
                    );
                  }
                  if (c.key === 'statut') {
                    return (
                      <td key={c.key} style={style}>
                        <span style={{ background: v === 'CONFIRMAT' ? '#DCFCE7' : '#F2F4F7', color: v === 'CONFIRMAT' ? '#16A34A' : '#475467', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>{v}</span>
                      </td>
                    );
                  }
                  if (c.key === 'alergii' && v !== '—') {
                    return <td key={c.key} style={style}><span style={{ background: '#FEE2E2', color: '#DC2626', borderRadius: '20px', padding: '2px 10px', fontSize: '11px', fontWeight: 600 }}>⚠ {v}</span></td>;
                  }
                  if (c.key === 'numeParticipant') {
                    return <td key={c.key} style={{ ...style, fontWeight: 600, color: '#101828' }}>{v}</td>;
                  }
                  if (c.key === 'suma') {
                    return <td key={c.key} style={{ ...style, fontWeight: 600, color: '#16A34A' }}>{v !== '—' ? `${v} RON` : '—'}</td>;
                  }
                  return <td key={c.key} style={style}>{v}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Componenta principală ────────────────────────────────────────────────────
function RaportsManager() {
  const idCoordonator = localStorage.getItem('userId');

  const [raportActiv, setRaportActiv] = useState('inscrieri');
  const [tabere, setTabere] = useState([]);
  const [filtruTabara, setFiltruTabara] = useState('TOATE');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState([]); // date brute de la backend

  // Stare raport personalizat
  const [coloaneSelectate, setColoaneSelectate] = useState(['numeParticipant', 'prenumeParticipant', 'numeTabara', 'statusPlata', 'statut']);
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [cautare, setCautare] = useState('');

  // Aducem lista tabere
  useEffect(() => {
    if (!idCoordonator) return;
    axios.get(`http://localhost:8080/tabere/coordonator-principal/${idCoordonator}`)
      .then(res => setTabere(res.data))
      .catch(err => console.error(err));
  }, [idCoordonator]);

  // Aducem datele când se schimbă raportul sau tabăra
  useEffect(() => {
    if (!idCoordonator) return;
    setLoading(true);
    setCautare('');
    const tabParam = filtruTabara !== 'TOATE' ? `/tabara/${filtruTabara}` : '';

    const urlMap = {
      inscrieri:    `http://localhost:8080/rapoarte/inscrieri/${idCoordonator}${tabParam}`,
      financiar:    `http://localhost:8080/rapoarte/financiar/${idCoordonator}${tabParam}`,
      medical:      `http://localhost:8080/rapoarte/medical/${idCoordonator}${tabParam}`,
      checkin:      `http://localhost:8080/rapoarte/checkin/${idCoordonator}${tabParam}`,
      participanti: `http://localhost:8080/rapoarte/participanti/${idCoordonator}${tabParam}`,
      custom:       `http://localhost:8080/rapoarte/complet/${idCoordonator}${tabParam}`,
    };

    axios.get(urlMap[raportActiv])
      .then(res => { setDate(res.data); setLoading(false); })
      .catch(err => { console.error(err); setDate([]); setLoading(false); });
  }, [raportActiv, filtruTabara, idCoordonator]);

  // Date filtrate după căutare
  const dateFiltered = useMemo(() => {
    if (!cautare.trim()) return date;
    const q = cautare.toLowerCase();
    return date.filter(r =>
      Object.values(r).some(v => v && String(v).toLowerCase().includes(q))
    );
  }, [date, cautare]);

  // Coloane pentru raportul activ (built-in)
  const COLOANE_BUILTIN = {
    inscrieri:    [
      { key: 'numeParticipant', label: 'Nume' }, { key: 'prenumeParticipant', label: 'Prenume' },
      { key: 'numeTabara', label: 'Tabăra' }, { key: 'dataInscriere', label: 'Data Înscrierii' },
      { key: 'statut', label: 'Statut' }, { key: 'statusPlata', label: 'Plată' },
      { key: 'suma', label: 'Sumă' }, { key: 'documentMedical', label: 'Fișă Medicală' },
    ],
    financiar:    [
      { key: 'numeParticipant', label: 'Nume' }, { key: 'prenumeParticipant', label: 'Prenume' },
      { key: 'numeTabara', label: 'Tabăra' }, { key: 'suma', label: 'Sumă (RON)' },
      { key: 'statusPlata', label: 'Status Plată' }, { key: 'dataPlata', label: 'Data Plată' },
      { key: 'statut', label: 'Statut' },
    ],
    medical:      [
      { key: 'numeParticipant', label: 'Nume' }, { key: 'prenumeParticipant', label: 'Prenume' },
      { key: 'varsta', label: 'Vârstă' }, { key: 'gen', label: 'Gen' },
      { key: 'alergii', label: 'Alergii' }, { key: 'problemeMedicale', label: 'Probleme Medicale' },
      { key: 'numeTabara', label: 'Tabăra' }, { key: 'contactUrgenta', label: 'Contact Urgență' },
    ],
    checkin:      [
      { key: 'numeParticipant', label: 'Nume' }, { key: 'prenumeParticipant', label: 'Prenume' },
      { key: 'numeTabara', label: 'Tabăra' }, { key: 'statusSosire', label: 'Sosire' },
      { key: 'dataCheckin', label: 'Check-in' }, { key: 'dataCheckout', label: 'Check-out' },
    ],
    participanti: [
      { key: 'numeParticipant', label: 'Nume' }, { key: 'prenumeParticipant', label: 'Prenume' },
      { key: 'varsta', label: 'Vârstă' }, { key: 'gen', label: 'Gen' },
      { key: 'numeTabara', label: 'Tabăra' }, { key: 'telefon', label: 'Telefon' },
      { key: 'contactUrgenta', label: 'Contact Urgență' },
    ],
  };

  const coloaneActive = raportActiv === 'custom'
    ? TOATE_COLOANELE.filter(c => coloaneSelectate.includes(c.key))
    : (COLOANE_BUILTIN[raportActiv] || []);

  // Stats pentru header
  const stats = useMemo(() => {
    if (!date.length) return null;
    if (raportActiv === 'financiar') {
      const total = date.reduce((s, r) => s + (parseFloat(r.suma) || 0), 0);
      const platite = date.filter(r => r.statusPlata === 'PLATIT').length;
      const neplatite = date.filter(r => r.statusPlata === 'NEPLATIT').length;
      return [
        { icon: '💰', label: 'Venituri totale', value: `${total.toLocaleString()} RON`, color: '#16A34A' },
        { icon: '✅', label: 'Plăți confirmate', value: platite, sub: `din ${date.length}` },
        { icon: '⏳', label: 'Restanțe', value: neplatite, color: '#D97706' },
      ];
    }
    if (raportActiv === 'medical') {
      const cuAlergii = date.filter(r => r.alergii).length;
      const cuProbleme = date.filter(r => r.problemeMedicale).length;
      return [
        { icon: '👥', label: 'Total participanți', value: date.length },
        { icon: '⚠️', label: 'Cu alergii', value: cuAlergii, color: '#DC2626' },
        { icon: '🩺', label: 'Probleme medicale', value: cuProbleme, color: '#D97706' },
      ];
    }
    if (raportActiv === 'checkin') {
      const sositi = date.filter(r => r.dataCheckin).length;
      const plecati = date.filter(r => r.dataCheckout).length;
      return [
        { icon: '👥', label: 'Total înscriși', value: date.length },
        { icon: '✅', label: 'Check-in efectuat', value: sositi, color: '#16A34A' },
        { icon: '🚪', label: 'Check-out efectuat', value: plecati },
      ];
    }
    if (raportActiv === 'inscrieri') {
      const confirmate = date.filter(r => r.statut === 'CONFIRMAT').length;
      const cuFisa = date.filter(r => r.documentMedical).length;
      return [
        { icon: '📋', label: 'Total înscrieri', value: date.length },
        { icon: '✅', label: 'Confirmate', value: confirmate, color: '#16A34A' },
        { icon: '📄', label: 'Fișe medicale', value: cuFisa, sub: `din ${date.length}` },
      ];
    }
    if (raportActiv === 'participanti') {
      const adulti = date.filter(r => (r.varsta || calcVarsta(r.dataNasterii) || 0) >= 18).length;
      const fete = date.filter(r => r.gen === 'F').length;
      return [
        { icon: '👥', label: 'Total participanți', value: date.length },
        { icon: '🧑', label: 'Adulți', value: adulti },
        { icon: '👧', label: 'Feminin', value: fete },
      ];
    }
    return null;
  }, [date, raportActiv]);

  const raportInfo = RAPOARTE_BUILTIN.find(r => r.id === raportActiv);

  const toggleColoana = (key) => {
    setColoaneSelectate(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* ── Page header ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid #E4E7EC', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>📊</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#101828' }}>Rapoarte & Analize</div>
            <div style={{ fontSize: '11px', color: '#98A2B3' }}>Date despre tabere, participanți și operațiuni</div>
          </div>
        </div>
        {/* Filtru tabară global */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#98A2B3', fontWeight: 500 }}>Tabăra:</span>
          <select
            style={{ height: '34px', padding: '0 28px 0 10px', borderRadius: '8px', border: '1px solid #D0D5DD', background: `#fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2398A2B3' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 8px center`, appearance: 'none', fontSize: '13px', color: '#101828', fontFamily: 'inherit', cursor: 'pointer', minWidth: '180px' }}
            value={filtruTabara}
            onChange={e => setFiltruTabara(e.target.value)}
          >
            <option value="TOATE">Toate taberele mele (unde sunt coordonator principal)</option>
            {tabere.map(t => <option key={t.id} value={t.id}>{t.nume}</option>)}
          </select>
        </div>
      </div>

      <div className="container-fluid" style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px 24px' }}>

        {/* ── Carduri de navigare rapoarte ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {RAPOARTE_BUILTIN.map(r => (
            <div
              key={r.id}
              onClick={() => setRaportActiv(r.id)}
              style={{
                background: raportActiv === r.id ? '#101828' : '#fff',
                border: `1px solid ${raportActiv === r.id ? '#101828' : '#E4E7EC'}`,
                borderRadius: '10px',
                padding: '16px',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{r.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: raportActiv === r.id ? '#fff' : '#101828', marginBottom: '4px' }}>{r.label}</div>
              <div style={{ fontSize: '11px', color: raportActiv === r.id ? '#9CA3AF' : '#98A2B3', lineHeight: 1.4 }}>{r.desc}</div>
            </div>
          ))}
        </div>

        {/* ── Stats cards ── */}
        {stats && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {stats.map((s, i) => <StatCard key={i} {...s} />)}
          </div>
        )}

        {/* ── Raport card ── */}
        <div style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: '12px', overflow: 'hidden' }}>

          {/* Card header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E4E7EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>{raportInfo?.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#101828' }}>{raportInfo?.label}</div>
                <div style={{ fontSize: '12px', color: '#98A2B3' }}>{raportInfo?.desc}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Căutare */}
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#98A2B3', fontSize: '13px' }}>🔍</span>
                <input
                  value={cautare}
                  onChange={e => setCautare(e.target.value)}
                  placeholder="Caută în raport..."
                  style={{ height: '34px', paddingLeft: '30px', paddingRight: '12px', borderRadius: '8px', border: '1px solid #D0D5DD', fontSize: '13px', fontFamily: 'inherit', outline: 'none', width: '200px', color: '#101828' }}
                />
              </div>

              {/* Buton coloane (doar la custom) */}
              {raportActiv === 'custom' && (
                <button
                  onClick={() => setShowColumnPicker(p => !p)}
                  style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: '1px solid #2563EB', background: '#EFF6FF', color: '#2563EB', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  ⚙️ Coloane ({coloaneSelectate.length})
                </button>
              )}
            </div>
          </div>

          {/* Column picker (custom report) */}
          {raportActiv === 'custom' && showColumnPicker && (
            <div style={{ padding: '20px', borderBottom: '1px solid #E4E7EC', background: '#F8F9FB' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#344054', marginBottom: '14px' }}>Selectează coloanele dorite:</div>
              <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
                {Object.entries(COLOANE_DISPONIBILE).map(([grup, cols]) => (
                  <div key={grup}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{grup}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {cols.map(c => (
                        <label key={c.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: '#344054' }}>
                          <input
                            type="checkbox"
                            checked={coloaneSelectate.includes(c.key)}
                            onChange={() => toggleColoana(c.key)}
                            style={{ accentColor: '#16A34A', width: '14px', height: '14px' }}
                          />
                          {c.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowColumnPicker(false)}
                style={{ marginTop: '16px', height: '32px', padding: '0 16px', borderRadius: '7px', border: 'none', background: '#101828', color: '#fff', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}
              >
                Aplică
              </button>
            </div>
          )}

          {/* Tabel */}
          <TabelRaport
            coloane={coloaneActive}
            randuri={dateFiltered}
            loading={loading}
            onExportCSV={() => exportCSV(coloaneActive, dateFiltered, `raport_${raportActiv}`)}
          />
        </div>

      </div>
    </div>
  );
}

export default RaportsManager;