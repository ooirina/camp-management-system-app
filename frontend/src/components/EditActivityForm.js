import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const EditActivityForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    const [activitate, setActivitate] = useState({
        nume: '', data: '', descriere: '', oraInceput: '', oraSfarsit: '',
        locatie: '', capacitateMaxima: '', idTabara: '', idCoordonator: ''
    });

    const [tabere, setTabere] = useState([]);
    const [coordonatori, setCoordonatori] = useState([]);
    const [eroare, setEroare] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDate = async () => {
            try {
                const resTabere = await axios.get('http://localhost:8080/tabere/lista', config);
                setTabere(resTabere.data);
            } catch (err) {
                console.error("Eroare tabere:", err);
                setEroare('Nu s-au putut încărca taberele.');
            }

            try {
                const resCoord = await axios.get('http://localhost:8080/utilizatori/coordonatori/lista', config);
                setCoordonatori(resCoord.data);
            } catch (err) {
                console.error("Eroare coordonatori:", err);
                setEroare(prev => prev + ' Nu s-au putut încărca coordonatorii.');
            }

            try {
                // Preîncărcăm datele activității existente
                const resActivitate = await axios.get(`http://localhost:8080/activitati/${id}`, config);
                const act = resActivitate.data;
                setActivitate({
                    nume: act.nume || '',
                    data: act.data || '',
                    descriere: act.descriere || '',
                    oraInceput: act.oraInceput ? act.oraInceput.substring(0, 5) : '',
                    oraSfarsit: act.oraSfarsit ? act.oraSfarsit.substring(0, 5) : '',
                    locatie: act.locatie || '',
                    capacitateMaxima: act.capacitateMax || '',
                    idTabara: act.tabara?.id || '',
                    idCoordonator: act.coordonator?.id || ''
                });
            } catch (err) {
                console.error("Eroare activitate:", err);
                setEroare(prev => prev + ' Nu s-a putut încărca activitatea.');
            } finally {
                setLoading(false);
            }
        };
        fetchDate();
    }, [id]);

    // Filtrare tabere: Admin vede toate, Coordonator doar ale lui (principal)
    const tabereFiltrate = tabere.filter(t => {
        if (userRole === '1') return true;
        const idCoordPrincipal = t.idCoordonatorPrincipal;
        const idUserLogat = parseInt(userId);
        return idCoordPrincipal === idUserLogat;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSend = {
                nume: activitate.nume,
                data: activitate.data,
                descriere: activitate.descriere,
                oraInceput: activitate.oraInceput,
                oraSfarsit: activitate.oraSfarsit,
                locatie: activitate.locatie,
                capacitateMax: activitate.capacitateMaxima,
                tabara: { id: activitate.idTabara },
                coordonator: { id: activitate.idCoordonator }
            };
            await axios.put(`http://localhost:8080/activitati/actualizare/${id}`, dataToSend, config);
            alert("Activitate actualizată cu succes!");
            navigate('/activitati');
        } catch (err) {
            console.error("Eroare trimitere:", err.response?.data || err);
            alert("Eroare la salvare! Verifică consola (F12).");
        }
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-muted mt-3">Se încarcă activitatea...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold">Editează Activitate</h2>

            {eroare && (
                <div className="alert alert-danger">{eroare}</div>
            )}

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 rounded-4">
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label fw-semibold">Nume Activitate</label>
                        <input className="form-control" value={activitate.nume}
                               onChange={e => setActivitate({...activitate, nume: e.target.value})} required />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">
                            Tabără ({tabereFiltrate.length} disponibile)
                        </label>
                        <select className="form-select" value={activitate.idTabara}
                                onChange={e => setActivitate({...activitate, idTabara: e.target.value})} required>
                            <option value="">Selectează Tabăra</option>
                            {tabereFiltrate.map(t => (
                                <option key={t.id} value={t.id}>{t.nume}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">
                            Coordonator ({coordonatori.length} disponibili)
                        </label>
                        <select className="form-select"
                                value={activitate.idCoordonator}
                                onChange={e => setActivitate({...activitate, idCoordonator: e.target.value})} required>
                            <option value="">Selectează Coordonator</option>
                            {coordonatori.map(c => (
                                <option key={c.id} value={c.id}>
                                    {c.nume && c.prenume ? `${c.nume} ${c.prenume}` : c.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Data</label>
                        <input type="date" className="form-control" value={activitate.data}
                               onChange={e => setActivitate({...activitate, data: e.target.value})} required />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Ora Început</label>
                        <input type="time" className="form-control" value={activitate.oraInceput}
                               onChange={e => setActivitate({...activitate, oraInceput: e.target.value})} required />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Ora Sfârșit</label>
                        <input type="time" className="form-control" value={activitate.oraSfarsit}
                               onChange={e => setActivitate({...activitate, oraSfarsit: e.target.value})} required />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-semibold">Descriere</label>
                        <textarea className="form-control" rows="3" value={activitate.descriere}
                                  onChange={e => setActivitate({...activitate, descriere: e.target.value})}></textarea>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Locație</label>
                        <input className="form-control" value={activitate.locatie}
                               onChange={e => setActivitate({...activitate, locatie: e.target.value})} />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Capacitate Maximă</label>
                        <input type="number" className="form-control" value={activitate.capacitateMaxima}
                               onChange={e => setActivitate({...activitate, capacitateMaxima: e.target.value})} />
                    </div>

                    <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary w-100 p-2 shadow-sm">
                            Salvează Modificările
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default EditActivityForm;