import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function CampList() {
    const [tabere, setTabere] = useState([]);
    const [listaCategorii, setListaCategorii] = useState([]);
    const navigate = useNavigate();

    //de comparat maxim 3 — citit din localStorage, ca selecția să rămână și după ce te întorci de pe pagina de comparare
    const [tabereDeComparat, setTabereDeComparat] = useState(() => {
        const salvat = localStorage.getItem('tabereComparare');
        return salvat ? JSON.parse(salvat) : [];
    });

    // Sincronizare automată cu localStorage la orice modificare a selecției (adăugare, scoatere, golire)
    useEffect(() => {
        localStorage.setItem('tabereComparare', JSON.stringify(tabereDeComparat));
    }, [tabereDeComparat]);

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
         <div>

                {/* HERO */}
                <div style={{
                    background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 50%, #388e3c 100%)',
                    padding: '80px 20px 60px',
                    textAlign: 'center',
                    marginBottom: '0'
                }}>
                    <p style={{ color: '#a5d6a7', fontSize: '0.85rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '12px' }}>
                        🏕️ CampCore — Platforma ta de tabere
                    </p>
                    <h1 style={{ color: '#fff', fontSize: '2.8rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '16px' }}>
                        Descoperă tabăra<br />perfectă pentru tine
                    </h1>
                    <p style={{ color: '#c8e6c9', fontSize: '1.05rem', maxWidth: '520px', margin: '0 auto 32px' }}>
                        Filtrează după locație, buget și categorie și găsește experiența potrivită.
                    </p>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 28px', color: '#fff' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{tabere.length}</div>
                            <div style={{ fontSize: '0.78rem', color: '#c8e6c9' }}>Tabere disponibile</div>
                        </div>
                        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: '10px', padding: '14px 28px', color: '#fff' }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{tabereFiltrate.length}</div>
                            <div style={{ fontSize: '0.78rem', color: '#c8e6c9' }}>Rezultate filtrate</div>
                        </div>
                    </div>
                </div>

                <div className="container" style={{ marginTop: '-1px' }}>

                    {/* BARA DE FILTRARE */}
                    <div style={{
                        background: '#fff',
                        borderRadius: '16px',
                        padding: '24px',
                        marginTop: '-32px',
                        marginBottom: '36px',
                        boxShadow: '0 8px 32px rgba(46,125,50,0.12)',
                        border: '1px solid #e8f5e9'
                    }}>
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="form-label fw-bold" style={{ color: '#2e7d32', fontSize: '0.82rem', letterSpacing: '0.04em' }}>📍 Locație</label>
                                <input type="text" className="form-control" name="locatie" placeholder="Ex: Sinaia" value={filtre.locatie} onChange={handleFilterChange}
                                    style={{ borderColor: '#c8e6c9', borderRadius: '8px' }} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold" style={{ color: '#2e7d32', fontSize: '0.82rem', letterSpacing: '0.04em' }}>💰 Buget Maxim (RON)</label>
                                <input type="number" className="form-control" name="pretMax" placeholder="Ex: 2000" value={filtre.pretMax} onChange={handleFilterChange}
                                    style={{ borderColor: '#c8e6c9', borderRadius: '8px' }} />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold" style={{ color: '#2e7d32', fontSize: '0.82rem', letterSpacing: '0.04em' }}>👥 Tip Public</label>
                                <select className="form-select" name="tipPublic" value={filtre.tipPublic} onChange={handleFilterChange}
                                    style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}>
                                    <option value="">Toate</option>
                                    <option value="COPII">Copii</option>
                                    <option value="ADULTI">Adulți</option>
                                    <option value="FAMILIE">Familie</option>
                                    <option value="MIXTA">Mixtă</option>
                                    <option value="STUDENTI">Studenți</option>
                                </select>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label fw-bold" style={{ color: '#2e7d32', fontSize: '0.82rem', letterSpacing: '0.04em' }}>🏷️ Categorie Tabără</label>
                                <select className="form-select" name="categorie" value={filtre.categorie} onChange={handleFilterChange}
                                    style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}>
                                    <option value="">Toate</option>
                                    {listaCategorii.map(cat => (
                                        <option key={cat.id} value={cat.tip}>{cat.tip}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* WIDGET COMPARARE */}
                    {tabereDeComparat.length > 0 && (
                        <div className="position-fixed bottom-0 end-0 m-4 shadow-lg" style={{ zIndex: 1050, width: '300px' }}>
                            <div style={{ background: '#fff', borderRadius: '14px', border: '2px solid #2e7d32', overflow: 'hidden' }}>
                                <div style={{ background: '#2e7d32', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h6 className="mb-0 fw-bold" style={{ fontSize: '0.9rem', color: '#fff' }}>
                                        ⚖️ Comparare ({tabereDeComparat.length}/3)
                                    </h6>
                                    <button type="button" className="btn-close btn-close-white" style={{ fontSize: '0.6rem' }} onClick={() => setTabereDeComparat([])} title="Golește tot" />
                                </div>
                                <div style={{ padding: '10px', background: '#f1f8e9', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                    {tabereDeComparat.map(t => (
                                        <div key={t.id} style={{ background: '#fff', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '6px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.85rem', color: '#1b5e20', fontWeight: '600', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {t.nume}
                                            </span>
                                            <span style={{ color: '#c62828', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', marginLeft: '8px' }}
                                                onClick={() => toggleComparare(t)} title="Scoate din listă">
                                                &times;
                                            </span>
                                        </div>
                                    ))}
                                    <button
                                        style={{
                                            width: '100%', padding: '9px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '0.85rem', marginTop: '4px', cursor: tabereDeComparat.length < 2 ? 'not-allowed' : 'pointer',
                                            background: tabereDeComparat.length < 2 ? '#e0e0e0' : '#2e7d32',
                                            color: tabereDeComparat.length < 2 ? '#9e9e9e' : '#fff'
                                        }}
                                        disabled={tabereDeComparat.length < 2}
                                        onClick={() => { localStorage.setItem('tabereComparare', JSON.stringify(tabereDeComparat)); navigate('/comparare'); }}>
                                        {tabereDeComparat.length < 2 ? 'Mai alege o tabără...' : 'Compară Acum ➡️'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TITLU SECTIUNE CARDURI */}
                    <h4 style={{ fontWeight: '700', color: '#1b5e20', marginBottom: '20px' }}>
                        Tabere Disponibile
                        <span style={{ marginLeft: '10px', background: '#e8f5e9', color: '#2e7d32', fontSize: '0.75rem', padding: '4px 10px', borderRadius: '99px', fontWeight: '600' }}>
                            {tabereFiltrate.length} rezultate
                        </span>
                    </h4>

                    {/* CARDURI TABERE*/}
                    <div className="row">
                        {tabereFiltrate.map(tabara => {
                            //verifica daca tabara curenta e selectata
                            const esteSelectata = tabereDeComparat.some(t => t.id === tabara.id);

                            return (
                                <div className="col-md-4 mb-4" key={tabara.id}>
                                    <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 16px rgba(46,125,50,0.09)', border: '1px solid #e8f5e9', borderTop: '4px solid #2e7d32', height: '100%', display: 'flex', flexDirection: 'column' }}>
                                       <img
                                           src={`/images/tabara_${tabara.id}.jpg`}
                                           onError={(e) => { e.target.src = '/images/default.jpg'; }}
                                           style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                           alt={tabara.nume}
                                       />
                                         <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                            <h5 style={{ fontWeight: '700', color: '#1b5e20', marginBottom: '4px' }}>{tabara.nume}</h5>
                                            <p style={{ color: '#6b7280', fontSize: '0.88rem', marginBottom: '10px' }}>📍 {tabara.locatie}</p>
                                            <div style={{ marginBottom: '12px' }}>
                                                {/* Eticheta pentru Tip Public (Ex: COPII) */}
                                                <span style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', marginRight: '4px', marginBottom: '4px', display: 'inline-block' }}>
                                                    {tabara.tipPublic}
                                                </span>
                                                {/* Etichetele pentru categoriile taberei (Ex: IT, AVENTURA) */}
                                                {tabara.categorii && tabara.categorii.map(cat => (
                                                    <span key={cat.id} style={{ background: '#f1f8e9', color: '#2e7d32', fontSize: '0.72rem', fontWeight: '700', padding: '3px 8px', borderRadius: '6px', marginRight: '4px', marginBottom: '4px', display: 'inline-block' }}>
                                                        {cat.tip}
                                                    </span>
                                                ))}
                                            </div>
                                            <h6 style={{ color: '#2e7d32', fontWeight: '800', fontSize: '1.1rem', marginBottom: '14px' }}>{tabara.pret} RON</h6>
                                            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button
                                                    style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '9px', padding: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
                                                    onClick={() => navigate(`/camp-details/${tabara.id}`)}>
                                                    Vezi detalii
                                                </button>
                                                <button
                                                    style={{
                                                        background: esteSelectata ? '#ffebee' : 'transparent',
                                                        color: esteSelectata ? '#c62828' : '#2e7d32',
                                                        border: esteSelectata ? '1.5px solid #ef9a9a' : '1.5px solid #2e7d32',
                                                        borderRadius: '9px', padding: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.85rem'
                                                    }}
                                                    onClick={() => toggleComparare(tabara)}>
                                                    {esteSelectata ? '❌ Scoate din comparare' : '⚖️ Compară'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* DACA NU SE GASESTE NIMIC*/}
                    {tabereFiltrate.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🔍</div>
                            <h5 style={{ color: '#6b7280', fontWeight: '600' }}>Nu am găsit tabere care să corespundă filtrelor tale.</h5>
                            <p style={{ fontSize: '0.9rem' }}>Încearcă să modifici filtrele pentru mai multe rezultate.</p>
                        </div>
                    )}

                </div>
            </div>
        );
}

export default CampList;