import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CampList() {
    const [tabere, setTabere] = useState([]);
    const [listaCategorii, setListaCategorii] = useState([]);
    const navigate = useNavigate();

    const [filtre, setFiltrare]=useState({
       categorie:'',
       tipPublic:'',
       locatie:'',
       pretMax:''

    });

    useEffect(() => {
        axios.get('http://localhost:8080/tabere/lista') // Ajustează URL-ul tău
            .then(res => setTabere(res.data))
            .catch(err => console.error(err));

        // Aducem lista completă de categorii pentru filtru
        axios.get('http://localhost:8080/categorii')
              .then(res => setListaCategorii(res.data))
              .catch(err => console.error("Eroare la aducerea categoriilor:", err));
    }, []);


   const handleFilterChange=(e)=>{
        setFiltrare({... filtre, [e.target.name]:e.target.value});

   };

   //logica de filtrare
   const tabereFiltrate=tabere.filter(tabara =>{
      const matchLocatie = tabara.locatie.toLowerCase().includes(filtre.locatie.toLowerCase());
      const matchPret = filtre.pretMax ? tabara.pret <= parseFloat(filtre.pretMax) : true;
      const matchTipPublic = filtre.tipPublic ? tabara.tipPublic === filtre.tipPublic : true;
   // Verificăm dacă tabăra are în lista ei de categorii categoria selectată
      const matchCategorie = filtre.categorie ? tabara.categorii?.some(c => c.tip === filtre.categorie) : true;
       return matchLocatie && matchPret && matchTipPublic && matchCategorie;

   });
    return (
        <div className="container mt-4">

            {/* BARA DE FILTRARE */}
                <div className="card p-3 mb-4 shadow-sm bg-light">
                    <div className="row g-3">
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Locație</label>
                            <input type="text" className="form-control" name="locatie" placeholder="Ex: Sinaia" value={filtre.locatie} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Buget Maxim (RON)</label>
                            <input type="number" className="form-control" name="pretMax" placeholder="Ex: 2000" value={filtre.pretMax} onChange={handleFilterChange} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Tip Public</label>
                            <select className="form-select" name="tipPublic" value={filtre.tipPublic} onChange={handleFilterChange}>
                                <option value="">Toate</option>
                                <option value="COPII">Copii</option>
                                <option value="ADULTI">Adulți</option>
                                <option value="FAMILIE">Familie</option>
                                <option value="MIXTA">Mixtă</option>
                                <option value="STUDENTI">Studenți</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Categorie Tabără</label>
                             <select className="form-select" name="categorie" value={filtre.categorie} onChange={handleFilterChange}>
                               <option value="">Toate</option>
                                  {listaCategorii.map(cat => (
                                       <option key={cat.id} value={cat.tip}>
                                           {cat.tip}
                                       </option>
                                   ))}
                            </select>
                        </div>
                    </div>
                </div>
            <h2 className="text-center mb-4">Tabere Disponibile</h2>
            <div className="row">
                {tabereFiltrate.map(tabara => (
                    <div className="col-md-4 mb-4" key={tabara.id}>
                        <div className="card h-100 shadow-sm">
                            <img src={tabara.imagine || 'https://via.placeholder.com/300x200'} className="card-img-top" alt={tabara.nume} />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{tabara.nume}</h5>
                                <p className="card-text text-muted">{tabara.locatie}</p>
                                <div className="mb-3">
                                  {/* Eticheta pentru Tip Public (Ex: COPII) */}
                                      <span className="badge bg-info text-dark me-1 mb-1">
                                        {tabara.tipPublic}</span>
                                          {/* Etichetele pentru categoriile taberei (Ex: IT, AVENTURA) */}
                                            {tabara.categorii && tabara.categorii.map(cat => (
                                                 <span key={cat.id} className="badge bg-secondary me-1 mb-1"> {cat.tip} </span> ))}
                                </div>
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