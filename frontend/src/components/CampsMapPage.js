import React, { useState, useEffect } from 'react';
import {Link, useNavigate} from 'react-router-dom';
import axios from 'axios';
import InteractiveMap from './InteractiveMap';
///logica hartii

const CampsMapPage = () => {
    const [tabere, setTabere] = useState([]);
    const [filtruLocatie, setFiltruLocatie] = useState(null);

     const [searchTerm, setSearchTerm]= useState("");
    // preluare date din endpoint ul : /map/locatii
    useEffect(() => {
        axios.get('http://localhost:8080/map/locatii', { withCredentials: true })
            .then(res => {
                // verificare daca datele vin bine
                console.log("Date primite de la server:", res.data);
                // Ne asigurăm că setăm un array, chiar dacă res.data e gol
                setTabere(Array.isArray(res.data) ? res.data : []);
            })
            .catch(err => console.error("Eroare la incarcarea hartii:", err));
    }, []);


    // filtrare bazata pe click ul de pe harta
    // folosim Array.isArray pentru a preveni erorile daca serverul trimite date gresite
    const tabereDeFiltrat = Array.isArray(tabere) ? tabere : [];

      ///contine taberele care se potrivesc cautarii
      //aceasta lista va fi trimisa hartii pt ca pinii sa se ascunda live
     ///pinii dispar in functie de ce scriu la cautare
     ///PAs1: Filtrare baza de date in functie de ce se scrie in bara de cautare
           const filteredBySearch =tabereDeFiltrat.filter(camp=>
                     camp.locatie.toLowerCase().includes(searchTerm.toLowerCase())||
                     camp.nume.toLowerCase().includes(searchTerm.toLowerCase())
                     );


    // Filtrăm pentru lista de carduri de jos, combinand cautarea cu filtrul de pe harta
    //tine cont de casuta de cautare si de pinii apasati pe harta
    //Pas 2:din ce a aramas la pas 1
    const tabereFiltrateFinal = filtruLocatie
        ? filteredBySearch.filter(t => t.locatie === filtruLocatie)
        : filteredBySearch;

    return (
        <div className="container mt-4">
            <h2 className="text-center mb-4">🗺️ Harta Interactivă a Taberelor</h2>
            {/* Bara de Căutare */}
                       <div className="row mb-3 align-items-center">
                           <div className="col-md-9">
                               <div className="input-group shadow-sm">
                                   <span className="input-group-text bg-white border-end-0">🔍</span>
                                    <input
                                    type="text"
                                    className="form-control border-start-0 ps-0"
                                    placeholder="Caută după nume sau oraș (ex: Brasov, IUCOSOFT)..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                </div>
                            </div>
                            {searchTerm && (
                                <small className="text-muted ms-2">
                                    Rezultate găsite: {filteredBySearch.length}
                                </small>
                            )}

                        </div>


            <div className="card shadow mb-4">
                <div className="card-body p-0">
                    {/* Trimitem taberele catre componenta harta */}
                    {/* Trimitem filteredBySearch hărții ca pinii să se filtreze în timp ce scrii */}
                      <InteractiveMap
                         camps={filteredBySearch}
                         onLocationSelect={(oras) => setFiltruLocatie(oras)}
                    />
                </div>
                <div className="card-footer d-flex justify-content-between">
                    <span>
                        {filtruLocatie ? (
                            <>Locație selectată: <strong>{filtruLocatie}</strong></>
                        ) : (
                            "Sugestie: Click pe un pin pentru a izola taberele dintr-un oraș."
                        )}
                    </span>
                    {filtruLocatie && (
                        <button className="btn btn-sm btn-link text-danger" onClick={() => setFiltruLocatie(null)}>
                            Anulează filtrul hărții
                        </button>
                    )}
                </div>
            </div>

            {/* Listă simplă cu taberele rezultate din filtrare */}
            <div className="row">
                {tabereFiltrateFinal.length > 0 ? (
                    tabereFiltrateFinal.map(t => (
                        <div key={t.id} className="col-md-6 col-lg-4 mb-3">
                            <div className="card h-100 shadow-sm border-0 border-start border-4 border-primary">
                                <div className="card-body">
                                    <h5 className="fw-bold">{t.nume}</h5>
                                    <p className="text-muted mb-1">📍 {t.locatie}</p>
                                    <div className="badge bg-info text-dark">
                                        {t.trasee ? t.trasee.length : 0} Trasee disponibile
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center">
                        <p className="text-muted">Nu sunt tabere de afișat pentru această selecție.</p>
                        <button className="btn btn-sm btn-link" onClick={() => {setSearchTerm(""); setFiltruLocatie(null);}}>
                                Resetează toate filtrele
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CampsMapPage;