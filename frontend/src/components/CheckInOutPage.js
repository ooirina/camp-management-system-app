import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Html5QrcodeScanner } from 'html5-qrcode';

const CheckInOutPage = () => {
    const [tabere, setTabere] = useState([]);
    const [selectedTabara, setSelectedTabara] = useState(localStorage.getItem('tabaraActivaId') ||'');
    const [participanti, setParticipanti] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    //deschide camera
    const [isScanning, setIsScanning] = useState(false);

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
                     scanner.clear(); // Oprim camera imediat
                     setIsScanning(false);
                     const idScanat = parseInt(decodedText);

                     // Apelăm check-in-ul
                     handleAction(idScanat, 'checkin', 'Participant scanat cu QR');
                     alert(`✅ Scanare reușită! Check-in efectuat pentru ID-ul ${idScanat}.`);
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
        axios.get('http://localhost:8080/tabere/lista').then(res => setTabere(res.data));

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
                 return;
             }

        // Dacă e checkout, cerem confirmare
        if (action === 'checkout' && !window.confirm("Confirmi plecarea definitivă a participantului?")) {
            return;
        }

        axios.post(`http://localhost:8080/flux/${action}/${id}`)
            .then(() => {
                // După acțiune, reîmprospătăm lista
                fetchStatusParticipanti(selectedTabara);
            })
            .catch(err => alert("Eroare la procesare flux."));
    };

    const filtrati = participanti.filter(p =>
        p.participant.nume.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.participant.prenume.toLowerCase().includes(searchTerm.toLowerCase())
    );


const handleDownloadCSV= async()=>{

   if (!selectedTabara) {
               alert("Te rog selectează o tabără mai întâi!");
               return;
           }

  try{
      const token =localStorage.getItem('token');
     const response = await axios.get(`http://localhost:8080/flux/raport/csv/${selectedTabara}`, {
               headers: { Authorization: `Bearer ${token}` },
                           responseType: 'blob', // inseamna că primim un fișier, nu text
  });

  const url =window.URL.createObjectURL(new Blob([response.data]));
  const link= document.createElement('a');
  link.href=url;
  link.setAttribute('download', `Lista_Tabara_${selectedTabara}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);


} catch(error){
    console.error("Eroare la descărcare:", error);
    alert("Eroare la generarea Excel-ului.");

}
};
    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🛂 Flux Sosiri / Plecări</h2>
                <button className="btn btn-outline-secondary" onClick={() => window.history.back()}>
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

              <div className="d-flex justify-content-end mb-2">
                  <button className="btn btn-outline-success fw-bold" onClick={handleDownloadCSV}>
                   📊 Descarcă Lista Excel (CSV)
                   </button>
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