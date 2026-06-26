import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../../services/api';

import '../../campcore-auth.css';

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
                 const eroriBackend = err.response?.data;
                 if (eroriBackend && typeof eroriBackend === 'object') {
                     // Backend-ul a trimis erori de validare per camp (ex: {parola: "...", email: "..."})
                     const mesaje = Object.values(eroriBackend).join('\n');
                     alert(mesaje);
                 } else if (typeof eroriBackend === 'string') {
                     alert(eroriBackend);
                 } else {
                     alert("Eroare la înregistrare! Verifică dacă email-ul este deja folosit ! ");
                 }

             }finally{
             setLoading(false);
             }

         };

         ///functia pentru logare google
           const handleGoogleRegister=()=>{
            window.location.href="http://localhost:8080/oauth2/authorization/google";
             };

         return(

         <div className="cc-auth-bg">
                <div className="cc-auth-card">
                    <span className="cc-icon-top">🏕️</span>
                    <div className="cc-auth-brand">CampCore</div>
                    <h2 className="cc-auth-title">Înregistrare cont</h2>
                    <form onSubmit={handleRegister}>
                    <div className="mb-3">
                       <label className="cc-label">Adresă Email</label>
                       <input type="email" className="cc-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemplu@mail.com" required />
                    </div>

                    <div className="mb-3">
                        <label className="cc-label">Parolă</label>
                            <input type="password" className="cc-input" value={parola} onChange={(e) => setParola(e.target.value)} placeholder="Alege o parolă sigură" required />
                    </div>

                    <button type="submit" className="cc-btn-primary mb-3" disabled={loading}>
                     { loading ? 'Se procesează...':'Creează Cont' }
                     </button>
                        {/* Delimitator vizual */}
                        <div className="cc-divider">sau</div>

                        {/* Buton Google */}
                       <div className="text-center mb-3">

                            <button type="button" onClick={handleGoogleRegister} className="cc-btn-google">
                                <svg width="18" height="18" viewBox="0 0 48 48">
                                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                                </svg>
                                Continuă cu Google
                            </button>
                        </div>

                     <p className="cc-text-sm">
                     Ai deja cont? {' '}
                      <span className="cc-link-green" onClick={() => navigate('/login')}>
                           Loghează-te aici
                      </span>
                     </p>
                    </form>
                </div>
            </div>
        );
      }

export default RegisterPage;