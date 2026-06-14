import { useSearchParams, useNavigate } from 'react-router-dom';
import React, {useState} from 'react';
import axios from 'axios';

import { toast } from 'react-toastify';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token"); // Aici extragi token-ul din link-ul primit pe mail
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const submit = async (e) => {

        e.preventDefault();
        try{
        await axios.post(`http://localhost:8080/autentificare/reset-password?token=${token}&newPassword=${password}`);
        toast.success("Parola a fost schimbată!");

       //trimitere la logonn dupa o scurta pauza
       setTimeout(() => {
        navigate('/');
         }, 2000);

       } catch (error) {
          toast.error(" Eroare la schimbarea parolei. Token invalid sau expirat.");
       }
    };
    return (
           <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f4f7f6' }}>
                       <div className="card shadow-lg p-5 rounded-4" style={{ width: '400px', border: 'none' }}>
                           <h3 className="text-center mb-4 fw-bold" style={{ color: '#2c3e50' }}>Setează Parola Nouă</h3>
                           <form onSubmit={submit}>
                               <div className="mb-4">
                                   <input
                                       type="password"
                                       className="form-control form-control-lg rounded-pill"
                                       placeholder="Noua parolă"
                                       value={password}
                                       onChange={(e) => setPassword(e.target.value)}
                                       required
                                   />
                               </div>
                               <button type="submit" className="btn btn-lg w-100 rounded-pill shadow-sm text-white"
                                       style={{ backgroundColor: '#27ae60', border: 'none' }}>
                                   Salvează Parola
                               </button>
                           </form>
                       </div>
                   </div>
               );
           };

           export default ResetPassword;