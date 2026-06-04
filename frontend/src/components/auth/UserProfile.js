import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile(){
  const navigate= useNavigate();
  const [inscrieri, setInscrieri]= useState([]);
  const [membriiFamilie, setMembriiFamilie]=useState([]);

  const email= localStorage.getItem('userEmail')||"";//prin localStorage se salveaza la login, am pus "" ca sa fie sigur nu null
  const username=email.includes('@')?email.split('@')[0]:email;

//Pentru formularul de adaugare membru nou( starea campurilor)
  const [nume, setNume] = useState('');
  const [prenume, setPrenume] = useState('');
  const [dataNasterii, setDataNasterii] = useState('');
  const [alergii, setAlergii] = useState('');
  const [problemeMedicale, setProblemeMedicale] = useState('');
  const [telefon,setTelefon]= useState('');
  const [contactUrgenta, setContactUrgenta] = useState('');
  const [gen, setGen] = useState('');
  const [showForm, setShowForm] = useState(false); // Ascunde/Arată formularul de adăugare
  const [isEditing, setIsEditing] = useState(false); // Schimbă din mod Adăugare în mod Editare
  const [editingId, setEditingId] = useState(null); // Reține ID-ul membrului pe care îl edităm


   useEffect(()=>{
     const fetchUserData= async()=>{
     /// se incearca sa se ia ID ul din memoria locala
     let currentUserId=localStorage.getItem('userId');

      //daca nu avem ID, cerem de la backend folosind emailul
     if(!currentUserId && email)
     {
     try {

        const res=await axios.get(`http://localhost:8080/utilizatori/get_id_user?email=${email}`);

      if (res.data) {
       currentUserId = res.data;
       localStorage.setItem('userId', currentUserId);
         }
     } catch (err){
     console.error("Nu s-a putut recupera ID-ul utilizatorului:", err);
       }
     }

     ///daca exista ID ul(fie local sau adus) se ia istoricul inscrierilor+ familiei
     if(currentUserId){
   // se ia istoric inscriere
   axios.get(`http://localhost:8080/inscrieri/istoric/${currentUserId}`)
        .then(res=>setInscrieri(res.data))
        .catch(err => console.error("Eroare la preluarea istoricului:",err));

   // apelare ruta din java pentru a aduce membrii familiei (FĂRĂ TOKEN ACUM)
   axios.get(`http://localhost:8080/participanti/familie/${currentUserId}`)
     .then(res=> setMembriiFamilie(res.data))
     .catch(err => console.error("Eroare la preluarea membrilor familiei:",err));
   }
   };
  fetchUserData();
   },[email]);//acest [email] e ca un trigger, declansator, imediat ce avem email, poerneste aceasta functie

 ///logout
  const handleLogout=()=>{
  localStorage.clear();//Sterge tot:email, token, userId
  alert("Te-ai delogat cu succes!");
  navigate('/');//era inainte /login

  };
  //  functie salvare/actualkizare membru de familie in baza de date
     const handleAdaugaMembru = async (e) => {
      e.preventDefault();
      const currentUserId = localStorage.getItem('userId');

      if (!nume || !prenume || !dataNasterii || !telefon || !contactUrgenta|| !gen) {
        alert("Te rugăm să completezi câmpurile obligatorii (*)");
        return;
        }
        const nouParticipant = {
              nume: nume,
              prenume: prenume,
              dataNasterii: dataNasterii,
              gen: gen,
              alergii: alergii,
              problemeMedicale: problemeMedicale,
              telefon:telefon,
              contactUrgenta: contactUrgenta,
              idUser: parseInt(currentUserId) // Îl legăm automat de contul părintelui curent!
            };

            try {
              if (isEditing) {
             // MOD EDITARE: Trimitem cerere PUT către ruta ta din Java
               const res = await axios.put(`http://localhost:8080/participanti/${editingId}`, nouParticipant);

               // Înlocuim membrul vechi cu cel actualizat în listă ca să se vadă instant pe ecran
                setMembriiFamilie(membriiFamilie.map(item => item.id === editingId ? res.data : item));
                 alert(`✅ Datele lui ${prenume} au fost actualizate!`);
               } else {

               //MOD Adaugare
              // Trimitem obiectul către @PostMapping din ParticipantController (FĂRĂ TOKEN ACUM)
              const res = await axios.post('http://localhost:8080/participanti', nouParticipant);

              // Actualizare lista vizuală live
              setMembriiFamilie([...membriiFamilie, res.data]);
              alert(`✅ ${prenume} a fost adăugat(ă) cu succes în familia ta!`);
              }

              // Resetare formularul și îl ascundem
              setNume(''); setPrenume(''); setDataNasterii(''); setGen(''); setAlergii(''); setProblemeMedicale(''); setTelefon(''); setContactUrgenta('');
              setShowForm(false);
              setIsEditing(false);
               setEditingId(null);
            } catch (error) {
              console.error("Eroare la salvarea participantului:", error);
              alert("A apărut o eroare la salvarea membrului.");
            }

      };

  // Funcția care se apelează când apeși butonul "Anulează"
  const handleStergere = async (idInscriere) => {
      // Fereastra pop-up nativă din browser care te întreabă dacă ești sigur
      const confirmare = window.confirm("Ești sigur(ă) că vrei să anulezi această înscriere? Locul va fi eliberat.");

      if (confirmare) {
          try {
              // Trimitem cererea către metoda ta deja existentă în Java
              await axios.delete(`http://localhost:8080/inscrieri/stergere/${idInscriere}`);

              // Actualizăm lista pe ecran ca rândul să dispară instantaneu fără să dăm refresh
              // (înlocuiește "inscrieri" și "setInscrieri" cu numele variabilei tale de state dacă e diferit)
              setInscrieri(inscrieri.filter(item => item.id !== idInscriere));

              alert("Înscrierea a fost anulată cu succes!");
          } catch (error) {
              console.error("Eroare la ștergerea înscrierii:", error);
              alert("A apărut o eroare la ștergere.");
          }
      }
  };

/// Stergerea unui membru din familie
const handleStergereMembru = async(idMembru, prenumeMembru)=>{
    const confirmare=window.confirm(`Ești sigur(ă) că vrei să îl/o ștergi pe ${prenumeMembru} din familia ta?`);

    if (confirmare){

       try{
          await axios.delete(`http://localhost:8080/participanti/${idMembru}`);

          //Scoatem membrul din sarea vizuala
          setMembriiFamilie(membriiFamilie.filter(item=>item.id !==idMembru));
          alert("Membrul familiei a fost sters cu succes!");
       }  catch(error)
       {
       console.error("Eroare la ștergerea membrului:", error);
       alert("Eroare la ștergere. E posibil ca membrul să fie înscris deja într-o tabără!");
       }
    }
};

// Pregătește formularul cu datele membrului pentru a fi editat
  const pornesteEditareMembru = (membru) => {
    // Tăiem partea de timp din data nașterii dacă vine formatată lung de la Java (YYYY-MM-DDThh:mm:ss)
    const dataFormatata = membru.dataNasterii ? membru.dataNasterii.split('T')[0] : '';

    setNume(membru.nume || '');
    setPrenume(membru.prenume || '');
    setDataNasterii(dataFormatata);
    setGen(membru.gen || '');
    setAlergii(membru.alergii || '');
    setProblemeMedicale(membru.problemeMedicale || '');
    setTelefon(membru.telefon || '');
    setContactUrgenta(membru.contactUrgenta || '');

    setEditingId(membru.id);
    setIsEditing(true);
    setShowForm(true); // Descheiem formularul automat ca să vadă utilizatorul că editează
  };

  // Anulează starea de editare și curăță formularul
  const anuleazaEditare = () => {
    setNume(''); setPrenume(''); setDataNasterii(''); setGen(''); setAlergii(''); setProblemeMedicale(''); setTelefon(''); setContactUrgenta('');
    setShowForm(false);
    setIsEditing(false);
    setEditingId(null);
  };

  //functia pentru a calcula varsta
  const getDetaliiMembru = (dataNasterii) => {
      const azi = new Date();
      const nastere = new Date(dataNasterii);
      let varsta = azi.getFullYear() - nastere.getFullYear();
      const luna = azi.getMonth() - nastere.getMonth();

      if (luna < 0 || (luna === 0 && azi.getDate() < nastere.getDate())) {
        varsta--;
      }

      return {
        varsta: varsta,
        esteAdult: varsta >= 18,
        emoji: varsta >= 18 ? '🧑' : '👶',
        eticheta: varsta >= 18 ? 'Adult' : 'Copil'
      };
    };

  return(
  <div className="container mt-5">
        {/* HEADER PROFIL */}
        <div className="card shadow p-4 text-center mb-5">
          <h1 className="text-success fw-bold">🏕️ Profilul Meu</h1>
          <p className="lead mt-2 text-muted">Gestionarea contului și a înscrierilor familiei tale.</p>
          <hr />
          <div className="d-flex justify-content-between align-items-center flex-wrap px-3">
            <div className="alert alert-info mb-0 py-2">
              Utilizator curent: <strong>{username}</strong>
            </div>
            <button className="btn btn-danger" onClick={handleLogout}>
              Logout (Ieșire)
            </button>
          </div>
        </div>

        {/* DISPUNERE PE DOUĂ COLOANE */}
        <div className="row g-4">

          {/* COLOANA STÂNGA: ISTORIC ÎNSCRIERI */}
          <div className="col-lg-7">
            <div className="card shadow p-4 h-100">
              <h3 className="mb-4 fw-bold text-secondary">📜 Istoricul înscrierilor</h3>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Tabăra</th>
                      <th>Data Înscriere</th>
                      <th>Sumă</th>
                      <th>Status</th>
                      <th>Acțiuni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inscrieri.length > 0 ? (
                      inscrieri.map((ins) => (
                        <tr key={ins.id} className="align-middle">
                          <td className="fw-bold text-dark">{ins.numeTabara}</td>
                          <td>{new Date(ins.dataInscriere).toLocaleDateString()}</td>
                          <td><span className="text-success fw-bold">{ins.suma} RON</span></td>
                          <td>
                            <span className={`badge ${ins.statusPlata === 'PLATIT' ? 'bg-success' : 'bg-warning text-dark'}`}>
                              {ins.statusPlata}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-outline-danger fw-bold" onClick={() => handleStergere(ins.id)}>
                              ❌ Anulează
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="text-center text-muted py-4">Nu ai efectuat nicio înscriere până acum.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* COLOANA DREAPTA: MEMBRII FAMILIEI (HOUSEHOLDERS) */}
          <div className="col-lg-5">
            <div className="card shadow p-4 h-100 border-start border-success border-3">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold text-success mb-0">👨‍👩‍👧‍👦 Familia mea</h3>
                <button
                  className={`btn btn-sm ${showForm ? 'btn-secondary' : 'btn-success'} fw-bold`}
                  onClick={() => setShowForm(!showForm)}
                >
                  {showForm ? 'Ascunde' : '➕ Adaugă'}
                </button>
              </div>

              {/* FORMULARUL DE ADĂUGARE/EDITARE (Apare doar când dai click pe Adaugă/Editare) */}
              {showForm && (
                <form onSubmit={handleAdaugaMembru} className="bg-light p-3 rounded mb-4 border shadow-sm">
                   <h5 className={`mb-3 fw-bold ${isEditing ? 'text-warning' : 'text-primary'}`}>
                     {isEditing ? '✏️ Editează membru familie' : 'Date membru nou'}
                   </h5>
                  <div className="row g-2">
                    <div className="col-6 mb-2">
                      <label className="form-label small mb-1">Nume *</label>
                      <input type="text" className="form-control form-control-sm" value={nume} onChange={e => setNume(e.target.value)} required />
                    </div>

                    <div className="col-6 mb-2">
                      <label className="form-label small mb-1">Prenume *</label>
                      <input type="text" className="form-control form-control-sm" value={prenume} onChange={e => setPrenume(e.target.value)} required />
                    </div>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small mb-1">Data Nașterii *</label>
                    <input type="date" className="form-control form-control-sm" value={dataNasterii} onChange={e => setDataNasterii(e.target.value)} required />
                  </div>

                  <div className="mb-2">
                   <label className="form-label small mb-1">Gen *</label>
                    <select className="form-select form-select-sm" value={gen} onChange={e => setGen(e.target.value)} required>
                       <option value="">Selectează...</option>
                       <option value="M">Masculin (M)</option>
                       <option value="F">Feminin (F)</option>
                     </select>
                  </div>

                  <div className="mb-2">
                    <label className="form-label small mb-1">Alergii (dacă există)</label>
                    <input type="text" className="form-control form-control-sm" placeholder="ex: Alun, Lactoză" value={alergii} onChange={e => setAlergii(e.target.value)} />
                  </div>

                  <div className="mb-2">
                    <label className="form-label small mb-1">Probleme Medicale</label>
                    <input type="text" className="form-control form-control-sm" placeholder="ex: Astm, Diabet" value={problemeMedicale} onChange={e => setProblemeMedicale(e.target.value)} />
                  </div>

                  <div className="mb-2">
                   <label className="form-label small mb-1">Telefon personal (sau al părintelui) *</label>
                    <input type="text" className="form-control form-control-sm" placeholder="ex: 07xx xxx xxx" value={telefon} onChange={e => setTelefon(e.target.value)} required />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small mb-1">Contact Urgență (Telefon) *</label>
                    <input type="text" className="form-control form-control-sm" placeholder="ex: 07xx xxx xxx" value={contactUrgenta} onChange={e => setContactUrgenta(e.target.value)} required />
                  </div>
                 <div className="d-flex gap-2">
                 <button type="submit" className={`btn btn-sm w-100 fw-bold py-2 ${isEditing ? 'btn-warning text-dark' : 'btn-primary'}`}>
                {isEditing ? '💾 Salvează Modificările' : '💾 Salvează în Familie'}
                  </button>
                  {isEditing && (
                   <button type="button" className="btn btn-sm btn-outline-secondary py-2" onClick={anuleazaEditare}>
                    Anulează
                    </button>
                   )}
                      </div>
                   </form>
              )}

     {/* LISTA VIZUALĂ CU MEMBRII EXISTENȚI */}
                 <div className="list-group list-group-flush" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                   {membriiFamilie.length > 0 ? (
                     membriiFamilie.map((membru) => {
                       // AICI SE APELEAZA FUNCTIA DE CALCUL PENTRU A SCHIMBA ICONITELE SI TEXTUL
                       const detalii = getDetaliiMembru(membru.dataNasterii);

                       return (
                       <div key={membru.id} className="list-group-item px-0 py-3 d-flex align-items-center justify-content-between">
                         <div className="d-flex align-items-center">
                           <div className={`${detalii.esteAdult ? 'bg-primary' : 'bg-success'} text-white rounded-circle d-flex align-items-center justify-content-center me-3`} style={{ width: '40px', height: '40px', fontSize: '18px' }}>
                             {detalii.emoji}
                           </div>
                           <div>
                             <h6 className="mb-0 fw-bold text-dark">{membru.nume} {membru.prenume}</h6>
                             <small className="text-muted">
                               🎂 {new Date(membru.dataNasterii).toLocaleDateString()} ({detalii.varsta} ani)
                             </small>
                           </div>
                         </div>

                         {/* ZONA DE ACȚIUNI: BUTOANE EDIT ȘI DELETE */}
                         <div className="d-flex align-items-center gap-2">
                           {membru.alergii && <span className="badge bg-danger-subtle text-danger rounded-pill small">Alergii</span>}
                           <span className="badge bg-light text-secondary border">{detalii.eticheta}</span>

                           {/* BUTON EDIT */}
                           <button className="btn btn-sm btn-link text-warning p-0 fs-5 shadow-none text-decoration-none" title="Editează membru" onClick={() => pornesteEditareMembru(membru)}  >
                             ✏️
                           </button>

                           {/* BUTON DELETE */}
                           <button
                             className="btn btn-sm btn-link text-danger p-0 fs-5 shadow-none text-decoration-none" title="Șterge din familie" onClick={() => handleStergereMembru(membru.id, membru.prenume)} >
                             🗑️
                           </button>
                         </div>
                       </div>
                     );
                    })
                   ) : (
                     <div className="text-center py-5 text-muted">
                       <p className="mb-1">Nu ai adăugat niciun membru în familia ta.</p>
                       <small>Apasă pe butonul de mai sus pentru a-ți înregistra copiii.</small>
                     </div>
                   )}
                 </div>

               </div>
             </div>

           </div>
         </div>
       );
     }
export default Profile;