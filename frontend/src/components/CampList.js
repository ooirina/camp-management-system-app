import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CampList() {
    const [tabere, setTabere] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:8080/tabere/lista') // Ajustează URL-ul tău
            .then(res => setTabere(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">Tabere Disponibile</h2>
            <div className="row">
                {tabere.map(tabara => (
                    <div className="col-md-4 mb-4" key={tabara.id}>
                        <div className="card h-100 shadow-sm">
                            <img src={tabara.imagine || 'https://via.placeholder.com/300x200'} className="card-img-top" alt={tabara.nume} />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{tabara.nume}</h5>
                                <p className="card-text text-muted">{tabara.locatie}</p>
                                <h6 className="text-primary">{tabara.pret} RON</h6>
                                <button
                                    className="btn btn-outline-brown mt-auto"
                                    style={{backgroundColor: '#8B4513', color: 'white'}}
                                    onClick={() => navigate(`/camp-details/${tabara.id}`)}
                                >
                                    Vezi detalii
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CampList;