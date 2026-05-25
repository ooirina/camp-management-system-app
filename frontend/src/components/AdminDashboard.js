import React from 'react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
    const navigate = useNavigate();
    const email = localStorage.getItem('userEmail');

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <h1 className="mb-4 text-danger">⚙️ Admin & Coordonator Hub</h1>
                    <p className="lead">Bine ai venit, <strong>{email}</strong>!</p>
                    <p className="text-muted">Aici ai acces la uneltele de gestiune ale taberei.</p>

                    <div className="row mt-5">
                        <div className="col-md-6 mb-3">
                            <div className="card shadow-sm h-100 border-danger">
                                <div className="card-body">
                                    <h4 className="card-title">📝 Catalog Prezență</h4>
                                    <p className="card-text">Bifează prezența participanților la activitățile tale.</p>
                                    <button
                                        className="btn btn-outline-danger w-100"
                                        onClick={() => navigate('/prezenta')}
                                    >
                                        Deschide Catalogul
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-6 mb-3">
                            <div className="card shadow-sm h-100 border-secondary opacity-50">
                                <div className="card-body">
                                    <h4 className="card-title">⛺ Gestiune Tabere</h4>
                                    <p className="card-text">Adaugă sau editează tabere și activități.</p>
                                    <button className="btn btn-secondary w-100" disabled>
                                        Doar pentru Admin General
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;