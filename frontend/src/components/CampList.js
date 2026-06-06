import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CampList() {
    const [tabere, setTabere] = useState([]);
    const [listaCategorii, setListaCategorii] = useState([]);
    const navigate = useNavigate();

    //de comparat maxim 3
    const [tabereDeComparat, setTabereDeComparat] = useState([]);

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

    //Logia pentru selectare/deselectare tabere pentru comparare
    const toggleComparare = (tabara)=>{
       setTabereDeComparat(prev => {
            //daca tabara e deja selectata
            if(prev.find(t => t.id === tabara.id)){
                return prev.filter(t=> t.id !==tabara.id);
            }
            // Daca avem deja 3 tabere, oprim adaugarea
            if(prev.length >= 3){
               alert("Poți compara maxim 3 tabere simultan!");
               return prev;
            }
            return [...prev, tabara];
       });

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

      {/* BARA PENTRU COMPARARE (apare doar daca am selectat o tabara)  */}
      {tabereDeComparat.length > 0 && (
       <div className="position-fixed bottom-0 end-0 m-4 shadow-lg" style={{ zIndex: 1050, width: '300px' }}>
         <div className="card border-primary border-2" style={{ borderRadius: '12px' }}>
           <div className="card-header bg-primary text-white py-2 d-flex justify-content-between align-items-center" style={{ borderRadius: '10px 10px 0 0' }}>
             <h6 className="mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>
                 ⚖️ Comparare ({tabereDeComparat.length}/3)
                  </h6>
                        <button type="button"  className="btn-close btn-close-white" style={{ fontSize: '0.6rem' }} onClick={() => setTabereDeComparat([])} title="Golește tot">
                        </button>
                    </div>


                    <div className="card-body p-2 d-flex flex-column gap-2 bg-light">
                         <div className="d-flex flex-column gap-1">
                            {tabereDeComparat.map(t => (
                                <div key={t.id} className="badge bg-white text-dark border p-2 d-flex justify-content-between align-items-center w-100 shadow-sm">
                                    <span className="text-truncate text-start" style={{ maxWidth: '220px', fontSize: '0.85rem' }}>
                                        {t.nume}
                                    </span>
                                    <span
                                        className="text-danger fw-bold ms-2"
                                        style={{ cursor: 'pointer', fontSize: '1rem', lineHeight: '1' }}
                                        onClick={() => toggleComparare(t)}
                                        title="Scoate din listă"
                                    >
                                        &times;
                                    </span>
                                </div>
                            ))}
                        </div>


                        <button  className={`btn btn-sm fw-bold w-100 mt-1 ${tabereDeComparat.length < 2 ? 'btn-secondary' : 'btn-primary'}`}
                            disabled={tabereDeComparat.length < 2} onClick={() => {  localStorage.setItem('tabereComparare', JSON.stringify(tabereDeComparat));
                                navigate('/comparare'); }}>
                            {tabereDeComparat.length < 2 ? 'Mai alege o tabără...' : 'Compară Acum ➡️'}
                        </button>
                    </div>
                </div>
            </div>
        )}

            <h2 className="text-center mb-4">Tabere Disponibile</h2>
            <div className="row">
                {tabereFiltrate.map(tabara => {
                   //verifica daca tabara curenta e selectata
                   const esteSelectata = tabereDeComparat.some(t=> t.id === tabara.id);

                    return(
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
                                <button className={`btn w-100 ${esteSelectata ? 'btn-danger' : 'btn-outline-primary'}`} onClick={() => toggleComparare(tabara)} >
                                         {esteSelectata ? '❌ Scoate din comparare' : '⚖️ Compară'}
                                 </button>
                            </div>
                        </div>
                    </div>
                );
                })}
            </div>

            {tabereFiltrate.length === 0 && (
                 <div className="text-center mt-5 text-muted">
                   <h5>Nu am găsit tabere care să corespundă filtrelor tale.</h5>
                    </div>
                  )}
        </div>
    );
}

export default CampList;