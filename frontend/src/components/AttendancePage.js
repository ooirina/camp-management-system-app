import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AttendancePage = () => {
    const [tabere, setTabere] = useState([]);
    const [activitati, setActivitati] = useState([]);
    const [activitatiCoordonator, setActivitatiCoordonator]=useState([]);
    const [participanti, setParticipanti] = useState([]);
    const [selectedTabara, setSelectedTabara] = useState(localStorage.getItem('tabaraActivaId') || '');
    const [selectedActivitate, setSelectedActivitate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {

        const emailCoordonator= localStorage.getItem('userEmail');
        if(!emailCoordonator)
        {
        console.error("Nu există email de coordonator în localStorage!");
        return;
        }
       ///aducere acitivitati coordonatorului
        axios.get(`http://localhost:8080/prezenta/activitati-coordonator?email=${emailCoordonator}`)
        .then(res=> {
              const activitatiPermise =res.data;
              setActivitatiCoordonator(activitatiPermise);// salvare pentru al doilea dropdown
         //extrage ID tabere
         const idUriTabere=new Set();
         activitatiPermise.forEach(act=>{
         // Dacă activitatea are o tabără asociată și nu am mai adăugat-o deja
         if(act.tabara && act.tabara.id){
               idUriTabere.add(act.tabara.id);

         }
         });
         axios.get('http://localhost:8080/tabere/lista')
         .then(resTabere=>{
         const allTabere = resTabere.data;
         ///aducere toate tabere cau au ID urile in Set-ul coordonatorului
         const tabereFiltrate= allTabere.filter(tabere=>idUriTabere.has(tabere.id));
         setTabere(tabereFiltrate);//poulare primul dropdown cu numele taberei
        })
        .catch(err => console.error("Eroare la aducerea tabere:", err));
})
            .catch(err => console.error("Eroare la aducerea activităților coordonatorului:", err));

//sa apara lista tabere , aasa mergea daca nu e limitat de ce tip e emailul
       /* axios.get('http://localhost:8080/tabere/lista')
            .then(res => setTabere(res.data))
            .catch(err => console.error("Eroare la tabere:", err));*/


    }, []);


    //Autocompletare activitati cand se incarca pagina cu o tabara activa din profilul coordontatorului
         useEffect(()=>{
            if(selectedTabara && activitatiCoordonator.length >0){
              const activitatiFiltrate = activitatiCoordonator.filter(
                 act=> act.tabara && act.tabara.id.toString() === selectedTabara.toString()
              );
                setActivitati(activitatiFiltrate);
            }

         }, [selectedTabara, activitatiCoordonator]);


//cand se alege tabara
    const handleTabaraChange = (e) => {
        const id = e.target.value;
        setSelectedTabara(id);
        setSelectedActivitate('');
        setParticipanti([]);
        if (id) {
          /* //apwlam axios pt a avea toate activtatile taberelor
           axios.get(`http://localhost:8080/activitati/tabara/${id}`)
                .then(res => setActivitati(res.data))
                .catch(err => console.error("Eroare la activitati:", err));
        */
        //activitatile coordonatorilor din tabara sunt luate deja din "activitatiCoordonator"
        //se filtreaza pe cele care apartin de tabara selectata
        //cautare activitățile care au "idTabara" egal cu id-ul selectat
        const activitatiFiltrate= activitatiCoordonator.filter(
        act=> act.tabara && act.tabara.id.toString()=== id.toString()
        );
        setActivitati(activitatiFiltrate);//populare al doilea dropdown
        }
        else {
        setActivitati([]);
        }
    };

    const handleActivitateChange = async (e) => {
        const idAct = e.target.value;
        setSelectedActivitate(idAct);
        setParticipanti([]);

        if (!selectedTabara || !idAct) return;

        setLoading(true);
        try {
            // 1. Incarca lista (unii au idPrezenta null = nu exista in BD)
            const res = await axios.get(
                `http://localhost:8080/prezenta/lista/${selectedTabara}/${idAct}`
            );
            const lista = res.data;

            // 2. Pentru cei fara inregistrare in BD, fa INSERT cu 'NU' automat
            const inserturi = lista
                .filter(p => p.idPrezenta === null || p.idPrezenta === undefined)
                .map(p =>
                    axios.post('http://localhost:8080/prezenta/salveaza', {
                        idInscriere: p.idInscriere,
                        idActivitate: parseInt(idAct),
                        prezenta: 'NU',
                        observatii: '',
                        nume: p.nume,
                        prenume: p.prenume,
                        numeTabara: p.numeTabara,
                        numeActivitate: p.numeActivitate,
                        idPrezenta: null
                    })
                );

            // 3. Asteapta toate inserturile
            const rezultate = await Promise.all(inserturi);

            // 4. Reconstruieste lista cu idPrezenta-urile reale din BD
            let indexInsert = 0;
            const listaFinala = lista.map(p => {
                if (p.idPrezenta === null || p.idPrezenta === undefined) {
                    const salvat = rezultate[indexInsert++].data;
                    return { ...salvat, idActivitate: parseInt(idAct) };
                }
                return p;
            });

            setParticipanti(listaFinala);
        } catch (err) {
            console.error("Eroare la incarcare/initializare prezenta:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = (participant, noulStatus, nouaObservatie) => {
        // Construim payload explicit - fara spread ca sa evitam surprize
        const payload = {
            nume: participant.nume,
            prenume: participant.prenume,
            numeTabara: participant.numeTabara,
            numeActivitate: participant.numeActivitate,
            idInscriere: participant.idInscriere,
            idActivitate: parseInt(selectedActivitate), // sursa de adevar e selectedActivitate
            prezenta: noulStatus !== undefined ? noulStatus : participant.prezenta,
            observatii: nouaObservatie !== undefined ? nouaObservatie : (participant.observatii || ""),
            idPrezenta: participant.idPrezenta || null
        };

        console.log("Trimit payload:", payload); // debug temporar

        axios.post('http://localhost:8080/prezenta/salveaza', payload)
            .then(res => {
                // res.data e acum PrezentaDTO - actualizam randul corect
                setParticipanti(prev => prev.map(p =>
                    p.idInscriere === participant.idInscriere
                        ? { ...res.data, idActivitate: parseInt(selectedActivitate) }
                        : p
                ));
            })
            .catch(err => {
                console.error("Eroare salvare:", err.response?.data || err);
                alert("Eroare la salvare! " + (err.response?.data?.message || err.message));
            });
    };

    return (
        <div className="container mt-4">
            <h2>📋 Catalog Prezență</h2>
            <div className="row mt-4">
                <div className="col-md-4">
                    <label>Selectează Tabăra:</label>
                    <select className="form-control" onChange={handleTabaraChange} value={selectedTabara}>
                        <option value="">-- Alege Tabăra --</option>
                        {tabere.map(t => (
                            <option key={t.id} value={t.id}>{t.nume}</option>
                        ))}
                    </select>
                </div>
                <div className="col-md-4">
                    <label>Selectează Activitatea:</label>
                    <select
                        className="form-control"
                        onChange={handleActivitateChange}
                        value={selectedActivitate}
                        disabled={!selectedTabara}
                    >
                        <option value="">-- Alege Activitatea --</option>
                        {activitati.map(a => (
                            <option key={a.id} value={a.id}>{a.nume} ({a.oraInceput})</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading && <p className="mt-3">Se încarcă lista...</p>}

            {!loading && participanti.length > 0 && (
                <table className="table table-hover mt-5">
                    <thead className="thead-dark">
                        <tr>
                            <th>#</th>
                            <th>Nume</th>
                            <th>Prenume</th>
                            <th>Status Prezență</th>
                            <th>Observații</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participanti.map((p, index) => (
                            // Folosim index ca fallback daca idInscriere e null
                            <tr key={p.idInscriere ?? `row-${index}`}>
                                <td>{index + 1}</td>
                                <td>{p.nume || '—'}</td>
                                <td>{p.prenume || '—'}</td>
                                <td>
                                    <div className="form-check d-flex align-items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id={`prez-${p.idInscriere ?? index}`}
                                            checked={p.prezenta === 'DA'}
                                            onChange={() =>
                                                handleSave(
                                                    p,
                                                    p.prezenta === 'DA' ? 'NU' : 'DA',
                                                    undefined
                                                )
                                            }
                                        />
                                        <label
                                            className="form-check-label"
                                            htmlFor={`prez-${p.idInscriere ?? index}`}
                                        >
                                            {p.prezenta === 'DA' ? '✅ Prezent' : '❌ Absent'}
                                        </label>
                                    </div>
                                </td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Adaugă observație..."
                                        value={p.observatii || ""}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setParticipanti(prev => prev.map(item =>
                                                item.idInscriere === p.idInscriere
                                                    ? { ...item, observatii: val }
                                                    : item
                                            ));
                                        }}
                                        onBlur={(e) =>
                                            handleSave(p, undefined, e.target.value)
                                        }
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {!loading && selectedActivitate && participanti.length === 0 && (
                <p className="mt-3 text-muted">Nu există participanți înscriși la această activitate.</p>
            )}
        </div>
    );
};

export default AttendancePage;