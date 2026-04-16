import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CampDetails() {
    const { id } = useParams();
    const [tabara, setTabara] = useState(null);
    const [activitati, setActivitati]= useState([]);///salvare lista care o trimite Java
    const navigate = useNavigate();
    const handleInscriere=()=>{
    //ca sa apara numele taberei automat in formularul de inscriere se adauga nume si ID in URL
    navigate(`add-registration?tabaraId=${id}&numeTabara=${tabara.nume}`);

    }
    useEffect(() => {
    //luare datele taberei
        axios.get(`http://localhost:8080/tabere/${id}`)
            .then(res => setTabara(res.data))
            .catch(err => console.error(err));
    ///luare itinerariul taberei
        axios.get(`http://localhost:8080/activitati/tabara/${id}`)
             .then(res => setActivitati(res.data))
             .catch(err => console.error("Eroare la activitati",err));
    }, [id]);

    if (!tabara) return <div className="text-center mt-5">Se încarcă...</div>;

    return (
        <div className="container mt-5">
            <div className="row shadow-lg p-3 mb-5 bg-white rounded">
                <div className="col-md-7">
                    <img src={tabara.imagine || 'https://via.placeholder.com/600x400'} className="img-fluid rounded" alt={tabara.nume} />
                    <h2 className="mt-4">{tabara.nume}</h2>
                    <p className="text-muted"><strong>Locație:</strong> {tabara.locatie}</p>
                    <hr />
                    <h5>Descriere</h5>
                    <p>{tabara.descriere || 'O tabără de neuitat plină de aventuri.'}</p>
                </div>

                <div className="col-md-5">
                    <div className="p-4 border rounded bg-light">
                        <h3 className="text-danger">{tabara.pret} RON</h3>
                        <p className="text-success">Disponibil acum</p>
                        <div className="mb-3">
                            <label className="form-label">Data: {tabara.data_inceput}</label>
                        </div>
                        <button
                            className="btn btn-primary w-100 p-3 fs-5"
                            onClick={() => navigate(`/add-registration?tabaraId=${id}&numeTabara=${tabara.nume}`)}
                        >
                            Înscrie-te acum
                        </button>
                    </div>
                </div>
            </div>

            {/* ITINERARIUL*/}

            <div className="row mt-4 mb-5">
                            <div className="col-12">
                                <h3 className="mb-4">🗓️ Programul și activitățile taberei</h3>
                                <div className="itinerariu-wrapper" style={{ borderLeft: "4px solid #007bff", paddingLeft: "20px" }}>
                                    {activitati.length > 0 ? (
                                        activitati.map((act, index) => (
                                            <div key={act.id} className="mb-4 position-relative">
                                                {/* Bulina de pe timeline */}
                                                <div style={{
                                                    position: "absolute",
                                                    left: "-31px",
                                                    top: "5px",
                                                    width: "18px",
                                                    height: "18px",
                                                    backgroundColor: "#007bff",
                                                    borderRadius: "50%",
                                                    border: "3px solid white"
                                                }}></div>

                                                <div className="card border-0 shadow-sm">
                                                    <div className="card-body">
                                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                                            <h5 className="card-title mb-0 text-primary">{act.nume}</h5>
                                                            <span className="badge bg-primary text-white">
                                                                {act.data} | {act.oraInceput} - {act.oraSfarsit}
                                                            </span>
                                                        </div>
                                                        <p className="card-text text-secondary">{act.descriere}</p>
                                                        <div className="text-muted" style={{ fontSize: "0.9rem" }}>
                                                            <strong>📍 Locație:</strong> {act.locatie}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="alert alert-light border shadow-sm">
                                            Programul activităților va fi afișat în curând.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

        </div>
    );
}

export default CampDetails;