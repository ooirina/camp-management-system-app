import React from 'react';
import { useNavigate } from 'react-router-dom';

function Profile(){
  const navigate= useNavigate();
  const email= localStorage.getItem('userEmail')||"";//prin localStorage se salveaza la login, am pus "" ca sa fie sigur nu null
  const username=email.includes('@')?email.split('@')[0]:email;
 ///logout
  const handleLogout=()=>{
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  alert("Te-ai delogat cu succes!");
  navigate('/');//era inainte /login

  };

  return(
  <div className="container mt-5">
     <div className="card shadow p-4 text-center">
         <h1 className="text-success">Bine ai venit în Dashboard!</h1>
         <p className="lead mt-3">
         Te-ai logat cu succes în Sistemul de Gestiune Tabere.
         </p>
         <hr />
        <div className="alert alert-info">
           Utilizator curent: <strong>{username}</strong>
           </div>
                           <button className="btn btn-danger mt-4"  onClick={handleLogout} >
                               Logout (Ieșire)
                           </button>
                       </div>
                   </div>
               );
           }

           export default Profile;
