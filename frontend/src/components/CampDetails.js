import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function CampDetails() {
    const { id } = useParams();
    const [tabara, setTabara] = useState(null);
    const navigate = useNavigate();
    const handleInscriere=()=>{
    //ca sa apara numele taberei automat in formularul de inscriere se adauga nume si ID in URL
    navigate(`add-registration?tabaraId=${id}&numeTabara=${tabara.nume}`);

    }
    useEffect(() => {
        axios.get(`http://localhost:8080/tabere/${id}`)
            .then(res => setTabara(res.data))
            .catch(err => console.error(err));
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
        </div>
    );
}

export default CampDetails;