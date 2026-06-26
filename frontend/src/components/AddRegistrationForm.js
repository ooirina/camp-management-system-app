import React , {useState, useEffect} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import axios from 'axios';

function AddRegistration(){
const location=useLocation();
const navigate =useNavigate();
const queryParams=new URLSearchParams(location.search);

//luare datele taberei din URL (trimise de CampDetails)
const tabaraId=queryParams.get('tabaraId');
const numeTabara= queryParams.get('numeTabara');
const pretTabara=queryParams.get('pret');

//luare lista membrii familiei
const [membriiFamilie, setMembriiFamilie] = useState([]);

// Erori de validare per camp, primite de la backend (ex: {numeParticipant: "mesaj"})
const [erori, setErori] = useState({});

//datele pt Participant+ datele pentru Inscriere
const [formData, setFormData]=useState({

    idParticipant: null,
    numeParticipant:'',
    prenumeParticipant:'',
    dataNasterii:'',
    telefon:'',
    alergii:'',
    problemeMedicale:'',
    contactUrgenta:'',
    emailUtilizator:localStorage.getItem('userEmail'),
    idTabara: tabaraId,
    suma:pretTabara|| '',//se completeaza automat pretul taberei
    gen:''

});


const handleChange=(e)=>{
   setFormData({...formData,[e.target.name]:e.target.value});
};


const handleSubmit=async(e)=>{
e.preventDefault();
setErori({}); // resetare erori la fiecare trimitere noua

//daca avem id tabara, cerem datele ei de la backend
try{
    const token=localStorage.getItem('token');
    ///trimitere catre metoda "dubla" din java controller
   const response = await axios.post('http://localhost:8080/inscrieri/save-completa',formData,{
         headers:{ Authorization:`Bearer ${token}`}


    });
  //extrage ID-ul inscrierii abia create din raspunsul de la Java
    const inscriereNouaId = response.data.id;

    alert('Înscrierea și Participantul au fost salvați cu succes! Te redirecționăm către suma de plată...');
    navigate(`/checkout/${inscriereNouaId}`);

} catch(err){
console.error(err);
const eroriBackend = err.response?.data;
if (eroriBackend && typeof eroriBackend === 'object') {
    // Backend-ul a trimis erori de validare per camp (ex: nume, telefon, email)
    // Le punem in state ca sa apara rosu, direct sub campul respectiv
    setErori(eroriBackend);
} else if (typeof eroriBackend === 'string') {
    alert(eroriBackend);
} else {
    alert('Eroare la salvare. Verifica consola!');
}
}

};


///incarca pretul real al taberei daca nu a venit din URL
useEffect(()=>{
if(tabaraId){
  axios.get(`http://localhost:8080/tabere/${tabaraId}`)
    .then(res=>{
      //se actualizeaza doar campul suma formData cu pretul din bd
      setFormData(prev=>({...prev,suma:res.data.pret })
      );
  })
     .catch(err=> console.error("Eroare la preluarea prețului:", err));

}

},[tabaraId]);//se executa doar cand tabaraid e disponivil

//Incarcarea familia parintelui la deschiderea paginii
useEffect(()=>{
   const fetchFamilia =async()=>{
     let currentUserId= localStorage.getItem('userId');
     const email= localStorage.getItem('userEmail');

     if(!currentUserId && email){
        try{
          const res =await axios.get(`http://localhost:8080/utilizatori/get_id_user?email=${email}`);
          if(res.data)
          {
          currentUserId= res.data;
          localStorage.setItem('userId', currentUserId);
          }

        } catch (err)
        {
        console.error("Eroare la recuperare ID utilizator:", err);
        }
   }
    if(currentUserId)
    {
     axios.get(`http://localhost:8080/participanti/familie/${currentUserId}`)
     .then(res => setMembriiFamilie(res.data))
     .catch(err => console.error("Eroare la preluarea familiei:", err));
    }
   };
fetchFamilia();
},[]);

///functia cand utilizatorul selecteaza pe cineva din Dropdown
const handleSelectareMembru = (e) => {
    const selectedMembruId = e.target.value;

    if (selectedMembruId === "") {
      // Dacă selectează "Altcineva (Nou)", golim formularul ca să îl scrie manual
      setFormData(prev => ({
        ...prev,
        idParticipant: null,
        numeParticipant: '',
        prenumeParticipant: '',
        dataNasterii: '',
        gen: '',
        alergii: '',
        problemeMedicale: '',
        telefon: '',
        contactUrgenta: ''
      }));
    } else {
      // Dacă alege un copil, îl găsim în lista descărcată și auto-completăm formularul!
      const copilAles = membriiFamilie.find(m => m.id.toString() === selectedMembruId);
      if (copilAles) {
        // Tăiem partea de oră din data nașterii (dacă vine cu T00:00:00 de la Java) ca să o poată citi căsuța <input type="date">
        const dataFormatata = copilAles.dataNasterii ? copilAles.dataNasterii.split('T')[0] : '';

        setFormData(prev => ({
          ...prev,
          idParticipant: copilAles.id,
          numeParticipant: copilAles.nume || '',
          prenumeParticipant: copilAles.prenume || '',
          dataNasterii: dataFormatata,
          gen: copilAles.gen || '',
          alergii: copilAles.alergii || '',
          problemeMedicale: copilAles.problemeMedicale || '',
          telefon: copilAles.telefon || '',
          contactUrgenta: copilAles.contactUrgenta || ''
        }));
      }
    }
  };

 return (
    <div>
           {/* ===== HERO ===== */}
           <div style={{
               background: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 60%, #388e3c 100%)',
               padding: '48px 20px 80px',
               textAlign: 'center'
           }}>
               <p style={{ color: '#a5d6a7', fontSize: '0.8rem', fontWeight: '700', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '8px' }}>
                   🏕️ CampCore — Înscriere
               </p>
               <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', marginBottom: '4px' }}>
                   Înscriere la tabăra
               </h1>
               <p style={{ color: '#c8e6c9', fontSize: '1.1rem', fontWeight: '600' }}>{numeTabara}</p>
           </div>

           <div className="container" style={{ marginTop: '-40px', paddingBottom: '60px' }}>
               <div style={{ maxWidth: '620px', margin: '0 auto' }}>
                   <div style={{
                       background: '#fff',
                       borderRadius: '16px',
                       boxShadow: '0 8px 32px rgba(46,125,50,0.12)',
                       overflow: 'hidden'
                   }}>
                       {/* Header card */}
                       <div style={{ background: '#2e7d32', padding: '20px 28px' }}>
                           <h4 style={{ color: '#fff', fontWeight: '700', margin: 0 }}>
                               Formular Înscriere Tabără: {numeTabara}
                           </h4>
                       </div>

                       <div style={{ padding: '28px' }}>
                           <form onSubmit={handleSubmit}>

                               {/*  DROPDOWN PENTRU AUTO-COMPLETARE */}
                               <div style={{ background: '#f1f8e9', border: '1px solid #c8e6c9', borderRadius: '10px', padding: '16px', marginBottom: '24px' }}>
                                   <label style={{ fontWeight: '700', color: '#1b5e20', fontSize: '0.88rem', marginBottom: '8px', display: 'block' }}>
                                       👨‍👩‍👧 Pentru cine dorești să faci înscrierea?
                                   </label>
                                   <select className="form-select" onChange={handleSelectareMembru}
                                       style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}>
                                       <option value="">➕ Membru nou (Voi completa datele manual)</option>
                                       <optgroup label="Din familia mea">
                                           {membriiFamilie.map(membru => (
                                               <option key={membru.id} value={membru.id}>
                                                   {membru.nume} {membru.prenume}
                                               </option>
                                           ))}
                                       </optgroup>
                                   </select>
                               </div>

                               {/* ===== DATE PARTICIPANT ===== */}
                               <h5 style={{ fontWeight: '700', color: '#1b5e20', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e8f5e9' }}>
                                   Date Participant
                               </h5>

                               <div className="mb-3">
                                   <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Nume</label>
                                   <input type="text" name="numeParticipant"
                                       className={`form-control ${erori.numeParticipant ? 'is-invalid' : ''}`}
                                       style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}
                                       value={formData.numeParticipant} onChange={handleChange} required />
                                   {erori.numeParticipant && <div className="invalid-feedback">{erori.numeParticipant}</div>}
                               </div>

                               <div className="mb-3">
                                   <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Prenume</label>
                                   <input type="text" name="prenumeParticipant"
                                       className={`form-control ${erori.prenumeParticipant ? 'is-invalid' : ''}`}
                                       style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}
                                       value={formData.prenumeParticipant} onChange={handleChange} required />
                                   {erori.prenumeParticipant && <div className="invalid-feedback">{erori.prenumeParticipant}</div>}
                               </div>

                               <div className="mb-3">
                                   <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Gen</label>
                                   <select className="form-select" name="gen"
                                       style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}
                                       value={formData.gen} onChange={handleChange} required>
                                       <option value="">-- Selectează genul --</option>
                                       <option value="M">Masculin</option>
                                       <option value="F">Feminin</option>
                                   </select>
                               </div>

                               <hr style={{ borderColor: '#e8f5e9', margin: '20px 0' }} />

                               {/* ===== DETALII INSCRIERE ===== */}
                               <h5 style={{ fontWeight: '700', color: '#1b5e20', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e8f5e9' }}>
                                   Detalii Înscriere
                               </h5>

                               <div className="row">
                                   <div className="col-md-6 mb-3">
                                       <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Data Nașterii</label>
                                       <input type="date" name="dataNasterii" className="form-control"
                                           style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}
                                           value={formData.dataNasterii} onChange={handleChange} required />
                                   </div>
                                   <div className="mb-3">
                                       <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Telefon Contact</label>
                                       <input type="text" name="telefon"
                                           className={`form-control ${erori.telefon ? 'is-invalid' : ''}`}
                                           style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}
                                           value={formData.telefon} onChange={handleChange} required />
                                       {erori.telefon && <div className="invalid-feedback">{erori.telefon}</div>}
                                   </div>
                                   <div className="mb-3">
                                       <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Alergii (dacă există)</label>
                                       <textarea name="alergii" className="form-control" rows="2"
                                           style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}
                                           value={formData.alergii} onChange={handleChange}></textarea>
                                   </div>
                                   <div className="mb-3">
                                       <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Probleme Medicale / Observații</label>
                                       <textarea name="problemeMedicale" className="form-control" rows="2"
                                           style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}
                                           value={formData.problemeMedicale} onChange={handleChange}></textarea>
                                   </div>
                                   <div className="col-md-6 mb-3">
                                       <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Contact Urgență (Nume/Tel)</label>
                                       <input type="text" name="contactUrgenta" className="form-control"
                                           style={{ borderColor: '#c8e6c9', borderRadius: '8px' }}
                                           placeholder="exemplu: Mama 07xxxxxxxx"
                                           value={formData.contactUrgenta} onChange={handleChange} required />
                                   </div>
                               </div>

                               <hr style={{ borderColor: '#e8f5e9', margin: '20px 0' }} />

                               {/* ===== DETALII SUPLIMENTARE ===== */}
                               <h5 style={{ fontWeight: '700', color: '#1b5e20', marginBottom: '16px', paddingBottom: '8px', borderBottom: '2px solid #e8f5e9' }}>
                                   Detalii Suplimentare
                               </h5>

                               <div className="mb-3">
                                   <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Email (Contul tău)</label>
                                   <input type="text" className="form-control"
                                       style={{ borderColor: '#e5e7eb', borderRadius: '8px', background: '#f9fafb', color: '#6b7280' }}
                                       value={formData.emailUtilizator} readOnly />
                               </div>

                               <div className="mb-4">
                                   <label style={{ fontSize: '0.82rem', fontWeight: '600', color: '#374151', marginBottom: '5px', display: 'block' }}>Sumă de plată (RON)</label>
                                   <div style={{ background: '#f1f8e9', border: '1px solid #c8e6c9', borderRadius: '8px', padding: '12px 14px' }}>
                                       <span style={{ color: '#2e7d32', fontWeight: '800', fontSize: '1.2rem' }}>{formData.suma} RON</span>
                                   </div>
                               </div>

                               <button type="submit"
                                   style={{ background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px', width: '100%', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}>
                                   Finalizează Înscrierea
                               </button>

                           </form>
                       </div>
                   </div>
               </div>
           </div>
       </div>
   );
}
export default AddRegistration;