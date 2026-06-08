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

//daca avem id tabara, cerem datele ei de la backend
try{
    const token=localStorage.getItem('token');
    ///trimitere catre metoda "dubla" din java controller
    await axios.post('http://localhost:8080/inscrieri/save-completa',formData,{
         headers:{ Authorization:`Bearer ${token}`}


    });
    alert('Înscrierea și Participantul au fost salvați cu succes!');
    navigate('/user-profile');

} catch(err){
console.error(err);
alert('Eroare la salvare. Verifica consola!');
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
    <div className="container mt-5 mb-5">
      <div className="card mx-auto shadow" style={{ maxWidth: '600px' }}>
        <div className="card-header bg-success text-white">
          <h4>Formular Înscriere Tabără: {numeTabara}</h4>
        </div>
        <div className="card-body">

          <form onSubmit={handleSubmit}>

            {/*  DROPDOWN PENTRU AUTO-COMPLETARE */}
            <div className="alert alert-success mb-4">
              <label className="form-label fw-bold">Pentru cine dorești să faci înscrierea?</label>
              <select className="form-select" onChange={handleSelectareMembru}>
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

            <h5>Date Participant </h5>
            <div className="mb-3">
              <label className="form-label">Nume </label>
              <input type="text" name="numeParticipant" className="form-control" value={formData.numeParticipant} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Prenume </label>
              <input type="text" name="prenumeParticipant" className="form-control" value={formData.prenumeParticipant} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label className="form-label">Gen</label>
              <select
                className="form-select"
                name="gen"
                value={formData.gen}
                onChange={handleChange}
                required
              >
                <option value="">-- Selectează genul --</option>
                <option value="M">Masculin</option>
                <option value="F">Feminin</option>
              </select>
            </div>

            <hr />
            <h5>Detalii Înscriere </h5>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Data Nașterii</label>
                <input type="date" name="dataNasterii" className="form-control" value={formData.dataNasterii} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Telefon Contact</label>
                <input type="text" name="telefon" className="form-control" value={formData.telefon} onChange={handleChange} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Alergii (dacă există)</label>
                <textarea name="alergii" className="form-control" rows="2" value={formData.alergii} onChange={handleChange}></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">Probleme Medicale / Observații</label>
                <textarea name="problemeMedicale" className="form-control" rows="2" value={formData.problemeMedicale} onChange={handleChange}></textarea>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Contact Urgență (Nume/Tel)</label>
                <input type="text" name="contactUrgenta" className="form-control" placeholder="exemplu: Mama 07xxxxxxxx" value={formData.contactUrgenta} onChange={handleChange} required />
              </div>
            </div>

            <hr />
            <h5>Detalii Suplimentare </h5>
            <div className="mb-3">
              <label className="form-label">Email (Contul tău)</label>
              <input type="text" className="form-control" value={formData.emailUtilizator} readOnly />
            </div>
            <div className="mb-3">
              <label className="form-label">Sumă de plată (RON)</label>
              <input type="text" className="form-control" value={formData.suma} readOnly />
            </div>

            <button type="submit" className="btn btn-primary w-100">Finalizează Înscrierea</button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AddRegistration;