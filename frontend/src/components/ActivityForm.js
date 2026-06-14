import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ActivityForm = () => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const config = { headers: { 'Authorization': `Bearer ${token}` } };

    const [activitate, setActivitate] = useState({
        nume: '', data: '', descriere: '', oraInceput: '', oraSfarsit: '',
        locatie: '', capacitateMaxima: '', idTabara: '', idCoordonator: userId || ''
    });

    const [tabere, setTabere] = useState([]);
    const [coordonatori, setCoordonatori] = useState([]);
    const [eroare, setEroare] = useState('');

    useEffect(() => {
        const fetchDate = async () => {
            try {
                // Tabere
                const resTabere = await axios.get('http://localhost:8080/tabere/lista', config);
                console.log("TABERE PRIMITE:", resTabere.data);
                console.log("userId din localStorage:", userId);
                console.log("Primul idCoordonatorPrincipal:", resTabere.data[0]?.idCoordonatorPrincipal);
                setTabere(resTabere.data);
            } catch (err) {
                console.error("Eroare tabere:", err);
                setEroare('Nu s-au putut încărca taberele.');
            }

            try {
                // Coordonatori — endpoint-ul corect acum
                const resCoord = await axios.get('http://localhost:8080/utilizatori/coordonatori/lista', config);
                console.log("COORDONATORI PRIMITI:", resCoord.data);
                setCoordonatori(resCoord.data);
            } catch (err) {
                console.error("Eroare coordonatori:", err);
                setEroare(prev => prev + ' Nu s-au putut încărca coordonatorii.');
            }
        };
        fetchDate();
    }, []);

    // Filtrare tabere: Admin vede toate, Coordonator doar ale lui
    const tabereFiltrate = tabere.filter(t => {
        if (userRole === '1') return true; // Admin vede tot
        const idCoordPrincipal = t.idCoordonatorPrincipal;
        const idUserLogat = parseInt(userId);
        console.log(`Tabara ${t.nume}: idCoordonatorPrincipal=${idCoordPrincipal}, userId=${idUserLogat}, match=${idCoordPrincipal === idUserLogat}`);
        return idCoordPrincipal === idUserLogat;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/activitati', activitate, config);
            alert("Activitate salvată cu succes!");
            navigate('/activitati');
        } catch (err) {
            console.error("Eroare trimitere:", err.response?.data || err);
            alert("Eroare la salvare! Verifică consola (F12).");
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 fw-bold">Adaugă Activitate Nouă</h2>

            {eroare && (
                <div className="alert alert-danger">{eroare}</div>
            )}

            <form onSubmit={handleSubmit} className="card p-4 shadow-sm border-0 rounded-4">
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label fw-semibold">Nume Activitate</label>
                        <input className="form-control"
                               onChange={e => setActivitate({...activitate, nume: e.target.value})} required />
                    </div>

                    {/* DROPDOWN TABERE — filtrat după coordonator */}
                    <div className="col-md-6">
                        <label className="form-label fw-semibold">
                            Tabără ({tabereFiltrate.length} disponibile)
                        </label>
                        <select className="form-select"
                                onChange={e => setActivitate({...activitate, idTabara: e.target.value})} required>
                            <option value="">Selectează Tabăra</option>
                            {tabereFiltrate.map(t => (
                                <option key={t.id} value={t.id}>{t.nume}</option>
                            ))}
                        </select>
                        {tabereFiltrate.length === 0 && tabere.length > 0 && (
                            <small className="text-danger">
                                Nu ești coordonator principal la nicio tabără.
                                (userId: {userId})
                            </small>
                        )}
                    </div>

                    {/* DROPDOWN COORDONATORI — toți din sistem */}
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
                        <input type="date" className="form-control"
                               onChange={e => setActivitate({...activitate, data: e.target.value})} required />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Ora Început</label>
                        <input type="time" className="form-control"
                               onChange={e => setActivitate({...activitate, oraInceput: e.target.value})} required />
                    </div>

                    <div className="col-md-3">
                        <label className="form-label fw-semibold">Ora Sfârșit</label>
                        <input type="time" className="form-control"
                               onChange={e => setActivitate({...activitate, oraSfarsit: e.target.value})} required />
                    </div>

                    <div className="col-12">
                        <label className="form-label fw-semibold">Descriere</label>
                        <textarea className="form-control" rows="3"
                                  onChange={e => setActivitate({...activitate, descriere: e.target.value})}></textarea>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Locație</label>
                        <input className="form-control"
                               onChange={e => setActivitate({...activitate, locatie: e.target.value})} />
                    </div>

                    <div className="col-md-6">
                        <label className="form-label fw-semibold">Capacitate Maximă</label>
                        <input type="number" className="form-control"
                               onChange={e => setActivitate({...activitate, capacitateMaxima: e.target.value})} />
                    </div>

                    <div className="col-12 mt-4">
                        <button type="submit" className="btn btn-primary w-100 p-2 shadow-sm">
                            Salvează Activitatea
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ActivityForm;