import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const CoordinatorProfile = () => {
    const [activitati, setActivitati] = useState([]);
    const [loading, setLoading] = useState(true);

    // Luăm email-ul celui logat
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        if (!email) {
            setLoading(false);
            return;
        }

        // Apelare ruta pe care am creat-o în backend pentru a aduce doar activitățile lui
        axios.get(`http://localhost:8080/prezenta/activitati-coordonator?email=${email}`)
            .then(res => {
                setActivitati(res.data);
            })
            .catch(err => {
                console.error("Eroare la aducerea orarului:", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [email]);

    return (
        <div className="container mt-5 mb-5">
            {/* ZONA DE HEADER */}
            <div className="text-center mb-5">
                <h1 className="text-success fw-bold">🏕️ Panou Coordonator</h1>
                <p className="lead text-muted">
                    Bine ai venit, <strong>{email}</strong>! Acesta este orarul tău pentru taberele viitoare.
                </p>
            </div>

            {/* ZONA DE ORAR */}
            <div className="card shadow-sm border-primary">
                <div className="card-header bg-primary text-white py-3">
                    <h4 className="mb-0">📅 Orarul meu de Activități</h4>
                </div>
                <div className="card-body bg-light p-4">

                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Se încarcă...</span>
                            </div>
                            <p className="mt-2 text-muted">Încărcăm orarul...</p>
                        </div>
                    ) : activitati.length > 0 ? (

                        <div className="row g-4">
                            {activitati.map((act) => (
                                <div className="col-md-6 col-lg-4" key={act.id}>
                                    {/* CARD PENTRU FIECARE ACTIVITATE */}
                                    <div className="card h-100 border-0 shadow-sm rounded-3 hover-shadow transition">
                                        <div className="card-body">
                                            <h5 className="card-title text-primary fw-bold mb-3 border-bottom pb-2">
                                                🎯 {act.nume}
                                            </h5>
                                            <ul className="list-unstyled mb-0" style={{ lineHeight: '2' }}>
                                                <li>
                                                    <strong>🏕️ Tabăra:</strong> <span className="text-dark">{act.tabara ? act.tabara.nume : 'Nespecificat'}</span>
                                                </li>
                                                <li>
                                                    <strong>📅 Data:</strong> <span className="text-dark">{act.data || 'Nespecificat'}</span>
                                                </li>
                                                <li>
                                                    <strong>⏰ Ora:</strong> <span className="badge bg-info text-dark fs-6">{act.oraInceput} - {act.oraSfarsit}</span>
                                                </li>
                                                <li>
                                                    <strong>📍 Locație:</strong> <span className="text-dark">{act.locatie}</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="card-footer bg-white border-top-0 pt-0 pb-3">
                                            {/* Buton rapid care îl duce la pagina de prezență */}
                                            <Link to="/prezenta" className="btn btn-outline-success btn-sm w-100 fw-bold">
                                                📝 Deschide Catalog Prezență
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                    ) : (
                        <div className="text-center py-5">
                            <h5 className="text-danger">Nu ești asignat la nicio activitate momentan.</h5>
                            <p className="text-muted">Ia o pauză și bucură-te de timpul liber! ☕</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CoordinatorProfile;