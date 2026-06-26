import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function CampDetails() {
    const { id } = useParams();
    const [tabara, setTabara] = useState(null);
    const [activitati, setActivitati]= useState([]);///salvare lista care o trimite Java
    const [locuriDisponibile, setLocuriDisponibile]= useState(null);
    const navigate = useNavigate();

    const handleInscriere=()=>{
    //ca sa apara numele taberei automat in formularul de inscriere se adauga nume si ID in URL
    navigate(`add-registration?tabaraId=${id}&numeTabara=${tabara.nume}`);

    }
    useEffect(() => {
    //luare datele taberei
        axios.get(`http://localhost:8080/tabere/${id}`)
            .then(res =>
            setTabara(res.data))
            .catch(err => console.error(err));
    ///luare itinerariul taberei
        axios.get(`http://localhost:8080/activitati/tabara/${id}`)
             .then(res => setActivitati(res.data))
             .catch(err => console.error("Eroare la activitati",err));

        axios.get(`http://localhost:8080/inscrieri/locuri-disponibile/${id}`)
              .then(res => setLocuriDisponibile(res.data))
              .catch(err => console.error("Eroare la calcul locuri", err));
   }, [id]);

    if (!tabara) return (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6b7280' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🏕️</div>
            <p style={{ fontWeight: '600' }}>Se încarcă...</p>
        </div>
    );

    return (
       <div>

               {/* ===== HERO CU POZA TABEREI ===== */}
               <div style={{
                   background: `linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #388e3c 100%)`,
                   padding: '48px 20px 80px',
                   textAlign: 'center'
               }}>
                   <p style={{ color: '#a5d6a7', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                       🏕️ CampCore — Detalii tabără
                   </p>
                   <h1 style={{ color: '#fff', fontSize: '2.4rem', fontWeight: '800', marginBottom: '8px' }}>{tabara.nume}</h1>
                   <p style={{ color: '#c8e6c9', fontSize: '1rem' }}>📍 {tabara.locatie}</p>
               </div>

               <div className="container" style={{ marginTop: '-40px', paddingBottom: '60px' }}>

                   {/* ===== CARD PRINCIPAL ===== */}
                   <div style={{
                       background: '#fff',
                       borderRadius: '16px',
                       boxShadow: '0 8px 32px rgba(46,125,50,0.12)',
                       overflow: 'hidden',
                       marginBottom: '32px'
                   }}>
                       <div className="row g-0">

                           {/* STANGA — Poza + descriere */}
                           <div className="col-md-7" style={{ padding: '32px' }}>
                               <img
                                   src={`/images/tabara_${tabara.id}.jpg`}
                                   onError={(e) => { e.target.src = '/images/default.jpg'; }}
                                   alt={tabara.nume}
                                   style={{ width: '100%', height: '260px', objectFit: 'cover', borderRadius: '12px', marginBottom: '24px' }}
                               />
                               <h2 style={{ fontWeight: '800', color: '#1b5e20', marginBottom: '6px' }}>{tabara.nume}</h2>
                               <p style={{ color: '#6b7280', marginBottom: '16px' }}>📍 {tabara.locatie}</p>

                               {/* Categorii si tip */}
                               <div style={{ marginBottom: '20px' }}>
                                   {tabara.tipPublic && (
                                       <span style={{ background: '#e3f2fd', color: '#1565c0', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', marginRight: '6px' }}>
                                           {tabara.tipPublic}
                                       </span>
                                   )}
                                   {tabara.categorii && tabara.categorii.map(cat => (
                                       <span key={cat.id} style={{ background: '#f1f8e9', color: '#2e7d32', fontSize: '0.75rem', fontWeight: '700', padding: '4px 10px', borderRadius: '6px', marginRight: '6px' }}>
                                           {cat.tip}
                                       </span>
                                   ))}
                               </div>

                               <hr style={{ borderColor: '#e8f5e9' }} />
                              <h5 style={{ fontWeight: '700', color: '#1b5e20', marginBottom: '12px' }}>Detalii tabără</h5>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <p style={{ color: '#4b5563', margin: 0 }}>
                                      📅 <strong>Perioadă:</strong> {tabara.dataInceput} — {tabara.dataSfarsit}
                                  </p>
                                  <p style={{ color: '#4b5563', margin: 0 }}>
                                      👶 <strong>Vârstă:</strong> {tabara.varstaMin} — {tabara.varstaMax} ani
                                  </p>
                                  <p style={{ color: '#4b5563', margin: 0 }}>
                                      👥 <strong>Capacitate:</strong> {tabara.capacitate} locuri
                                  </p>
                                  <p style={{ color: '#4b5563', margin: 0 }}>
                                      🏷️ <strong>Tip:</strong> {tabara.tipPublic}
                                  </p>
                              </div>
                           </div>

                           {/* DREAPTA — Pret + inscriere */}
                           <div className="col-md-5" style={{ background: '#f9fbe7', padding: '32px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                               <div style={{ background: '#fff', borderRadius: '14px', padding: '28px', boxShadow: '0 2px 12px rgba(46,125,50,0.08)', border: '1px solid #e8f5e9' }}>

                                   <p style={{ color: '#6b7280', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Preț per participant</p>
                                   <h2 style={{ color: '#2e7d32', fontWeight: '800', fontSize: '2rem', marginBottom: '20px' }}>{tabara.pret} RON</h2>

                                   {/*afisare a disponibilitatii*/}
                                   {localStorage.getItem('userRole') === '5' && (
                                       locuriDisponibile > 0 ? (
                                           <>
                                               <div style={{ background: '#e8f5e9', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px' }}>
                                                   <p style={{ color: '#2e7d32', fontWeight: '700', margin: 0, fontSize: '0.9rem' }}>
                                                       ✅ Disponibil — {locuriDisponibile} locuri rămase
                                                   </p>
                                               </div>
                                               <div style={{ marginBottom: '16px' }}>
                                                   <label style={{ color: '#6b7280', fontSize: '0.82rem' }}>📅 Data start: <strong style={{ color: '#1b5e20' }}>{tabara.dataInceput}</strong></label>
                                               </div>
                                               <button
                                                   style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', width: '100%', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}
                                                   onClick={() => navigate(`/add-registration?tabaraId=${id}&numeTabara=${tabara.nume}`)}>
                                                   Înscrie-te acum
                                               </button>
                                           </>
                                       ) : (
                                           <>
                                               {/* LOGICA PENTRU WAITLIST! */}
                                               <div style={{ background: '#fff8e1', borderRadius: '8px', padding: '10px 14px', marginBottom: '12px' }}>
                                                   <p style={{ color: '#f57f17', fontWeight: '700', margin: 0, fontSize: '0.9rem' }}>
                                                       ⏳ Sold Out — Poți intra pe Waitlist
                                                   </p>
                                               </div>
                                               <p style={{ color: '#9ca3af', fontSize: '0.82rem', marginBottom: '16px' }}>
                                                   Tabăra este plină, dar poți rezerva un loc în lista de așteptare. Dacă cineva renunță, te contactăm!
                                               </p>
                                               <div style={{ marginBottom: '16px' }}>
                                                   <label style={{ color: '#6b7280', fontSize: '0.82rem' }}>📅 Data start: <strong style={{ color: '#1b5e20' }}>{tabara.dataInceput}</strong></label>
                                               </div>
                                               <button
                                                   style={{ background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', width: '100%', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}
                                                   onClick={() => navigate(`/add-registration?tabaraId=${id}&numeTabara=${tabara.nume}`)}>
                                                   Rezervă loc pe Waitlist
                                               </button>
                                           </>
                                       )
                                   )}
                               </div>
                           </div>
                       </div>
                   </div>

                   {/* ===== ITINERARIUL ===== */}
                   <div style={{ marginBottom: '48px' }}>
                       <h3 style={{ fontWeight: '800', color: '#1b5e20', marginBottom: '24px' }}>
                           🗓️ Programul și activitățile taberei
                       </h3>
                       <div style={{ borderLeft: '4px solid #2e7d32', paddingLeft: '24px' }}>
                           {activitati.length > 0 ? (
                               activitati.map((act) => (
                                   <div key={act.id} className="mb-4 position-relative">
                                       {/* Bulina de pe timeline */}
                                       <div style={{
                                           position: 'absolute',
                                           left: '-33px',
                                           top: '16px',
                                           width: '18px',
                                           height: '18px',
                                           backgroundColor: '#2e7d32',
                                           borderRadius: '50%',
                                           border: '3px solid white',
                                           boxShadow: '0 0 0 2px #2e7d32'
                                       }}></div>

                                       <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 2px 10px rgba(46,125,50,0.08)', border: '1px solid #e8f5e9', padding: '20px' }}>
                                           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                               <h5 style={{ margin: 0, fontWeight: '700', color: '#1b5e20' }}>{act.nume}</h5>
                                               <span style={{ background: '#e8f5e9', color: '#2e7d32', fontSize: '0.78rem', fontWeight: '700', padding: '4px 12px', borderRadius: '99px' }}>
                                                   {act.data} | {act.oraInceput} - {act.oraSfarsit}
                                               </span>
                                           </div>
                                           <p style={{ color: '#6b7280', margin: '0 0 8px', lineHeight: '1.6' }}>{act.descriere}</p>
                                           <p style={{ color: '#9ca3af', fontSize: '0.85rem', margin: 0 }}>
                                               📍 Locație: {act.locatie}
                                           </p>
                                       </div>
                                   </div>
                               ))
                           ) : (
                               <div style={{ background: '#f9fbe7', border: '1px solid #e8f5e9', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#6b7280' }}>
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