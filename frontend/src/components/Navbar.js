import React, {useState, useEffect} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';


const Navbar = () => {

const [showLoginMenu,setShowLoginMenu]=useState(false);
const token = localStorage.getItem('token');
const navigate =useNavigate();
const userEmail=localStorage.getItem('userEmail');
const userRole=localStorage.getItem('userRole');

const location = useLocation();//sa stie navbar unde se afla utiloizatorul pt a reciti memoria localStorage sa verifice daca sunt mesaje noi

// Starea pentru a ști dacă aprindem bulina de notificare la "mailbox"
    const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);
    const activeCampId = localStorage.getItem('tabaraActivaId');

let caleCatreProfil='/user-profile';
if(userRole ==='2')
caleCatreProfil='/coordonator-profile';
if(userRole ==='1')
caleCatreProfil='/admin-profile';


useEffect(()=>{
   //daca nu este intr-o tabara (prezenta/selectata intr-o tabara din profil coordonator), nu se cauta mesaje
    if(!activeCampId)
    return;

    const checkUnreadMessages =async() =>{
       try{
          ///aducere mesajele pentru tabara activa
          const response =await axios.get(`http://localhost:8080/anunturi-interne/tabara/${activeCampId}`);
          const messages= response.data;

          if(messages.length >0){
          //luam ID ul celui mai recent mesaj (primul din lista)
                   const latestMessageId = messages[0].id;
          //luam ID-ul ultimei vizite pe avizier din memorie
                    const lastSeenId =localStorage.getItem('lastSeenAnnouncementId');

          //daca n-a intrat niciodata sau mesajul e mai nou decat ultima vizita
                     if(!lastSeenId ||  latestMessageId >parseInt(lastSeenId)){
                      setHasNewAnnouncements(true);

                    }else {
                        setHasNewAnnouncements(false);
                      }
             }

          } catch (error){
              console.error("Eroare la verificarea mesajelor noi:", error);
           }

       };
       //ruleaza functia imediat cum se incarca Navbar ul
      checkUnreadMessages();

      //setare un cronometru invizibil care verifică din nou la fiecare 10 secunde
       const intervalId = setInterval(() => {
                   checkUnreadMessages();
        }, 10000); // 10000 milisecunde = 10 secunde

    // Se curata cronometrul dacă componenta dispare (Good Practice in React)
      return () => clearInterval(intervalId);

}, [activeCampId, location.pathname]);// se ruleaza cand se incarca Navbar-ul sau se schimba tabara

///logica de logare
const handleLogout=()=>{
  localStorage.clear();
  navigate('login');
  window.location.reload();
};
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/">🏕️ CampManager</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/tabere">Tabere</Link>
            </li>
            <li className="nav-item">
                <Link className="nav-link" to="/harta">
                    <i className="bi bi-map-fill me-1"></i> Hartă Tabere
                </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/activitati">Activități</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/participanti">Participanți</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cazare">🏠 Management Cazare</Link>
              </li>
            <li className="nav-item">
               <Link className="nav-link" to="/prezenta">Prezenta</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/inscrieri">Înscrieri</Link>
            </li>
            <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown">
                    ⚙️ Admin
                </a>
                <ul className="dropdown-menu">
                    <li><Link className="dropdown-item" to="/admin/adauga-tabara">Adaugă Tabără</Link></li>
                    <li><Link className="dropdown-item" to="/admin/adauga-traseu">Adaugă Traseu</Link></li>
                </ul>
            </li>

             <li className="nav-item">
               <Link className="nav-link fw-bold" to="/broadcast">
                 Comunicare
               </Link>
             </li>

            <li className="nav-item">
                    <Link className="nav-link" to="/register">Înregistrare</Link>
                </li>

           <li className="nav-item ms-3">
               <Link to="/avizier-staff" className="nav-link position-relative text-warning" title="Avizier Staff">
                   {/* Iconița de clopoțel  */}
                     🔔

                   {/* Bulina roșie - apare DOAR dacă hasNewAnnouncements este true */}
                   {hasNewAnnouncements && (
                       <span className="position-absolute top-25 start-75 translate-middle p-1 bg-danger border border-light rounded-circle" style={{ width: '10px', height: '10px' }}>
                           <span className="visually-hidden">Anunțuri noi</span>
                       </span>
                   )}
               </Link>
           </li>
           {/* <li className="nav-item ms-lg-3">
              <Link className="btn btn-primary btn-sm mt-1" to="/inscrieri/nou">
                ➕ Înscriere Nouă
              </Link>
            </li>*/}

            {!token?(
            <li className="nav-item dropdown ms-lg-3">
              <button className="btn btn-primary btn-sm dropdown-toggle" type="button" onClick={() => setShowLoginMenu(!showLoginMenu)} aria-expanded={showLoginMenu}>
                 Logare
              </button>

         {/*  meniu la login care coboara cu cele 2 optiuni */}
               <ul className={`dropdown-menu dropdown-menu-end shadow ${showLoginMenu ? 'show' : ''}`}
                                 style={{ position: 'absolute', right: 0 }}>
                               <li>
                                 <Link className="dropdown-item py-2" to="/login" onClick={() => setShowLoginMenu(false)}>
                                   <strong>Logare in User Hub</strong><br/>
                                   <small className="text-muted">Pentru participanți și părinți</small>
                                 </Link>
                               </li>
                               <li><hr className="dropdown-divider" /></li>
                               <li>
                                 <Link className="dropdown-item py-2" to="/admin-login" onClick={() => setShowLoginMenu(false)}>
                                   <span className="text-danger fw-bold">Logare in Admin Hub</span><br/>
                                   <small className="text-muted">Pentru coordonatori si admin</small>
                                 </Link>
                               </li>
                             </ul>
                           </li>

                           ):(
                           <>
                                 <li className="nav-item ms-lg-4">
                                     {/* {caleCatreProfil} în loc de "/profile" pentru a stii ce tip de profil sa afiseze */}
                                     <Link className="nav-link active fw-bold text-info" to={caleCatreProfil}>
                                         Profilul meu
                                     </Link>
                                 </li>
                                 <li className="nav-item ms-lg-2">
                                     <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
                                         Logout
                                     </button>
                                 </li>
                              </>
                      )}

          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;