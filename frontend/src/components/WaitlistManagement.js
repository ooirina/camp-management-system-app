import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const WaitlistManagement = () => {
    const [waitlist, setWaitlist] = useState([]);
    const [allTabere, setAllTabere] = useState([]);
    const [toateInscrierile, setToateInscrierile] = useState([]);
    const [loading, setLoading] = useState(true);

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

                // Aducem activitățile coordonatorului, ca să știm pe ce tabere are el drept
                axios.get(`http://localhost:8080/prezenta/activitati-coordonator?email=${email}`)
                    .then(resActivitati => {
                        const activitatiPermise = resActivitati.data;

                        // Extragem ID-urile taberelor de care se ocupă el
                        const idUriTabere = new Set();
                        activitatiPermise.forEach(act => {
                            if (act.tabara?.id) idUriTabere.add(act.tabara?.id);
                        });

                        // Aducem toate înscrierile ca să extragem Waitlist-ul
                        return axios.get('http://localhost:8080/inscrieri/lista').then(resInscrieri => {
                            const toate = resInscrieri.data;
                            setToateInscrierile(toate);

                            // Filtrare doar cererile pe WAITLIST din taberele lui
                            const cereriAsteptare = toate
                                .filter(insc =>
                                    insc.statut === 'WAITLIST' &&
                                    insc.tabara &&
                                    idUriTabere.has(insc.tabara.id)
                                )
                                // Ordonare cronologică: cea mai veche cerere primul, cea mai recentă ultima
                                .sort((a, b) => new Date(a.dataInscriere) - new Date(b.dataInscriere));

                            setWaitlist(cereriAsteptare);
                        });
                    })
                    .catch(err => {
                        console.error("Eroare la aducerea waitlist-ului:", err);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            });
    }, [email]);

    // Funcție care calculează locurile libere în timp real
    const getLocuriDisponibile = (idTabara) => {
        const tabara = allTabere.find(t => t.id === idTabara);
        if (!tabara || !tabara.capacitate) return 0;

        const locuriOcupate = toateInscrierile.filter(insc => {
            const idTab = insc.tabara?.id;
            return idTab === tabara?.id && (insc.statut === 'PENDING' || insc.statut === 'CONFIRMAT');
        }).length;

        const locuriLibere = tabara.capacitate - locuriOcupate;
        return locuriLibere > 0 ? locuriLibere : 0;
    };

    // Funcția care "promovează" copilul de pe waitlist
    const handleAprobaLoc = (inscriere) => {
        const inscriereActualizata = {
            ...inscriere,
            statut: 'PENDING'
        };

        axios.put(`http://localhost:8080/inscrieri/actualizare/${inscriere.id}`, inscriereActualizata)
            .then(() => {
                setWaitlist(prev => prev.filter(item => item.id !== inscriere.id));
                setToateInscrierile(prev => prev.map(insc =>
                    insc.id === inscriere.id ? { ...insc, statut: 'PENDING' } : insc
                ));
                toast.success(`Loc aprobat cu succes pentru ${inscriere.participant.nume} ${inscriere.participant.prenume}!`);
            })
            .catch(err => {
                console.error("Eroare completă pentru programator:", err);
                toast.error("Nu poți aproba! Tabăra este plină. Trebuie să anulezi un alt participant mai întâi.");
            });
    };

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <div className="spinner-border text-primary" role="status" />
                <p className="text-muted mt-3">Se încarcă lista de așteptare...</p>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="card shadow-sm border-warning mb-5">
                <div className="card-header bg-warning text-dark py-3 d-flex justify-content-between align-items-center">
                    <h4 className="mb-0 fw-bold">⏳ Cereri în Așteptare (Waitlist)</h4>
                    <span className="badge bg-danger fs-6">{waitlist.length} cereri</span>
                </div>
                <div className="card-body p-0">
                    {waitlist.length === 0 ? (
                        <div className="text-center text-muted p-5">
                            Nu există cereri în așteptare momentan.
                        </div>
                    ) : (
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
                                {waitlist.map(insc => {
                                    const locuriLibere = getLocuriDisponibile(insc.tabara?.id);
                                    return (
                                        <tr key={insc.id} className="align-middle">
                                            <td className="fw-bold text-primary">
                                                {insc.participant?.nume} {insc.participant?.prenume}
                                            </td>
                                            <td>
                                                {insc.tabara?.nume}
                                                <span className={`badge ms-2 ${locuriLibere > 0 ? 'bg-success' : 'bg-danger'}`}>
                                                    {locuriLibere} locuri libere
                                                </span>
                                            </td>
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
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WaitlistManagement;