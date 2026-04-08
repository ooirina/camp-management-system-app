import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../../services/api';

function RegisterPage(){
      const [email, setEmail]= useState('');
      const [parola, setParola]= useState('');
      const [loading, setLoading]= useState(false);
      const navigate= useNavigate();

      const handleRegister = async (e)=> {
         e.preventDefault();
         setLoading(true);
         try{
             const dateUtilizator={
                    email:email,
                    parola:parola
                    };
                   //id rol e pus de baza automat utilizator 5 ca default
                  await api.post('/autentificare/register', dateUtilizator);
                  alert("Cont creat cu succes! Acum te poți loga.");
                  navigate('/login');//Redirectionare catre login dupa succes
             } catch(err)
             {
                 console.error("Eroare la înregistrare:", err);
                 alert ("Eroare la înregistrare! Verifică dacă email-ul este deja folosit sau dacă serverul Java este pornit. ");

             }finally{
             setLoading(false);
             }

         };

         return(

          <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{ width: '400px', borderRadius: '15px' }}>
            <h2 className="text-center mb-4">Înregistrare User</h2>
            <form onSubmit={handleRegister}>
            <div className="mb-3">
               <label className="form-label">Adresă Email</label>
               <input type="email" className="form-control" value={ email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplu@mail.com" required />
            </div>

            <div className="mb-3" >
                <label className="form-label">Parolă</label>
                    <input type="password" className= "form-control" value={parola} onChange={(e) => setParola(e.target.value)} placeholder="Alege o parolă sigură" required />
            </div>

            <button type="submit" className="btn btn-success w-100 mb-3" disabled={loading}>
             { loading ? 'Se procesează...':'Creează Cont' }
             </button>

             <p className="text-center" style={{ fontSize: '0.9rem' }}>
             Ai deja cont? {' '}
              <span
                 style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
                 onClick={() => navigate('/login')}
                 >
                   Loghează-te aici
                                     </span>
                                 </p>
                             </form>
                         </div>
                     </div>


         );

      }

export default RegisterPage;


