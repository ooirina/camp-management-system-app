import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/api';
function LoginPage() {
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
         const loginCredentials = {
                 email: email,
                 parola: parola,
                 loginType: "USER"
             };

        try {
            // Trimitem datele la Java prin  AuthService.login
            const data = await AuthService.login(loginCredentials);

            if (data.status && data.jwt) {
                localStorage.setItem('userEmail', email);
                localStorage.setItem('token', data.jwt);//salvare token daca nu e deja salvat in Autoservice
                localStorage.setItem('userRole', data.role);// rolul pe care il are deja in bd
                localStorage.setItem('userId', data.id);//id ul userului
                navigate('/dashboard'); // Dacă e OK, mergem la pagina principală
                window.location.reload();
            }
        } catch (err) {
            alert("Date de logare incorecte!");
        }
    };

    ///functia pentru logare google
    const handleGoogleLogin=()=>{
       window.location.href="http://localhost:8080/oauth2/authorization/google";
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <div className="card p-4 shadow" style={{width: '400px', borderRadius: '15px' }}>
            <h2 className="text-center mb-4">Logare în sistem</h2>
            <form onSubmit={handleSubmit}>
            <div className="mb-3">
                <label className="form-label">Adresă Email</label>
                <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} placeholder="exemplu@mail.com" required />
            </div>
            <div className="mb-3">
               <label className="form-label">Parolă</label>
                <input type="password" className="form-control" value={parola} onChange={(e) => setParola(e.target.value)} placeholder="Parolă" required />
            </div>
                <button type="submit" className="btn btn-primary w-100 mb-3">Intră</button>

           <p className="text-center mb-1" style={{ fontSize: '0.9rem' }}> Nu ai cont {' '}
             <span  style={{ color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}  onClick={() => navigate('/register')}> Înregistrează-te aici </span>
           </p>

           <hr />
             {/*/buton Google  comentariu in jsx*/}
             <div className="text-center mb-3">
             <button type="button" onClick={handleGoogleLogin} className="btn btn-outline-dark style={{ borderRadius: '8px', fontWeight: '500' }}" >
               <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" style={{ width: '18px', marginRight: '10px' }} />
                                           Continuă cu Google
              </button>
            </div>

           <div className="text-center mt-3">
              <p className="mb-0" style={{ fontSize: '0.85rem', color: '#666' }}>
              Ești administrator?
               </p>
               <span
                   className="badge bg-danger" style={{ cursor: 'pointer', padding: '8px 12px' }} onClick={() => navigate('/admin-login') }>
                   Conectează-te aici
               </span>
           </div>

        </form>
        </div>
     </div>
    );
}

export default LoginPage;