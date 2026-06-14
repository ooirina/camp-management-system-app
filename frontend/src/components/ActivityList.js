import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Am adăugat asta pentru navigație

const ActivityList = () => {
    const [activitati, setActivitati] = useState([]);
    const [tabere, setTabere] = useState([]);
    const [tabaraSelectata, setTabaraSelectata] = useState('TOATE');
    const navigate = useNavigate(); // Hook-ul pentru a trimite utilizatorul la formular
    const userRole = localStorage.getItem('userRole'); // '5' pentru participant, '1' pentru Admin, etc.

    useEffect(() => {
        fetchActivitati();
    }, []);

    const fetchActivitati = async () => {
        try {
            const response = await axios.get('http://localhost:8080/activitati/lista');
            const data = response.data;
            setActivitati(data);

            const tabereUnice = [...new Set(data.map(a => a.tabara ? a.tabara.nume : 'Fără Tabără'))];
            setTabere(tabereUnice);
        } catch (error) {
            console.error("Eroare:", error);
        }
    };

    const stergeActivitate = async (id) => {
        if (window.confirm("Ești sigur că vrei să ștergi această activitate? Acțiunea este ireversibilă.")) {
            try {
                await axios.delete(`http://localhost:8080/activitati/${id}`);
                fetchActivitati();
            } catch (error) {
                if (error.response && (error.response.status === 500 || error.response.status === 409)) {
                      alert("❌ Nu poți șterge această activitate deoarece are participanți înscriși sau este legată de o prezență activă!");
                          } else {
                            alert("⚠️ A apărut o eroare la ștergere. Încearcă din nou.");
                        }
                      }
                   }
                };

    const activitatiFiltrate = tabaraSelectata === 'TOATE'
        ? activitati
        : activitati.filter(a => (a.tabara ? a.tabara.nume : 'Fără Tabără') === tabaraSelectata);

    return (
        <div className="container mt-4">
            {/* Header cu Titlu și Buton de Adăugare */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="fw-bold mb-0">📅 Agenda Activităților</h2>
                 {(userRole === '1' || userRole === '2') && (
                <button
                    className="btn btn-primary shadow-sm"
                    onClick={() => navigate('/admin/adauga-activitate')} // Verifică ruta în App.js!
                >
                    <i className="bi bi-plus-circle me-2"></i> Adaugă Activitate
                </button>
                )}
            </div>

            {/* Filtru de Tabără */}
            <div className="d-flex justify-content-center mb-4">
                <select className="form-select w-25 shadow-sm" onChange={(e) => setTabaraSelectata(e.target.value)}>
                    <option value="TOATE">Toate Taberele</option>
                    {tabere.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>

            <div className="row g-4">
                {activitatiFiltrate.map((act) => (
                    <div className="col-md-6 col-lg-4" key={act.id}>
                        <div className="card h-100 shadow-sm border-0 rounded-3">
                            <div className="card-body">
                                <h5 className="fw-bold text-primary">{act.nume}</h5>
                                <p className="text-muted small mb-2">{act.data} | {act.oraInceput.substring(0,5)}</p>
                                <p className="mb-2">{act.locatie}</p>

                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <span className="badge bg-secondary">{act.tabara?.nume || 'Fără tabără'}</span>
                                           <div className="d-flex gap-2">
                                              {/* Trimite spre Tabără (dacă activitatea aparține de o tabără) */}
                                               {act.tabara?.id && (
                                                   <button
                                                       className="btn btn-sm btn-outline-info"
                                                       onClick={() => navigate(`/camp-details/${act.tabara.id}`)}
                                                   >
                                                       <i className="bi bi-eye"></i> Vezi Tabăra
                                                   </button>
                                               )}

                                    {(userRole === '1' || userRole === '2') && (
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => stergeActivitate(act.id)}
                                    >
                                        <i className="bi bi-trash"></i> Șterge
                                    </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                  </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityList;