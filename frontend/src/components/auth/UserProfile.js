import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import QRCode from 'react-qr-code';

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

  const [qrOpen, setQrOpen] = useState(null); // Memorează ID-ul înscrierii pentru care arătăm QR

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

    const handleDownloadFactura = async (idInscriere) => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:8080/inscrieri/factura/${idInscriere}`, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob', // Așteptăm un PDF
          });

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `Factura_${idInscriere}.pdf`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (error) {
          console.error("Eroare la descărcarea facturii:", error);
          alert("A apărut o eroare la descărcarea PDF-ului.");
        }
      };

      const handleFileUpload= async(event, idInscriere)=>{
          const file= event.target.files[0];
          if(!file)
             return;
          //folosire
          const formData =new FormData();
          formData.append("file",file);

          try{
             const token =localStorage.getItem('token');
             await axios.post(`http://localhost:8080/inscrieri/upload-document/${idInscriere}`, formData, {
                  headers:{
                    Authorization:`Bearer ${token}`,
                    'Content-Type':'multipart/form-data'

                   }

             });

             alert("Document medical încărcat cu succes!");
             window.location.reload()//actualizare paginii instanta

          }  catch(error)
             {
                console.error("Eroare la încărcare:", error);
                 alert("A apărut o eroare la încărcarea documentului.");
             }

        }


  return(
   <div style={{ background: '#F8F9FB', minHeight: '100vh', fontFamily: "'Inter', -apple-system, sans-serif" }}>

        {/* ── Profile header bar ── */}
        <div style={{ background: '#fff', borderBottom: '1px solid #E4E7EC', padding: '0 32px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#DCFCE7', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
              {username.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#101828' }}>{username}</div>
              <div style={{ fontSize: '11px', color: '#98A2B3' }}>Contul meu</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
          >
            Deconectare
          </button>
        </div>

        {/* ── Page body ── */}
        <div className="container-fluid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '28px 24px' }}>

          <div className="row g-4">

            {/* ── LEFT: Istoric înscrieri ── */}
            <div className="col-lg-7">
              <div style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: '12px', overflow: 'hidden' }}>

                {/* Card header */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #E4E7EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#101828' }}>Istoricul Înscrierilor</div>
                    <div style={{ fontSize: '13px', color: '#98A2B3', marginTop: '2px' }}>{inscrieri.length} înregistrări</div>
                  </div>
                </div>

                {/* Table */}
                <div className="table-responsive">
                  <table className="table mb-0" style={{ fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#F8F9FB' }}>
                        {['Tabăra', 'Participant', 'Data', 'Sumă', 'Status', 'Acțiuni'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 600, color: '#98A2B3', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #E4E7EC', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {inscrieri.length > 0 ? (
                        inscrieri.map((ins) => (
                          <tr key={ins.id} style={{ borderBottom: '1px solid #F2F4F7' }}>
                            <td style={{ padding: '13px 16px', fontWeight: 600, color: '#101828' }}>{ins.numeTabara}</td>
                            <td style={{ padding: '13px 16px', color: '#2563EB' }}>{ins.numeParticipant} {ins.prenumeParticipant}</td>
                            <td style={{ padding: '13px 16px', color: '#475467' }}>{new Date(ins.dataInscriere).toLocaleDateString()}</td>
                            <td style={{ padding: '13px 16px', fontWeight: 600, color: '#16A34A' }}>{ins.suma} RON</td>
                            <td style={{ padding: '13px 16px' }}>
                              <span style={{ background: ins.statusPlata === 'PLATIT' ? '#DCFCE7' : '#FEF3C7', color: ins.statusPlata === 'PLATIT' ? '#16A34A' : '#D97706', borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: 600 }}>
                                {ins.statusPlata}
                              </span>
                              <div style={{ fontSize: '11px', color: '#98A2B3', marginTop: '3px' }}>
                                {ins.statut === 'CONFIRMAT' ? '✅ Confirmat' : ins.statut}
                              </div>
                            </td>
                            <td style={{ padding: '13px 16px' }}>
                              <div className="d-flex flex-wrap gap-1">
                                {ins.statusPlata === 'NEPLATIT' ? (
                                  <button
                                    onClick={() => navigate(`/checkout/${ins.id}`)}
                                    style={{ padding: '4px 10px', borderRadius: '7px', border: 'none', background: '#16A34A', color: '#fff', fontSize: '12px', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                  >
                                    💳 Plătește
                                  </button>
                                ) : (
                                  <>
                                    <button onClick={() => handleDownloadFactura(ins.id)} style={{ padding: '4px 10px', borderRadius: '7px', border: '1px solid #D0D5DD', background: '#fff', color: '#344054', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                                      📄 Factură
                                    </button>
                                    <button onClick={() => setQrOpen(ins.id)} style={{ padding: '4px 10px', borderRadius: '7px', border: '1px solid #D0D5DD', background: '#fff', color: '#344054', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                                      QR
                                    </button>
                                  </>
                                )}
                                <button onClick={() => handleStergere(ins.id)} style={{ padding: '4px 10px', borderRadius: '7px', border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: '12px', fontWeight: 500, cursor: 'pointer' }}>
                                  Anulează
                                </button>
                                <div className="d-inline-block">
                                  <input type="file" id={`upload-${ins.id}`} style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, ins.id)} accept=".pdf,.jpg,.png" />
                                  <label htmlFor={`upload-${ins.id}`} style={{ padding: '4px 10px', borderRadius: '7px', border: '1px solid #D0D5DD', background: '#fff', color: '#344054', fontSize: '12px', fontWeight: 500, cursor: 'pointer', marginBottom: 0 }}>
                                    ⚕️ Fișă
                                  </label>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" style={{ padding: '48px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '28px', marginBottom: '8px' }}>📋</div>
                            <div style={{ fontWeight: 600, color: '#101828', fontSize: '14px', marginBottom: '4px' }}>Nicio înscriere încă</div>
                            <div style={{ color: '#98A2B3', fontSize: '13px' }}>Înscrierile tale vor apărea aici.</div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── RIGHT: Familia mea ── */}
            <div className="col-lg-5">
              <div style={{ background: '#fff', border: '1px solid #E4E7EC', borderRadius: '12px', overflow: 'hidden' }}>

                {/* Card header */}
                <div style={{ padding: '18px 24px', borderBottom: '1px solid #E4E7EC', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#101828' }}>Familia mea</div>
                    <div style={{ fontSize: '13px', color: '#98A2B3', marginTop: '2px' }}>{membriiFamilie.length} membri înregistrați</div>
                  </div>
                  <button
                    onClick={() => { setShowForm(!showForm); if (showForm) anuleazaEditare(); }}
                    style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: showForm ? '1px solid #D0D5DD' : 'none', background: showForm ? '#fff' : '#16A34A', color: showForm ? '#344054' : '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}
                  >
                    {showForm ? 'Anulează' : '+ Adaugă'}
                  </button>
                </div>

                {/* Form */}
                {showForm && (
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #E4E7EC', background: '#F8F9FB' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: isEditing ? '#D97706' : '#2563EB', marginBottom: '14px' }}>
                      {isEditing ? '✏️ Editează membru' : 'Membru nou'}
                    </div>
                    <form onSubmit={handleAdaugaMembru}>
                      <div className="row g-2">
                        <div className="col-6">
                          <label style={{ fontSize: '12px', fontWeight: 500, color: '#475467', display: 'block', marginBottom: '4px' }}>Nume *</label>
                          <input type="text" className="form-control form-control-sm" style={{ borderRadius: '7px', borderColor: '#D0D5DD', fontSize: '13px' }} value={nume} onChange={e => setNume(e.target.value)} required />
                        </div>
                        <div className="col-6">
                          <label style={{ fontSize: '12px', fontWeight: 500, color: '#475467', display: 'block', marginBottom: '4px' }}>Prenume *</label>
                          <input type="text" className="form-control form-control-sm" style={{ borderRadius: '7px', borderColor: '#D0D5DD', fontSize: '13px' }} value={prenume} onChange={e => setPrenume(e.target.value)} required />
                        </div>
                        <div className="col-6">
                          <label style={{ fontSize: '12px', fontWeight: 500, color: '#475467', display: 'block', marginBottom: '4px' }}>Data Nașterii *</label>
                          <input type="date" className="form-control form-control-sm" style={{ borderRadius: '7px', borderColor: '#D0D5DD', fontSize: '13px' }} value={dataNasterii} onChange={e => setDataNasterii(e.target.value)} required />
                        </div>
                        <div className="col-6">
                          <label style={{ fontSize: '12px', fontWeight: 500, color: '#475467', display: 'block', marginBottom: '4px' }}>Gen *</label>
                          <select className="form-select form-select-sm" style={{ borderRadius: '7px', borderColor: '#D0D5DD', fontSize: '13px' }} value={gen} onChange={e => setGen(e.target.value)} required>
                            <option value="">Selectează...</option>
                            <option value="M">Masculin (M)</option>
                            <option value="F">Feminin (F)</option>
                          </select>
                        </div>
                        <div className="col-12">
                          <label style={{ fontSize: '12px', fontWeight: 500, color: '#475467', display: 'block', marginBottom: '4px' }}>Alergii</label>
                          <input type="text" className="form-control form-control-sm" style={{ borderRadius: '7px', borderColor: '#D0D5DD', fontSize: '13px' }} placeholder="ex: Alune, Lactoză" value={alergii} onChange={e => setAlergii(e.target.value)} />
                        </div>
                        <div className="col-12">
                          <label style={{ fontSize: '12px', fontWeight: 500, color: '#475467', display: 'block', marginBottom: '4px' }}>Probleme Medicale</label>
                          <input type="text" className="form-control form-control-sm" style={{ borderRadius: '7px', borderColor: '#D0D5DD', fontSize: '13px' }} placeholder="ex: Astm, Diabet" value={problemeMedicale} onChange={e => setProblemeMedicale(e.target.value)} />
                        </div>
                        <div className="col-6">
                          <label style={{ fontSize: '12px', fontWeight: 500, color: '#475467', display: 'block', marginBottom: '4px' }}>Telefon *</label>
                          <input type="text" className="form-control form-control-sm" style={{ borderRadius: '7px', borderColor: '#D0D5DD', fontSize: '13px' }} placeholder="07xx xxx xxx" value={telefon} onChange={e => setTelefon(e.target.value)} required />
                        </div>
                        <div className="col-6">
                          <label style={{ fontSize: '12px', fontWeight: 500, color: '#475467', display: 'block', marginBottom: '4px' }}>Contact Urgență *</label>
                          <input type="text" className="form-control form-control-sm" style={{ borderRadius: '7px', borderColor: '#D0D5DD', fontSize: '13px' }} placeholder="07xx xxx xxx" value={contactUrgenta} onChange={e => setContactUrgenta(e.target.value)} required />
                        </div>
                        <div className="col-12 d-flex gap-2 mt-1">
                          <button type="submit" style={{ flex: 1, height: '34px', borderRadius: '8px', border: 'none', background: isEditing ? '#D97706' : '#2563EB', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                            {isEditing ? '💾 Salvează modificările' : '💾 Salvează'}
                          </button>
                          {isEditing && (
                            <button type="button" onClick={anuleazaEditare} style={{ height: '34px', padding: '0 14px', borderRadius: '8px', border: '1px solid #D0D5DD', background: '#fff', color: '#344054', fontSize: '13px', cursor: 'pointer' }}>
                              Anulează
                            </button>
                          )}
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Members list */}
                <div style={{ maxHeight: '440px', overflowY: 'auto' }}>
                  {membriiFamilie.length > 0 ? (
                    membriiFamilie.map((membru) => {
                      const detalii = getDetaliiMembru(membru.dataNasterii);
                      return (
                        <div key={membru.id} style={{ padding: '14px 24px', borderBottom: '1px solid #F2F4F7', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: 38, height: 38, borderRadius: '50%', background: detalii.esteAdult ? '#EFF6FF' : '#DCFCE7', color: detalii.esteAdult ? '#2563EB' : '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '17px', flexShrink: 0 }}>
                              {detalii.emoji}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '13px', color: '#101828' }}>{membru.nume} {membru.prenume}</div>
                              <div style={{ fontSize: '12px', color: '#98A2B3', marginTop: '2px' }}>
                                {new Date(membru.dataNasterii).toLocaleDateString()} · {detalii.varsta} ani
                              </div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {membru.alergii && (
                              <span style={{ background: '#FEE2E2', color: '#DC2626', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>Alergii</span>
                            )}
                            <span style={{ background: '#F2F4F7', border: '1px solid #E4E7EC', borderRadius: '20px', padding: '2px 8px', fontSize: '11px', color: '#475467', fontWeight: 500 }}>
                              {detalii.eticheta}
                            </span>
                            <button title="Editează" onClick={() => pornesteEditareMembru(membru)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px' }}>✏️</button>
                            <button title="Șterge" onClick={() => handleStergereMembru(membru.id, membru.prenume)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '2px' }}>🗑️</button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                      <div style={{ fontSize: '28px', marginBottom: '8px' }}>👨‍👩‍👧‍👦</div>
                      <div style={{ fontWeight: 600, color: '#101828', fontSize: '14px', marginBottom: '4px' }}>Niciun membru adăugat</div>
                      <div style={{ color: '#98A2B3', fontSize: '13px' }}>Apasă pe „+ Adaugă" pentru a înregistra copiii tăi.</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── QR Modal ── */}
        {qrOpen && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
            <div style={{ background: '#fff', borderRadius: '16px', padding: '32px', textAlign: 'center', width: '300px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#101828', marginBottom: '6px' }}>Ecuson Check-in</div>
              <div style={{ fontSize: '13px', color: '#98A2B3', marginBottom: '20px' }}>Prezintă coordonatorului la autocar.</div>
              <div style={{ background: '#F8F9FB', borderRadius: '12px', padding: '20px', display: 'inline-block', marginBottom: '20px' }}>
                <QRCode value={qrOpen.toString()} size={180} />
              </div>
              <button onClick={() => setQrOpen(null)} style={{ width: '100%', height: '38px', borderRadius: '8px', border: 'none', background: '#101828', color: '#fff', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                Închide
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  export default Profile;