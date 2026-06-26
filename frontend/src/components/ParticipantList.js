import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ParticipantList = () => {
    const [participanti, setParticipanti] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [feedback, setFeedback] = useState(null); // { type: 'success'|'error', msg }
    const [tabere, setTabere] = useState([]);
    const [tabaraSelectata, setTabaraSelectata] = useState('');
    const navigate = useNavigate();

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const esteAdmin = userRole === '1';

    useEffect(() => {
        // Admin: toate taberele din sistem. Coordonator: doar taberele unde are activități asignate.
        const urlTabere = esteAdmin
            ? 'http://localhost:8080/tabere/lista'
            : `http://localhost:8080/tabere/coordonator/${userId}`;

        axios.get(urlTabere)
            .then(res => setTabere(res.data));
    }, []);

    // La schimbarea selecției din dropdown, reîncărcăm lista
    useEffect(() => {
        if (tabaraSelectata) {
            fetchParticipanti();
        } else {
            setParticipanti([]);
        }
    }, [tabaraSelectata]);

    const fetchParticipanti = async () => {
        try {
            const token = localStorage.getItem('token');

            if (!tabaraSelectata) {
                setParticipanti([]);
                return;
            }

            const response = await axios.get(`http://localhost:8080/participanti/lista/tabara/${tabaraSelectata}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setParticipanti(response.data);
        } catch (error) {
            console.error("Eroare la aducerea participanților:", error);
            if (error.response && error.response.status === 401) {
                alert("Sesiunea a expirat sau nu ai acces. Te rugăm să te reloghezi.");
            }
        }
    };

    // Filtru inteligent: caută și după nume și după prenume
    const participantiFiltrati = participanti.filter(p =>
        p.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prenume.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Funcția de EXPORT EXCEL (CSV)
    const exportToCSV = () => {
        if (participantiFiltrati.length === 0) {
            alert("Nu sunt participanți de exportat pentru această selecție!");
            return;
        }
        let csvContent = "Nume,Prenume,Gen,Data Nasterii,Telefon,Alergii,Contact Urgenta\n";
        participantiFiltrati.forEach(p => {
            const nume = p.nume || '';
            const prenume = p.prenume || '';
            const gen = p.gen || '';
            const dataNasterii = p.dataNasterii || '';
            const telefon = p.telefon || '';
            // Curățăm virgulele ca să nu strice coloanele în Excel
            const alergii = (p.alergii || 'Fără').replace(/,/g, ' ');
            const contact = (p.contactUrgenta || '').replace(/,/g, ' ');
            csvContent += `${nume},${prenume},${gen},${dataNasterii},${telefon},${alergii},${contact}\n`;
        });
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Baza_Date_Participanti_CRM.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // ── NOU — Ștergere participant cu mesaj de eroare de la backend ───────────
    const handleDelete = async (id, nume, prenume) => {
        if (!window.confirm(`Sigur vrei să ștergi participantul "${nume} ${prenume}"?`)) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:8080/participanti/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Eliminare din lista locală fără re-fetch
            setParticipanti(participanti.filter(p => p.id !== id));
            showFeedback('success', `Participantul ${nume} ${prenume} a fost șters cu succes.`);
        } catch (error) {
            // Mesajul vine direct de la backend
            // ex: "Nu poți șterge participantul! Are înscrieri active."
            const msg = error.response?.data || 'Nu s-a putut șterge participantul.';
            showFeedback('error', msg);
        }
    };

    const showFeedback = (type, msg) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 4000);
    };

    return (
        <div className="container mt-4">

            {/* ── Toast feedback ── */}
            {feedback && (
                <div style={{
                    position: 'fixed', top: 20, right: 24, zIndex: 9999,
                    padding: '12px 20px', borderRadius: 8, fontSize: 14, fontWeight: 500,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    backgroundColor: feedback.type === 'success' ? '#DCFCE7' : '#FEE2E2',
                    color: feedback.type === 'success' ? '#15803D' : '#DC2626',
                    border: `1px solid ${feedback.type === 'success' ? '#16A34A' : '#DC2626'}`,
                    maxWidth: 420
                }}>
                    {feedback.type === 'success' ? '✅ ' : '❌ '}{feedback.msg}
                </div>
            )}

            {/* Header: Titlu și Buton Export */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0">
                        <i className="bi bi-person-lines-fill me-2 text-primary"></i>
                        Bază de Date Participanți (CRM)
                    </h2>
                    <select
                        className="form-select form-select-sm mt-2"
                        style={{ maxWidth: '280px' }}
                        value={tabaraSelectata}
                        onChange={e => setTabaraSelectata(e.target.value)}
                    >
                        <option value="">-- Selectează o tabără --</option>
                        {tabere.map(t => <option key={t.id} value={t.id}>{t.nume}</option>)}
                    </select>
                </div>
                <button onClick={exportToCSV} className="btn btn-success shadow-sm">
                    <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                    Descarcă Registru (Excel)
                </button>
                <button
                    onClick={() => navigate('/check-in-out')}
                    className="btn btn-primary shadow-sm ms-2"
                >
                    <i className="bi bi-clipboard-check me-2"></i>
                    Gestionează Check-In Tabără
                </button>
            </div>

            {/* Zona de Căutare */}
            <div className="card shadow-sm border-0 mb-4 bg-light">
                <div className="card-body d-flex align-items-center">
                    <label className="fw-bold me-3 text-secondary">Caută participant:</label>
                    <input
                        type="text"
                        className="form-control w-auto shadow-sm"
                        placeholder="Ex: Popescu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="ms-3 text-muted small">
                        Afișează {participantiFiltrati.length} înregistrări
                    </span>
                </div>
            </div>

            {/* Tabelul de Date */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-borderless align-middle mb-0">
                            <thead className="table-light text-secondary">
                                <tr>
                                    <th className="px-4 py-3">Nume și Prenume</th>
                                    <th>Gen</th>
                                    <th>Data Nașterii</th>
                                    <th>Telefon</th>
                                    <th>Contact Urgență</th>
                                    <th>Alergii / Detalii Medicale</th>
                                    {/* ── coloana Acțiuni — doar admin ── */}
                                    {esteAdmin && <th className="text-center">Acțiuni</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {participantiFiltrati.length > 0 ? (
                                    participantiFiltrati.map((p) => (
                                        <tr key={p.id} className="border-bottom">
                                            <td className="px-4 fw-bold text-dark">{p.nume} {p.prenume}</td>
                                            <td>
                                                <span className={`badge ${p.gen === 'M' ? 'bg-info text-dark' : 'bg-danger'} rounded-pill`}>
                                                    {p.gen}
                                                </span>
                                            </td>
                                            <td>{p.dataNasterii}</td>
                                            <td>{p.telefon}</td>
                                            <td>{p.contactUrgenta}</td>
                                            <td>
                                                {p.alergii && p.alergii.toLowerCase() !== 'fără' ? (
                                                    <span className="text-danger fw-bold">
                                                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                                        {p.alergii}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted">Fără</span>
                                                )}
                                            </td>
                                            {/* ── buton ștergere — doar admin ── */}
                                            <td className="text-center">
                                                {esteAdmin && (
                                                <button
                                                    onClick={() => handleDelete(p.id, p.nume, p.prenume)}
                                                    className="btn btn-sm"
                                                    style={{
                                                        backgroundColor: '#FEF2F2',
                                                        color: '#DC2626',
                                                        border: '1px solid #FECACA',
                                                        fontSize: 12,
                                                        fontWeight: 500
                                                    }}
                                                    title="Șterge participant"
                                                >
                                                    🗑️ Șterge
                                                </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={esteAdmin ? 7 : 6} className="text-center py-5 text-muted">
                                            Nu s-au găsit participanți în baza de date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipantList;