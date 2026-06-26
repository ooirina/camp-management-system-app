import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const CheckInOutPage = () => {
    const navigate = useNavigate();
    const [tabere, setTabere] = useState([]);
    const [selectedTabara, setSelectedTabara] = useState(localStorage.getItem('tabaraActivaId') ||'');
    const [participanti, setParticipanti] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    //deschide camera
    const [isScanning, setIsScanning] = useState(false);
    // Blochează procesarea unui nou cod scanat cât timp unul e deja în curs (confirmare sau cerere către server)
    const scanareInCurs = React.useRef(false);

    //userId pentru a filtra taberele coordonatorului
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('userRole');

    useEffect(()=>{
      let scanner =null;
      if(isScanning){
         scanner =new Html5QrcodeScanner(
             "qr-reader",///id-ul div ului unde se afisa camera
             {
           fps: 10, qrbox: { width: 250, height: 250 } },
           false // setăm pe false ca să nu ne umple consola de mesaje

         );

       scanner.render(
           (decodedText)=>{
 // Când a citit codul cu succes
                     // Dacă o scanare e deja în curs de procesare, ignorăm citirile suplimentare
                     if (scanareInCurs.current) return;
                     scanareInCurs.current = true;

                     scanner.clear(); // Oprim camera imediat
                     setIsScanning(false);
                     const idScanat = parseInt(decodedText);

                     // Căutăm înscrierea scanată în lista participanților tabării curent selectate
                     const inscriereGasita = participanti.find(p => p.id === idScanat);

                     if (!inscriereGasita) {
                         // Codul QR nu aparține tabării active selectate momentan
                         toast.error("Acest cod QR este pentru o altă tabără! Selectează tabăra corectă și încearcă din nou.");
                         scanareInCurs.current = false;
                         return;
                     }

                     const numeComplet = `${inscriereGasita.participant.nume} ${inscriereGasita.participant.prenume} cu inscrierea ID: ${idScanat}`;

                     // Apelăm check-in-ul cu numele real al participantului identificat
                     handleAction(idScanat, 'checkin', numeComplet);
                 },
                 (errorMessage) => {
                     // Aici intră erorile de frame (când nu vede niciun cod), le ignorăm în tăcere
                 }
             );
         }

         // Curățare: când închidem camera din buton, distrugem scannerul
                 return () => {
                     if (scanner) {
                         scanner.clear().catch(error => console.error("Eroare la oprirea camerei", error));
                     }
                 };
             }, [isScanning]);


    useEffect(() => {
       const url = userRole === '1'
                   ? 'http://localhost:8080/tabere/lista'
                   : `http://localhost:8080/tabere/coordonator/${userId}`;

      axios.get(url).then(res => setTabere(res.data));

     // Dacă avem o tabără activă salvată, aducem automat participanții pentru ea
             const tabaraSalvata = localStorage.getItem('tabaraActivaId');
             if (tabaraSalvata) {
                 fetchStatusParticipanti(tabaraSalvata);
             }

    }, []);



    const fetchStatusParticipanti = (idTabara) => {
        if (!idTabara) return;
       axios.get(`http://localhost:8080/flux/participanti/tabara/${idTabara}`)
            .then(res => setParticipanti(res.data))
            .catch(err => console.error("Eroare la preluare", err));

     };

    // Aceasta este singura funcție de care ai nevoie pentru butoane
    const handleAction = (id, action,participantName = '') => {

         // Confirmare pentru check-in
             if ( action === 'checkin' && !window.confirm( `Ești sigur(ă) că vrei să marchezi check-in-ul pentru ${participantName}?`)
             ) {
                 scanareInCurs.current = false;
                 return;
             }

        // Dacă e checkout, cerem confirmare
        if (action === 'checkout' && !window.confirm("Confirmi plecarea definitivă a participantului?")) {
            scanareInCurs.current = false;
            return;
        }

        axios.post(`http://localhost:8080/flux/${action}/${id}`)
            .then(() => {
                // Mesaj clar de confirmare, vizibil utilizatorului
                if (action === 'checkin') {
                    toast.success(`Check-in confirmat${participantName ? ' pentru ' + participantName : ''}!`);
                } else {
                    toast.success('Check-out confirmat cu succes!');
                }
                // După acțiune, reîmprospătăm lista
                fetchStatusParticipanti(selectedTabara);
            })
            .catch(err => alert("Eroare la procesare flux."))
            .finally(() => {
                scanareInCurs.current = false;
            });
    };

    const filtrati = participanti.filter(p =>
        p.participant.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.participant.prenume.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🛂 Flux Sosiri / Plecări</h2>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/cazare')}>
                    ⬅ Înapoi la Cazare
                </button>
            </div>

            <div className="row mb-4">
                <div className="col-md-6">
                    <label className="form-label fw-bold">Selectează Tabăra:</label>
                    <select className="form-control" value={selectedTabara} onChange={(e) => {
                        setSelectedTabara(e.target.value);
                        fetchStatusParticipanti(e.target.value);
                    }}>
                        <option value="">-- Alege Tabăra --</option>
                        {tabere.map(t => <option key={t.id} value={t.id}>{t.nume}</option>)}
                    </select>
                </div>
                <div className="col-md-6">
                    <label className="form-label fw-bold">Caută după nume:</label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Ex: Dragomir..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

              <button className="btn btn-primary fw-bold mb-3 ms-2" onClick={() => setIsScanning(!isScanning)}>
                  📷 {isScanning ? 'Închide Camera' : 'Scanează QR'}
              </button>

             {/*Deschiderea efectiva a camerei*/}
             {isScanning && (
                             <div className="alert alert-info text-center mx-auto" style={{ maxWidth: '400px' }}>
                                 <h5 className="mb-3">Așează codul QR în fața camerei</h5>
                                 {/* Aici va fi desenată noua cameră de către biblioteca html5-qrcode */}
                                 <div id="qr-reader" style={{ width: '100%' }}></div>
                             </div>
                         )}
            <div className="card shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>Participant</th>
                            <th>Cameră Alocată</th>
                            <th>Status Sosire</th>
                            <th className="text-center">Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtrati.length > 0 ? filtrati.map(ins => (
                            <tr key={ins.id} className={ins.statusSosire === 'SOSIT' ? 'table-success' : ''}>
                                <td className="align-middle">
                                    <strong>{ins.participant.nume} {ins.participant.prenume}</strong>
                                </td>
                                <td className="align-middle">
                                    {ins.camera ? (
                                        <span className="badge bg-info text-dark">Etaj {ins.camera.etaj} - Cam. {ins.camera.numar}</span>
                                    ) : (
                                        <span className="text-muted small">Nerepartizat</span>
                                    )}
                                </td>
                                <td className="align-middle">
                                    <span className={`badge ${ins.statusSosire === 'SOSIT' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                        {ins.statusSosire || 'NEOSIT'}
                                    </span>
                                    {ins.dataCheckin && (
                                        <div className="x-small text-muted" style={{fontSize: '0.7rem'}}>
                                            {new Date(ins.dataCheckin).toLocaleTimeString()}
                                        </div>
                                    )}
                                </td>
                                <td className="text-center">
                                    {!ins.dataCheckin && (
                                        <button className="btn btn-success btn-sm" onClick={() => handleAction(ins.id, 'checkin',  `${ins.participant.nume} ${ins.participant.prenume}`)}>
                                            ✅ Check-in
                                        </button>
                                    )}
                                    {ins.dataCheckin && !ins.dataCheckout && (
                                        <button className="btn btn-danger btn-sm" onClick={() => handleAction(ins.id, 'checkout')}>
                                            🚪 Check-out
                                        </button>
                                    )}
                                    {ins.dataCheckout && (
                                        <span className="text-danger fw-bold small">Părăsit Tabăra</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="text-center text-muted py-4">
                                    {selectedTabara ? "Nu s-au găsit participanți." : "Selectează o tabără pentru a vedea lista."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CheckInOutPage;