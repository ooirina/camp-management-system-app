import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const CoordinatorProfile = () => {
    const [activitati, setActivitati] = useState([]);
    const [waitlist, setWaitlist]=useState([]);
    const [allTabere, setAllTabere]= useState([]);//ca sa fie acces la numele taberei
    const [loading, setLoading] = useState(true);

    // Luăm email-ul celui logat
    const email = localStorage.getItem('userEmail');

    useEffect(() => {
        if (!email) {
            setLoading(false);
            return;
        }

         // Aducem toate taberele pentru a le putea afișa numele pe carduri
         axios.get('http://localhost:8080/tabere/lista')
         .then(resTabere => {
         const tabere = resTabere.data;
         setAllTabere(tabere);

        //Aducem activitățile coordonatorului: Apelare ruta pe care am creat-o în backend pentru a aduce doar activitățile lui
        axios.get(`http://localhost:8080/prezenta/activitati-coordonator?email=${email}`)
            .then(resActivitati => {
                                 const activitatiPermise = resActivitati.data;
                                 setActivitati(activitatiPermise);

                                 // Extragem ID-urile taberelor de care se ocupă el
                                 const idUriTabere = new Set();
                                 activitatiPermise.forEach(act => {
                                     if (act.idTabara)
                                     idUriTabere.add(act.idTabara);
                                 });

                                 // 2. Aducem toate înscrierile ca să extragem Waitlist-ul
                                 return axios.get('http://localhost:8080/inscrieri/lista').then(resInscrieri => {
                                     const toateInscrierile = resInscrieri.data;

                                     // Filtrare doar copiii pe WAITLIST care vor să meargă în taberele LUI
                                     const cereriAsteptare = toateInscrierile.filter(insc =>
                                         insc.statut === 'WAITLIST' &&
                                         insc.tabara &&
                                         idUriTabere.has(insc.tabara.id)
                                     );

                                     setWaitlist(cereriAsteptare);
                                 });
                             })
            .catch(err => {
                console.error("Eroare la aducerea orarului:", err);
            })
            .finally(() => {
                setLoading(false);
            });
         });
    }, [email]);

    //functia care "promoveaza" copilul de pe waitlist
    const handleAprobaLoc=(inscriere)=>{
       //pregatire obiectul actualizat cu noul status
       const inscriereActualizata={
       ...inscriere,
       statut: 'PENDING'//trecere din WaitList in PENDING(asteptatre plata)
       };

       axios.put(`http://localhost:8080/inscrieri/actualizare/${inscriere.id}`, inscriereActualizata)
           .then(()=>{
           //scoatere copil din lista de asteptare de pe ecran
           setWaitlist(prev=> prev.filter(item => item.id !==inscriere.id));
           alert(`✅ Loc aprobat cu succes pentru ${inscriere.participant.nume} ${inscriere.participant.prenume}!`);
            })
            .catch(err => {
               console.error("Eroare completă pentru programator:", err);
               toast.error("Nu poți aproba! Tabăra este plină. Trebuie să anulezi un alt participant mai întâi.");

               });

      };

       // Funcție mică pentru a găsi numele taberei după ID
    const getNumeTabara = (idTabara) => {
       const tabara = allTabere.find(t => t.id === idTabara);
       return tabara ? tabara.nume : 'Nespecificat';
       };

      return (
             <div className="container mt-5 mb-5">
                  {/* ZONA DE HEADER */}
                  <div className="text-center mb-5">
                      <h1 className="text-success fw-bold">🏕️ Panou Coordonator</h1>
                      <p className="lead text-muted">
                          Bine ai venit, <strong>{email}</strong>! Acesta este orarul tău pentru taberele viitoare.
                      </p>
                  </div>

                  {/* ADAUGAT: ZONA DE WAITLIST (Apare doar daca sunt cereri in asteptare) */}
                  {!loading && waitlist.length > 0 && (
                      <div className="card shadow-sm border-warning mb-5">
                          <div className="card-header bg-warning text-dark py-3 d-flex justify-content-between align-items-center">
                              <h4 className="mb-0 fw-bold">⏳ Cereri în Așteptare (Waitlist)</h4>
                              <span className="badge bg-danger fs-6">{waitlist.length} cereri noi</span>
                          </div>
                          <div className="card-body p-0">
                              <table className="table table-hover mb-0">
                                  <thead className="table-light">
                                      <tr>
                                          <th>Nume Participant</th>
                                          <th>Tabără</th>
                                          <th>Data Cererii</th>
                                          <th className="text-end">Acțiuni</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {waitlist.map(insc => (
                                          <tr key={insc.id} className="align-middle">
                                              <td className="fw-bold text-primary">
                                                  {insc.participant?.nume} {insc.participant?.prenume}
                                              </td>
                                              <td>{insc.tabara?.nume}</td>
                                              <td>{insc.dataInscriere}</td>
                                              <td className="text-end">
                                                  <button
                                                      className="btn btn-sm btn-success fw-bold"
                                                      onClick={() => handleAprobaLoc(insc)}
                                                  >
                                                      ✅ Aprobă Locul
                                                  </button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  )}

                  {/* ZONA DE ORAR (PĂSTRATĂ EXACT CUM AI CERUT) */}
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
                                                          <strong>🏕️ Tabăra:</strong> <span className="text-dark">{getNumeTabara(act.idTabara)}</span>
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