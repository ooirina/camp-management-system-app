import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const TrailList = () => {
    const [trasee, setTrasee] = useState([]);
    const [tabere, setTabere] = useState([]);
    const [tabaraSelectata, setTabaraSelectata] = useState('');
    const navigate = useNavigate();

    const userRole = localStorage.getItem('userRole');
    const esteAdmin = userRole === '1';
    const estePrincipal = localStorage.getItem('esteCoordonatorPrincipal') === 'true';
    const tabaraActivaId = localStorage.getItem('tabaraActivaId');
    const tabaraActivaNume = localStorage.getItem('tabaraActivaNume');

    // Pentru coordonator, tabăra de referință e cea activă din profil; pentru admin, cea aleasă din dropdown
    const idTabaraDeFolosit = esteAdmin ? tabaraSelectata : tabaraActivaId;

    // Poate edita/șterge dacă e admin, sau coordonator principal al tabării active
    const poateGestiona = esteAdmin || estePrincipal;

    useEffect(() => {
        if (esteAdmin) {
            // Admin: aducem toate taberele, ca să poată alege din dropdown
            axios.get('http://localhost:8080/tabere/lista')
                .then(res => setTabere(res.data));
        } else {
            fetchTrasee();
        }
    }, []);

    // Pentru admin: la schimbarea selecției din dropdown, reîncărcăm traseele
    useEffect(() => {
        if (esteAdmin && tabaraSelectata) {
            fetchTrasee();
        }
    }, [tabaraSelectata]);

    const fetchTrasee = async () => {
        try {
            if (!idTabaraDeFolosit) {
                setTrasee([]);
                return;
            }
            const response = await axios.get(`http://localhost:8080/trasee/lista/tabara/${idTabaraDeFolosit}`);
            setTrasee(response.data);
        } catch (error) {
            console.error("Eroare la aducerea traseelor:", error);
        }
    };

    const stergeTraseu = async (id) => {
        if (window.confirm("Ești sigur că vrei să ștergi acest traseu? Acțiunea este ireversibilă.")) {
            try {
                await axios.delete(`http://localhost:8080/trasee/${id}`);
                fetchTrasee();
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    alert(error.response.data);
                } else {
                    alert("A apărut o eroare la ștergere. Încearcă din nou.");
                }
            }
        }
    };

    if (!esteAdmin && !tabaraActivaId) {
        return (
            <div className="container mt-5 text-center">
                <p className="text-muted">
                    Selectează o tabără activă din profilul tău, ca să vezi traseele acesteia.
                </p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-0">🥾 Trasee</h2>
                    {esteAdmin ? (
                        <select
                            className="form-select form-select-sm mt-2"
                            style={{ maxWidth: '280px' }}
                            value={tabaraSelectata}
                            onChange={e => setTabaraSelectata(e.target.value)}
                        >
                            <option value="">-- Selectează o tabără --</option>
                            {tabere.map(t => <option key={t.id} value={t.id}>{t.nume}</option>)}
                        </select>
                    ) : (
                        <p className="text-muted small mt-1">
                            Traseele taberei active: <strong>{tabaraActivaNume || tabaraActivaId}</strong>
                        </p>
                    )}
                </div>
                {poateGestiona && (
                    <button
                        className="btn btn-primary shadow-sm"
                        onClick={() => navigate('/admin/adauga-traseu')}
                    >
                        <i className="bi bi-plus-circle me-2"></i> Adaugă Traseu
                    </button>
                )}
            </div>

            {trasee.length === 0 ? (
                <div className="text-center text-muted py-5">
                    Nu există trasee adăugate pentru această tabără.
                </div>
            ) : (
                <div className="row g-4">
                    {trasee.map((t) => (
                        <div className="col-md-6 col-lg-4" key={t.id}>
                            <div className="card h-100 shadow-sm border-0 rounded-3">
                                <div className="card-body">
                                    <h5 className="fw-bold text-primary">{t.nume}</h5>
                                    <p className="text-muted small mb-2">{t.descriere}</p>
                                    <div className="d-flex gap-2 mb-2">
                                        <span className="badge bg-secondary">{t.dificultate}</span>
                                        <span className="badge bg-info text-dark">{t.distantaKm} km</span>
                                        <span className="badge bg-light text-dark border">{t.durataOre} ore</span>
                                    </div>

                                    {poateGestiona && (
                                        <div className="d-flex gap-2 mt-3">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => navigate(`/admin/editeaza-traseu/${t.id}`)}
                                            >
                                                <i className="bi bi-pencil"></i> Editează
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => stergeTraseu(t.id)}
                                            >
                                                <i className="bi bi-trash"></i> Șterge
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrailList;