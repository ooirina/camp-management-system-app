import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const RegistrationDetails = () => {
    // Extragem ID-ul din URL (ex: /admin/inscrieri/842 -> scoate 842)
    const { id } = useParams();
    const navigate = useNavigate();

    const [inscriere, setInscriere] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetalii = async () => {
            try {
                const token = localStorage.getItem('token');
                // Asigură-te că ai ruta asta în InscriereController! (de obicei există dacă folosești findById)
                const response = await axios.get(`http://localhost:8080/inscrieri/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setInscriere(response.data);
            } catch (error) {
                console.error("Eroare la aducerea detaliilor:", error);
                toast.error("Nu am putut încărca detaliile înscrierii.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetalii();
    }, [id]);

    if (loading) return <div className="text-center mt-5 spinner-border text-primary" role="status"></div>;
    if (!inscriere) return <div className="text-center mt-5 text-danger">Înscrierea nu a fost găsită.</div>;

    const isPlatit = inscriere.statusPlata === 'PLATIT';
    const isPending = inscriere.statut === 'PENDING';

    return (
        <div className="container mt-4 mb-5">
            <button className="btn btn-outline-secondary mb-4 fw-bold" onClick={() => navigate(-1)}>
                ⬅️ Înapoi la Listă
            </button>

            <h2 className="mb-4 text-primary">🔍 Detalii Dosar #{inscriere.id}</h2>

            <div className="row g-4">
                {/* CARD 1: Detalii Participant */}
                <div className="col-md-6">
                    <div className="card shadow-sm h-100 border-start border-info border-4">
                        <div className="card-header bg-white fw-bold">👶 Date Participant</div>
                        <div className="card-body">
                            <p><strong>Nume complet:</strong> {inscriere.participant?.nume} {inscriere.participant?.prenume}</p>
                            <p><strong>Data Nașterii:</strong> {inscriere.participant?.dataNasterii ? new Date(inscriere.participant.dataNasterii).toLocaleDateString() : '-'}</p>
                            <p><strong>Gen:</strong> {inscriere.participant?.gen === 'M' ? 'Masculin' : 'Feminin'}</p>

                            <hr/>
                            <h6 className="text-danger fw-bold">⚠️ Informații Medicale</h6>
                            <p><strong>Alergii:</strong> {inscriere.participant?.alergii || <span className="text-muted">Nu are</span>}</p>
                            <p><strong>Probleme Medicale:</strong> {inscriere.participant?.problemeMedicale || <span className="text-muted">Nu are</span>}</p>
                        </div>
                    </div>
                </div>

                {/* CARD 2: Date de Contact și Tabără */}
                <div className="col-md-6">
                    <div className="card shadow-sm h-100 border-start border-success border-4">
                        <div className="card-header bg-white fw-bold">🏕️ Date Tabără & Contact</div>
                        <div className="card-body">
                            <p><strong>Tabăra:</strong> {inscriere.tabara?.nume}</p>
                            <p><strong>Perioada:</strong> {new Date(inscriere.tabara?.dataInceput).toLocaleDateString()} - {new Date(inscriere.tabara?.dataSfarsit).toLocaleDateString()}</p>
                            <hr/>
                            <p><strong>Telefon Părinte:</strong> <a href={`tel:${inscriere.participant?.telefon}`}>{inscriere.participant?.telefon}</a></p>
                            <p><strong>Contact Urgență:</strong> <span className="text-danger fw-bold">{inscriere.participant?.contactUrgenta}</span></p>
                        </div>
                    </div>
                </div>

                {/* CARD 3: Status și Documente (Ocupă toată lățimea jos) */}
                <div className="col-12">
                    <div className="card shadow-sm border-start border-warning border-4">
                        <div className="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                            <span>📄 Status & Documente</span>
                            <span className={`badge ${isPending ? 'bg-warning text-dark' : (inscriere.statut === 'CONFIRMAT' ? 'bg-success' : 'bg-danger')}`}>
                                STATUS: {inscriere.statut}
                            </span>
                        </div>
                        <div className="card-body d-flex justify-content-between align-items-center flex-wrap gap-3">
                            <div>
                                <p className="mb-1"><strong>Status Plată:</strong> <span className={`badge ${isPlatit ? 'bg-success' : 'bg-danger'}`}>{inscriere.statusPlata}</span></p>
                                <p className="mb-0"><strong>Suma de plată:</strong> {inscriere.suma} RON</p>
                            </div>

                            <div className="text-end">
                                <p className="mb-2 fw-bold text-secondary">Document Medical (Adeverință):</p>
                                {inscriere.documentMedical ? (
                                    // Aici se foloseste ruta publică din WebConfig pe care am discutat-o
                                    <a
                                        href={`http://localhost:8080/uploads/${inscriere.documentMedical}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="btn btn-primary shadow-sm"
                                    >
                                        ⬇️ Vezi / Descarcă Fișa
                                    </a>
                                ) : (
                                    <span className="text-danger fw-bold border p-2 rounded">❌ Părintele nu a încărcat fișa!</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default RegistrationDetails;