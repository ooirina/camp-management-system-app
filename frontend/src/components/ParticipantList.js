import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ParticipantList = () => {
    const [participanti, setParticipanti] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchParticipanti();
    }, []);

    const fetchParticipanti = async () => {
        try {
            const token = localStorage.getItem('token');

            // Apelăm lista globală de participanți
            const response = await axios.get('http://localhost:8080/participanti/lista', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setParticipanti(response.data);

        } catch (error) {
            console.error("Eroare la aducerea participanților:", error);
            if (error.response && error.response.status === 401) {
                alert("Sesiunea a expirat sau nu ai acces. Te rugăm să te reloghezi.");
            }
        }
    };

    // Filtru inteligent: caută și după nume și după prenume
    const participantiFiltrati = participanti.filter(p =>
        p.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.prenume.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Funcția de EXPORT EXCEL (CSV)
    const exportToCSV = () => {
        if (participantiFiltrati.length === 0) {
            alert("Nu sunt participanți de exportat pentru această selecție!");
            return;
        }

        let csvContent = "Nume,Prenume,Gen,Data Nasterii,Telefon,Alergii,Contact Urgenta\n";

        participantiFiltrati.forEach(p => {
            const nume = p.nume || '';
            const prenume = p.prenume || '';
            const gen = p.gen || '';
            const dataNasterii = p.dataNasterii || '';
            const telefon = p.telefon || '';
            // Curățăm virgulele ca să nu strice coloanele în Excel
            const alergii = (p.alergii || 'Fără').replace(/,/g, ' ');
            const contact = (p.contactUrgenta || '').replace(/,/g, ' ');

            csvContent += `${nume},${prenume},${gen},${dataNasterii},${telefon},${alergii},${contact}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Baza_Date_Participanti_CRM.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container mt-4">
            {/* Header: Titlu și Buton Export */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold text-dark mb-0">
                        <i className="bi bi-person-lines-fill me-2 text-primary"></i>
                        Bază de Date Participanți (CRM)
                    </h2>
                    <p className="text-muted small mt-1">Registrul global al tuturor participanților din sistem</p>
                </div>

                <button onClick={exportToCSV} className="btn btn-success shadow-sm">
                    <i className="bi bi-file-earmark-spreadsheet me-2"></i>
                    Descarcă Registru (Excel)
                </button>

                <button
                    onClick={() => navigate('/check-in-out')}
                    className="btn btn-primary shadow-sm ms-2"
                >
                    <i className="bi bi-clipboard-check me-2"></i>
                    Gestionează Check-In Tabără
                </button>
            </div>


            {/* Zona de Căutare */}
            <div className="card shadow-sm border-0 mb-4 bg-light">
                <div className="card-body d-flex align-items-center">
                    <label className="fw-bold me-3 text-secondary">Caută participant:</label>
                    <input
                        type="text"
                        className="form-control w-auto shadow-sm"
                        placeholder="Ex: Popescu..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="ms-3 text-muted small">
                        Afișează {participantiFiltrati.length} înregistrări
                    </span>
                </div>
            </div>

            {/* Tabelul de Date */}
            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-borderless align-middle mb-0">
                            <thead className="table-light text-secondary">
                                <tr>
                                    <th className="px-4 py-3">Nume și Prenume</th>
                                    <th>Gen</th>
                                    <th>Data Nașterii</th>
                                    <th>Telefon</th>
                                    <th>Contact Urgență</th>
                                    <th>Alergii / Detalii Medicale</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participantiFiltrati.length > 0 ? (
                                    participantiFiltrati.map((p) => (
                                        <tr key={p.id} className="border-bottom">
                                            <td className="px-4 fw-bold text-dark">{p.nume} {p.prenume}</td>
                                            <td>
                                                <span className={`badge ${p.gen === 'M' ? 'bg-info text-dark' : 'bg-danger'} rounded-pill`}>
                                                    {p.gen}
                                                </span>
                                            </td>
                                            <td>{p.dataNasterii}</td>
                                            <td>{p.telefon}</td>
                                            <td>{p.contactUrgenta}</td>
                                            <td>
                                                {p.alergii && p.alergii.toLowerCase() !== 'fără' ? (
                                                    <span className="text-danger fw-bold"><i className="bi bi-exclamation-triangle-fill me-1"></i>{p.alergii}</span>
                                                ) : (
                                                    <span className="text-muted">Fără</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            Nu s-au găsit participanți în baza de date.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipantList;