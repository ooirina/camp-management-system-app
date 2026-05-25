import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../../services/api';
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
                navigate('/admin/dashboard'); // Dacă e OK, mergem la pagina principală
                window.location.reload();
            }
        } catch (err) {
            alert("Date de logare incorecte!");
        }
    };

   return (
           <div className="container d-flex justify-content-center align-items-center vh-100">
               {/* Am schimbat culorile în roșu/danger ca să fie clar că e o zonă restricționată */}
               <div className="card p-4 shadow border-danger" style={{width: '400px', borderRadius: '15px' }}>
                   <h2 className="text-center mb-4 text-danger fw-bold">Panou Admin/Coordonator</h2>

                   <form onSubmit={handleSubmit}>
                       <div className="mb-3">
                           <label className="form-label">Adresă Email Instituțională</label>
                           <input type="email" className="form-control" onChange={(e) => setEmail(e.target.value)} placeholder="admin@tabere.ro" required />
                       </div>

                       <div className="mb-3">
                           <label className="form-label">Parolă</label>
                           <input type="password" className="form-control" value={parola} onChange={(e) => setParola(e.target.value)} placeholder="Parolă securizată" required />
                       </div>

                       <button type="submit" className="btn btn-danger w-100 mb-4 fw-bold">Acces Securizat</button>

                       <hr />

                       {/* Am modificat butonul de jos: Dacă s-a rătăcit aici, îl trimitem la logarea normală */}
                       <div className="text-center mt-3">
                           <p className="mb-0" style={{ fontSize: '0.85rem', color: '#666' }}>
                               Ești participant ?
                           </p>
                           <span
                               className="badge bg-primary mt-2"
                               style={{ cursor: 'pointer', padding: '8px 12px' }}
                               onClick={() => navigate('/login')}
                           >
                               Mergi la logarea standard
                           </span>
                       </div>
                   </form>
               </div>
           </div>
       );
   }

   export default AdminLoginPage;