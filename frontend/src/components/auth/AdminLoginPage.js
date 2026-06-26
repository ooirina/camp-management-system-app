import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/api';
import '../../campcore-auth.css';


function AdminLoginPage() {
    const [email, setEmail] = useState('');
    const [parola, setParola] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const loginCredentials={
        email:email,
        parola:parola,
        loginType:"ADMIN"
        };

        try {
            // Trimitem datele la Java prin  AuthService.login
            const data = await AuthService.login(loginCredentials);
            // Verificăm dacă autentificarea a reușit
            if (data.status && data.jwt) {
                localStorage.setItem('userEmail', email);
                localStorage.setItem('token', data.jwt);//salvare token daca nu e deja salvat in Autoservice
                localStorage.setItem('userRole', data.role);// rolul pe care il are deja in bd
                 localStorage.setItem('userId', data.id);//id ul userului
                navigate('/admin-dashboard'); // Dacă e OK, mergem la pagina principală
                window.location.reload();
            }
        } catch (err) {
            alert("Date de logare incorecte!");
        }
    };

    // Funcția pentru logare Google
        const handleGoogleLogin = () => {
            window.location.href = "http://localhost:8080/oauth2/authorization/google";
        };

   return (
<div className="cc-auth-bg-admin">
        {/*  culorile în roșu/danger ca să fie clar că e o zonă restricționată */}
        <div className="cc-auth-card-admin">
            <span className="cc-icon-top">🔐</span>
            <div className="cc-auth-brand-admin">Zonă Restricționată</div>
            <h2 className="cc-auth-title-admin">Panou Admin/Coordonator</h2>

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="cc-label">Adresă Email Instituțională</label>
                    <input type="email" className="cc-input cc-input-admin" onChange={(e) => setEmail(e.target.value)} placeholder="admin@tabere.ro" required />
                </div>

                <div className="mb-3">
                    <label className="cc-label">Parolă</label>
                    <input type="password" className="cc-input cc-input-admin" value={parola} onChange={(e) => setParola(e.target.value)} placeholder="Parolă securizată" required />
                </div>

                <button type="submit" className="cc-btn-danger mb-3">Acces Securizat</button>

                <div className="cc-divider">sau</div>
                {/* Buton Google */}
                <div className="text-center mb-3">
                   <button type="button" onClick={handleGoogleLogin} className="cc-btn-google">
                       <svg width="18" height="18" viewBox="0 0 48 48">
                           <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                           <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                           <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                           <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                       </svg>
                       Continuă cu Google
                   </button>
                </div>
                {/* Buton Am uitat parola */}
                <div className="text-center mt-3">
                    <button type="button" onClick={() => window.location.href='/forgot-password'} className="cc-btn-pill">
                        Am uitat parola
                    </button>
                </div>
                {/* Am modificat butonul de jos: Dacă s-a rătăcit aici, îl trimitem la logarea normală */}
                <div className="text-center mt-3">
                    <p className="mb-0" style={{ fontSize: '0.85rem', color: '#666' }}>
                        Ești participant ?
                    </p>
                    <span className="cc-badge-primary mt-2" style={{ cursor: 'pointer', padding: '8px 12px' }} onClick={() => navigate('/login')}>
                        Mergi la logarea standard
                    </span>
                </div>
            </form>
        </div>
    </div>
);
   }

   export default AdminLoginPage;