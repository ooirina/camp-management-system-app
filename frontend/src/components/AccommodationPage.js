import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AccommodationPage = () => {
    const [tabere, setTabere] = useState([]);
    const [selectedTabara, setSelectedTabara] = useState(localStorage.getItem('tabaraActivaId') || '');
    const [camere, setCamere] = useState([]);//stare initiala array gol
    const [nealocati, setNealocati] = useState([]);
    const [filtre, setFiltre] = useState({ gen: '', varsta: '' });
    const [newCamera, setNewCamera] = useState({ numar: '', capacitate: 2, etaj: 0 });
    const [isEditing, setIsEditing]= useState(false);
    const [editingCameraId, setEditingCameraId]= useState(null);

    useEffect(() => {
        axios.get('http://localhost:8080/tabere/lista')
             .then(res => setTabere(res.data));
        // Aducere automat camerele și participanții dacă tabăra e pre-selectată
         const tabaraSalvata = localStorage.getItem('tabaraActivaId');
         if (tabaraSalvata) {
              fetchDateCazare(tabaraSalvata);
                }
    }, []);


    const startEdit=(cam)=>{
    setIsEditing(true);
    setEditingCameraId(cam.id);
    setNewCamera({
     numar:cam.numar,
     capacitate:cam.capacitate,
     etaj:cam.etaj
    });
    window.scrollTo(0,0);//merge sus la formular
    };

///functia de anulare editare
    const cancelEdit=()=>{
       setIsEditing(false);
       setEditingCameraId(null);
       setNewCamera({numar:'', capacitate:2, etaj:0});
    };

    // Modificare handleAddCamera sa faca si UPDATE
    const handleSaveCamera=()=>{
      if(isEditing){
       axios.put(`http://localhost:8080/cazare/camera/update/${editingCameraId}`,{
           ...newCamera,
           tabara:{id:selectedTabara}
       }).then(()=>{
           cancelEdit();
           fetchDateCazare(selectedTabara);
       });

      }
      else{
      handleAddCamera();//functia de POST
      }
    };


    const calculeazaVarsta = (dataNasterii) => {
        if (!dataNasterii) return "?";
        const nastere = new Date(dataNasterii);
        const azi = new Date();
        let varsta = azi.getFullYear() - nastere.getFullYear();
        const luna = azi.getMonth() - nastere.getMonth();

        // Ajustăm dacă ziua de naștere nu a venit încă în anul curent
        if (luna < 0 || (luna === 0 && azi.getDate() < nastere.getDate())) {
            varsta--;
        }
        return varsta;
    };
    const handleAddCamera = () => {
        if (!selectedTabara) return alert("Selectează o tabără mai întâi!");
        axios.post('http://localhost:8080/cazare/camera/salveaza', {
            ...newCamera,
            tabara: { id: selectedTabara }
        }).then(() => {
            setNewCamera({ numar: '', capacitate: 2, etaj: 0 });
            fetchDateCazare(selectedTabara);
        });
    };

    const handleDeleteCamera = (id) => {
        if (window.confirm("Ștergi această cameră? Toți locatarii vor deveni nealocați.")) {
            axios.delete(`http://localhost:8080/cazare/camera/sterge/${id}`)
                .then(() => fetchDateCazare(selectedTabara));
        }
    };

    const fetchDateCazare = (idTabara) => {
        if (!idTabara) return;
        // Incarca camerele (cu locatari inclusi)
        axios.get(`http://localhost:8080/cazare/camere/tabara/${idTabara}`).then(res =>
        {
                console.log("Datele primite pentru camere:", res.data); // Uită-te în consolă!
                if(Array.isArray(res.data)) {
                    setCamere(res.data);
                } else {
                    setCamere([]); // Dacă primim un obiect, punem listă goală să nu crape
                }
            });
        // Incarca copiii fara camera
        axios.get(`http://localhost:8080/cazare/participanti/nealocati/${idTabara}`).then(res => setNealocati(res.data));
    };

    const handleAlocare = (idInscriere, idCamera) => {
        axios.post(`http://localhost:8080/cazare/alocare?idInscriere=${idInscriere}&idCamera=${idCamera}`)
            .then(() => fetchDateCazare(selectedTabara))
            .catch(err => alert(err.response?.data?.message || "Eroare la alocare"));
    };

    const handleEvacuare = (idInscriere) => {
        axios.post(`http://localhost:8080/cazare/evacuare?idInscriere=${idInscriere}`)
            .then(() => fetchDateCazare(selectedTabara));
    };

    // Filtrare logica pentru lista din stanga
    const participantiFiltrati = nealocati.filter(p =>
        (filtre.gen === '' || p.participant.gen === filtre.gen) &&
        // pentru a filtra dupa varsta calculata din dataNasterii
       (filtre.varsta === '' ||
               (filtre.varsta === 'copii' ? calculeazaVarsta(p.participant.dataNasterii) < 18 :
                filtre.varsta === 'adulti' ? calculeazaVarsta(p.participant.dataNasterii) >= 18 : false)
           )
        );

    const getEtichetaParticipant = (gen, dataNasterii) => {
        const varsta = calculeazaVarsta(dataNasterii);

        if (varsta === "?") return "Participant";

        if (varsta < 18) {
            return gen === 'M' ? 'Băiat' : 'Fată';
        } else {
            return gen === 'M' ? 'Bărbat' : 'Femeie';

        }
    };

    return (
        <div className="container-fluid mt-4">
            <h3>🏠 Management Cazare</h3>

            <button
                    className="btn btn-outline-primary"
                    onClick={() => window.location.href='/check-in-out'}
                >
                    Check In/Check Out
                </button>

            {/* Panou Adăugare/Editare Cameră */}
            <div className={`card shadow-sm mb-4 ${isEditing ? 'border-warning' : 'border-primary'}`}>
                            <div className={`card-header text-white ${isEditing ? 'bg-warning' : 'bg-primary'}`}>
                                <h6 className="mb-0">{isEditing ? '✏️ Editează Camera' : '➕ Adaugă Cameră Nouă'}</h6>
                            </div>
                            <div className="card-body">
                                <div className="row g-3 align-items-end">
                                    <div className="col-md-3">
                                        <label className="form-label small fw-bold">Număr Cameră:</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex:101A"
                                            value={newCamera.numar}
                                            onChange={(e) => setNewCamera({...newCamera, numar: e.target.value})}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Capacitate:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newCamera.capacitate}
                                            onChange={(e) => setNewCamera({...newCamera, capacitate: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <label className="form-label small fw-bold">Etaj:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={newCamera.etaj}
                                            onChange={(e) => setNewCamera({...newCamera, etaj: parseInt(e.target.value)})}
                                        />
                                    </div>
                                    <div className="col-md-5 d-flex gap-2">
                                        <button className={`btn w-100 ${isEditing ? 'btn-warning' : 'btn-success'}`} onClick={handleSaveCamera}>
                                            {isEditing ? 'Salvează Modificările' : 'Adaugă Cameră'}
                                        </button>
                                        {isEditing && (
                                            <button className="btn btn-secondary" onClick={cancelEdit}>Anulează</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

            <div className="row mb-4">
                <div className="col-md-4">
                    <select className="form-control" value={selectedTabara}
                            onChange={(e) => { setSelectedTabara(e.target.value); fetchDateCazare(e.target.value); }}>
                        <option value="">-- Selectează Tabăra --</option>
                        {tabere.map(t => <option key={t.id} value={t.id}>{t.nume}</option>)}
                    </select>
                </div>
            </div>

            <div className="row">
                {/* COLOANA NEALOCATI */}
                <div className="col-md-3 border-end">
                    <h5>Copii Nealocați</h5>
                    <div className="mb-2">
                        <select className="form-control form-control-sm mb-1"
                                onChange={e => setFiltre({...filtre, gen: e.target.value})}>
                            <option value="">Gen (Toți)</option>
                            <option value="M">Masculin</option>
                            <option value="F">Feminin</option>
                        </select>

                        <select className="form-control form-control-sm mb-1"
                                onChange={e => setFiltre({...filtre, varsta: e.target.value})}>
                            <option value="">Vârstă (Toate)</option>
                            <option value="copii">Copii (sub 18 ani)</option>
                            <option value="adulti">Adulți (peste 18 ani)</option>
                        </select>
                    </div>
                    <div className="list-group shadow-sm" style={{maxHeight: '600px', overflowY: 'auto'}}>
                        {participantiFiltrati.map(ins => (
                            <div key={ins.id} className="list-group-item d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{ins.participant.nume} {ins.participant.prenume}</strong>
                                    <br/><small className="text-muted">{getEtichetaParticipant(ins.participant.gen, ins.participant.dataNasterii)} | {calculeazaVarsta(ins.participant.dataNasterii)} ani
                                         </small>
                                </div>
                                <div className="dropdown">
                                    <button className="btn btn-sm btn-outline-primary dropdown-toggle" data-bs-toggle="dropdown">Cazează</button>
                                    <div className="dropdown-menu">
                                        {Array.isArray(camere) &&camere.map(cam => (
                                            <button key={cam.id} className="dropdown-item"
                                                    onClick={() => handleAlocare(ins.id, cam.id)}
                                                    disabled={cam.locatari.length >= cam.capacitate}>
                                                Cameră {cam.numar} ({cam.locatari.length}/{cam.capacitate})
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* GRID CAMERE */}
                <div className="col-md-9">
                    <h5>Configurație Camere</h5>
                    <div className="row">
                        {camere.map(cam => {
                                           const gradOcupare = (cam.locatari.length / cam.capacitate) * 100;
                                           const estePlina = cam.locatari.length >= cam.capacitate;

                                           return (
                                               <div key={cam.id} className="col-md-4 mb-4">
                                                   <div className={`card h-100 shadow-sm ${estePlina ? 'border-danger' : 'border-success'}`}>
                                                       <div className={`card-header d-flex justify-content-between align-items-center ${estePlina ? 'bg-danger-subtle' : 'bg-success-subtle'}`}>
                                                           <span className="fw-bold">Cameră {cam.numar}</span>
                                                           <span className="badge bg-secondary">Etaj {cam.etaj}</span>
                                                           <button className="btn btn-sm btn-outline-warning me-2" onClick={() => startEdit(cam)}> ✏️

                                                                   </button>
                                                       </div>
                                                       <div className="card-body">
                                                           <div className="d-flex justify-content-between mb-1 small">
                                                               <span>Ocupare: {cam.locatari.length}/{cam.capacitate}</span>
                                                               {estePlina && <span className="text-danger fw-bold">PLINĂ</span>}
                                                           </div>

                                                           {/* Bară de progres pentru capacitate */}
                                                           <div className="progress mb-3" style={{ height: '8px' }}>
                                                               <div
                                                                   className={`progress-bar ${estePlina ? 'bg-danger' : 'bg-success'}`}
                                                                   role="progressbar"
                                                                   style={{ width: `${gradOcupare}%` }}
                                                               ></div>
                                                           </div>

                                                           <ul className="list-group list-group-flush">
                                                               {cam.locatari.map(locatar => (
                                                                   <li key={locatar.id} className="list-group-item d-flex justify-content-between align-items-center px-0 bg-transparent">
                                                                       <span>👤 {locatar.participant.nume} {locatar.participant.prenume}</span>
                                                                       <button className="btn btn-sm text-danger border-0" onClick={() => handleEvacuare(locatar.id)}>
                                                                           <i className="bi bi-x-circle"></i> Scoate
                                                                       </button>
                                                                   </li>
                                                               ))}
                                                               {cam.locatari.length === 0 && (
                                                                   <li className="list-group-item px-0 text-center text-muted small">Cameră goală</li>
                                                               )}
                                                           </ul>
                                                       </div>
                                                       <div className="card-footer bg-white border-top-0 text-end">
                                                           <button className="btn btn-link btn-sm text-danger text-decoration-none" onClick={() => handleDeleteCamera(cam.id)}>
                                                               Șterge Camera
                                                           </button>
                                                       </div>
                                </div>
                            </div>
                        );})}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccommodationPage;