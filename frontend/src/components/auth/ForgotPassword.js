import React, { useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    const handleReset = async (e) => {

        e.preventDefault();
        try {
            await axios.post(`http://localhost:8080/autentificare/forgot-password?email=${email}`);
            alert("Verifică email-ul pentru link-ul de resetare!");
            navigate('/');
        } catch (err) {
            alert("Eroare: Email-ul nu a fost găsit.");
        }
    };

   return (
           <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f4f7f6' }}>
               <div className="card shadow-lg p-5 rounded-4" style={{ width: '400px', border: 'none' }}>
                   <h3 className="text-center mb-4 fw-bold" style={{ color: '#2c3e50' }}>Recuperare Parolă</h3>
                   <p className="text-center text-muted mb-4">
                       Vă rugăm să introduceți adresa de email pentru resetarea parolei.
                   </p>
                   <form onSubmit={handleReset}>
                       <div className="mb-4">
                           <input
                               type="email"
                               className="form-control form-control-lg rounded-pill"
                               placeholder="Adresă Email"
                               onChange={e => setEmail(e.target.value)}
                               required
                           />
                       </div>
                       <button type="submit" className="btn btn-primary btn-lg w-100 rounded-pill shadow-sm" style={{ backgroundColor: '#27ae60', border: 'none' }}>
                           Trimite Link
                       </button>
                       <div className="text-center mt-3">
                           <a href="/" className="text-decoration-none" style={{ color: '#7f8c8d' }}>Înapoi la Logare</a>
                       </div>
                   </form>
               </div>
           </div>
       );
   };
   export default ForgotPassword;