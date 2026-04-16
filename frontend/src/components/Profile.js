import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Profile(){
  const navigate= useNavigate();
  const [inscrieri, setInscrieri]= useState([]);

  const email= localStorage.getItem('userEmail')||"";//prin localStorage se salveaza la login, am pus "" ca sa fie sigur nu null
  const username=email.includes('@')?email.split('@')[0]:email;

   useEffect(()=>{
     const fetchUserData= async()=>{
     /// se incearca sa se ia ID ul din memoria locala
     let currentUserId=localStorage.getItem('userId');
      //daca nu avem ID, cerem de la backend folosind emailul
     if(!currentUserId && email)
     {
     try {
        const token =localStorage.getItem('token');
        const res=await axios.get(`http://localhost:8080/utilizatori/get_id_user?email=${email}`,
      { headers:{
       'Authorization': `Bearer ${token}`
       }
      } );
        if (res.data){
        currentUserId =res.data;
        localStorage.setItem('userId', currentUserId);
        }
     }catch (err){
     console.error("Nu s-a putut recupera ID-ul utilizatorului:", err);
     }
     }
     ///daca exista ID ul(fie local sau adus) se ia istoricul inscrierilor
   if(currentUserId){
   axios.get(`http://localhost:8080/inscrieri/istoric/${currentUserId}`)
        .then(res=>setInscrieri(res.data))
        .catch(err => console.error("Eroare la preluarea istoricului:",err));
   }
   };
  fetchUserData();
   },[email]);//acest [email] e ca un trigger, declansator, imediat ce avem email, poerneste aceasta functie

 ///logout
  const handleLogout=()=>{
  localStorage.clear();//Sterge tot:email, token, userId
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
           {/*ISTORIC INSCRIERI */}

           <div className="card shadow p-4">
                   <h3 className="mb-4">📜 Istoricul înscrierilor tale</h3>
                   <div className="table-responsive">
                     <table className="table table-hover">
                       <thead className="table-light">
                         <tr>
                           <th>Cod</th>
                           <th>Tabăra</th>
                           <th>Data Înscriere</th>
                           <th>Sumă</th>
                           <th>Status</th>
                         </tr>
                       </thead>
                       <tbody>
                         {inscrieri.length > 0 ? (
                           inscrieri.map((ins) => (
                             <tr key={ins.id}>
                               <td>#{ins.id}</td>
                               <td>Tabăra {ins.idTabara}</td>
                               <td>{new Date(ins.dataInscriere).toLocaleDateString()}</td>
                               <td><strong>{ins.suma} RON</strong></td>
                               <td>
                                 <span className={`badge ${ins.statusPlata === 'PLATIT' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                   {ins.statusPlata}
                                 </span>
                               </td>
                             </tr>
                           ))
                         ) : (
                           <tr>
                             <td colSpan="5" className="text-center text-muted">Nu ai efectuat nicio înscriere până acum.</td>
                           </tr>
                         )}
                       </tbody>
                     </table>
                   </div>
                 </div>

                   </div>
               );
           }

           export default Profile;
