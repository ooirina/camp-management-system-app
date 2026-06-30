import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ComparePage(){
   const navigate= useNavigate();
   const [tabere, setTabere] = useState([]);
   const [loading, setLoading] = useState(false);


     useEffect(() => {
         const incarcaTabereComplete = async () => {
             const dateSalvate = localStorage.getItem('tabereComparare');

             if (!dateSalvate) {
                 return;
             }

             try {
                 setLoading(true);
                 const tabereSalvate = JSON.parse(dateSalvate);
                 const ids = tabereSalvate.map(tabara => tabara.id);

                 const cereriCombinate = ids.map(async (id) => {
                     const [raspunsTabara, raspunsActivitati] = await Promise.all([
                         axios.get(`http://localhost:8080/tabere/${id}`),
                         axios.get(`http://localhost:8080/activitati/tabara/${id}`)
                     ]);


                     const tabaraCompleta = raspunsTabara.data;
                     tabaraCompleta.activitati = raspunsActivitati.data;

                     return tabaraCompleta;
                 });

                 const tabereFinale = await Promise.all(cereriCombinate);
                 setTabere(tabereFinale);

             } catch (error) {
                 console.error("Eroare la încărcarea datelor combinate:", error);
             } finally {
                 setLoading(false);
             }
         };

         incarcaTabereComplete();
     }, []);

   const stergeDinComparare = (id) =>{
      const listaNoua = tabere.filter(t => t.id !== id);
      setTabere(listaNoua);
      localStorage.setItem('tabereComparare', JSON.stringify(listaNoua));

   };

   if (tabere.length === 0){
   if (loading) {
       return (
           <div className="container mt-5 text-center">
               <h4>Se încarcă datele complete...</h4>
           </div>
       );
   }
     return(
<div className="container mt-5 text-center">
                <h3>Nu ai selectat nicio tabără pentru comparare.</h3>
                <button className="btn btn-primary mt-3" onClick={() => navigate('/tabere')}>
                    ⬅️ Întoarce-te la lista de tabere
                </button>
            </div>
        );
    }

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">⚖️ Comparație Detaliată</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/tabere')}>
                    ⬅️ Înapoi la tabere
                </button>
            </div>

            <div className="card shadow-lg border-primary">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover mb-0 text-center align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th className="text-start bg-light w-25">Specificații</th>
                                    {tabere.map(t => (
                                        <th key={`header-${t.id}`} className="py-4 position-relative" style={{ minWidth: '250px' }}>
                                            <button
                                                className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                                onClick={() => stergeDinComparare(t.id)}
                                                title="Șterge din comparare"
                                            >
                                                ✖
                                            </button>
                                            <img src={`/images/tabara_${t.id}.jpg`} onError={(e) => { e.target.src = '/images/default.jpg'; }} alt={t.nume} className="img-thumbnail mb-2" style={{ height: '100px', objectFit: 'cover' }} />
                                            <h5 className="text-primary mb-0">{t.nume}</h5>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="text-start fw-bold bg-light">💰 Preț</td>
                                    {tabere.map(t => (
                                        <td key={`pret-${t.id}`} className="fw-bold text-success fs-5">
                                            {t.pret} RON
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="text-start fw-bold bg-light">📍 Locație</td>
                                    {tabere.map(t => (
                                        <td key={`locatie-${t.id}`}>
                                            <strong>{t.locatie}</strong>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="text-start fw-bold bg-light">👥 Tip Public</td>
                                    {tabere.map(t => (
                                        <td key={`public-${t.id}`}>
                                            <span className="badge bg-info text-dark fs-6">{t.tipPublic}</span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="text-start fw-bold bg-light">📅 Perioadă</td>
                                    {tabere.map(t => (
                                        <td key={`perioada-${t.id}`}>
                                            {new Date(t.dataInceput).toLocaleDateString()} - <br/>
                                            {new Date(t.dataSfarsit).toLocaleDateString()}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="text-start fw-bold bg-light">👦 Vârstă permisă</td>
                                    {tabere.map(t => (
                                        <td key={`varsta-${t.id}`}>
                                            <span className="badge bg-secondary">
                                                {t.varstaMin} - {t.varstaMax} ani
                                            </span>
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="text-start fw-bold bg-light">🎯 Categorii</td>
                                    {tabere.map(t => (
                                        <td key={`cat-${t.id}`}>
                                            {t.categorii && t.categorii.map(c => (
                                                <span key={c.id} className="badge bg-dark me-1 mb-1">{c.tip}</span>
                                            ))}
                                        </td>
                                    ))}
                                </tr>

                          {/* RÂND NOU PENTRU ACTIVITĂȚI */}
                                  <tr>
                                     <td className="text-start fw-bold bg-light">🧗 Activități incluse</td>
                                       {tabere.map(t => (
                                          <td key={`activitati-${t.id}`} className="align-top">
                                              {t.activitati && t.activitati.length > 0 ? (
                                                   <ul className="list-unstyled mb-0 text-start" style={{ display: 'inline-block', textAlign: 'left' }}>
                                                         {t.activitati.map(act => (
                                                              <li key={act.id} className="small mb-1 border-bottom pb-1">
                                                                  ▪ {act.nume}
                                                                </li>
                                                      ))}
                                                  </ul>
                                                   ) : (
                                                    <span className="text-muted small">Nu sunt specificate</span>
                                                   )}
                                     </td>
                                             ))}
                                </tr>
                                <tr>
                                    <td className="bg-light"></td>
                                    {tabere.map(t => (
                                        <td key={`btn-${t.id}`} className="py-3">
                                            <button
                                                className="btn btn-success w-100 fw-bold"
                                                onClick={() => navigate(`/camp-details/${t.id}`)}
                                            >
                                                Alege această tabără
                                            </button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ComparePage;