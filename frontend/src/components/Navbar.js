import React, {useState, useEffect} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import axios from 'axios';


const Navbar = () => {

const [showLoginMenu,setShowLoginMenu]=useState(false);
const token = localStorage.getItem('token');
const navigate =useNavigate();
const userEmail=localStorage.getItem('userEmail');
const userRole=localStorage.getItem('userRole');
const [estePrincipal, setEstePrincipal] = useState(localStorage.getItem('esteCoordonatorPrincipal') === 'true');

const location = useLocation();//sa stie navbar unde se afla utiloizatorul pt a reciti memoria localStorage sa verifice daca sunt mesaje noi

// Resincronizare estePrincipal la fiecare schimbare de pagină, ca Navbar-ul să reflecte
// imediat alegerea tabării active făcută în pagina de profil coordonator
useEffect(() => {
    setEstePrincipal(localStorage.getItem('esteCoordonatorPrincipal') === 'true');
}, [location]);

// Resincronizare și la eveniment custom, declanșat din CoordonatorProfile când se schimbă
// tabăra activă fără să se navigheze efectiv către altă pagină
useEffect(() => {
    const handler = () => {
        setEstePrincipal(localStorage.getItem('esteCoordonatorPrincipal') === 'true');
    };
    window.addEventListener('tabaraActivaSchimbata', handler);
    return () => window.removeEventListener('tabaraActivaSchimbata', handler);
}, []);

// Starea pentru a ști dacă aprindem bulina de notificare la "mailbox"
    const [hasNewAnnouncements, setHasNewAnnouncements] = useState(false);
    const activeCampId = localStorage.getItem('tabaraActivaId');


let caleCatreProfil='/user-profile';
if(userRole ==='2')
caleCatreProfil='/coordonator-profile';
if(userRole ==='1')
caleCatreProfil='/admin-profile';

//verificare mesasje noi
useEffect(()=>{

    if(!activeCampId)
    return;

    const checkUnreadMessages =async() =>{
       try{

          const response =await axios.get(`http://localhost:8080/anunturi-interne/tabara/${activeCampId}`);
          const messages= response.data;

          if(messages.length >0){
                   const latestMessageId = messages[0].id;
                    const lastSeenId =localStorage.getItem('lastSeenAnnouncementId');

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

      checkUnreadMessages();

      //setare un cronometru invizibil
       const intervalId = setInterval(() => {
                   checkUnreadMessages();
        }, 10000);

      return () => clearInterval(intervalId);

}, [activeCampId, location.pathname]);


///logica de logare
const handleLogout=()=>{
  localStorage.clear();
  navigate('login');
  window.location.reload();
};


 const esteAdmin = userRole === '1';
 const esteCoordinator = userRole === '2';
 const esteUser = userRole === '5';



  const areAccesManagement = esteAdmin || (esteCoordinator && estePrincipal);

  const areAccesRapoarteLocale = esteCoordinator && estePrincipal;

  return (
       <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
                   <div className="container">
                       <Link className="navbar-brand fw-bold" to="/">🏕️ CampCore</Link>

                       <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                           <span className="navbar-toggler-icon"></span>
                       </button>

                       <div className="collapse navbar-collapse" id="navbarNav">
                           {/* Tot meniul este aliniat la DREAPTA folosind ms-auto */}
                           <ul className="navbar-nav ms-auto align-items-center">

                               {/* DASHBOARD */}
                               {token && (
                                     <li className="nav-item">
                                         <Link className="nav-link" to="/dashboard">Dashboard</Link>
                                    </li>
                                        )}


                               {/* Dropdown: TABERE */}
                         <li className="nav-item dropdown">
                                                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                                        Tabere
                                                    </a>
                                                    <ul className="dropdown-menu">
                                                        <li><Link className="dropdown-item" to="/tabere">Listă Tabere</Link></li>
                                                        <li><Link className="dropdown-item" to="/harta">🗺️ Hartă Tabere</Link></li>

                                                    </ul>
                                                </li>

                               {/* Dropdown: PARTICIPANȚI & ÎNSCRIERI-doar admin și coordonatori */}
                                {(esteAdmin || esteCoordinator) && (
                                                           <li className="nav-item dropdown">
                                                               <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                                                   Participanți
                                                               </a>
                                                               <ul className="dropdown-menu">
                                                                   <li><Link className="dropdown-item" to="/participanti">Listă Participanți</Link></li>
                                                                   {/* Management înscrieri — doar principal + admin */}
                                                                   {areAccesManagement && (
                                                                   <>
                                                                       <li><Link className="dropdown-item" to="/inscrieri">Management Înscrieri</Link></li>
                                                                      <li><Link className="dropdown-item" to="/waitlist">Gestionare Waitlist</Link></li>
                                                                   </>
                                                                   )}
                                                                   {esteAdmin && (
                                                                       <>
                                                                           <li><hr className="dropdown-divider" /></li>
                                                                           <li><Link className="dropdown-item" to="/adauga-inscriere">Adaugă Înscriere</Link></li>
                                                                           <li><Link className="dropdown-item" to="/register">Înregistrare Nouă</Link></li>
                                                                       </>
                                                                   )}
                                                               </ul>
                                                           </li>
                                                       )}


                               {/* Dropdown: ACTIVITĂȚI -admin si cooordonatori*/}

                               {(esteAdmin || esteCoordinator) && (
                                                           <li className="nav-item dropdown">
                                                               <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                                                   Activități
                                                               </a>
                                                               <ul className="dropdown-menu">
                                                                   <li><Link className="dropdown-item" to="/activitati">Listă Activități</Link></li>
                                                                    <li><Link className="dropdown-item" to="/trasee">Listă Trasee</Link></li>
                                                                   {/* Adaugă activitate — doar principal + admin */}
                                                                   {areAccesManagement && (
                                                                       <>
                                                                           <li><hr className="dropdown-divider" /></li>
                                                                           <li><Link className="dropdown-item" to="/admin/adauga-activitate">Adaugă Activitate</Link></li>
                                                                           <li><Link className="dropdown-item" to="/admin/adauga-traseu">Adaugă Traseu</Link></li>
                                                                       </>
                                                                   )}
                                                               </ul>
                                                           </li>
                                                       )}


                               {/* Dropdown: LOGISTICĂ-doar admin și coordonatori */}
                              {(esteAdmin || esteCoordinator) && (
                                                          <li className="nav-item dropdown">
                                                              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                                                  Logistică
                                                              </a>
                                                              <ul className="dropdown-menu">
                                                                  {/* Prezență și check-in — orice coordonator */}
                                                                  <li><Link className="dropdown-item" to="/prezenta">Prezență</Link></li>
                                                                  <li><Link className="dropdown-item" to="/check-in-out">Check-In / Check-Out</Link></li>
                                                                  <li><Link className="dropdown-item text-danger fw-bold" to="/panou-medical">🏥 Panou Medical</Link></li>
                                                                  {/* Cazare — doar principal + admin */}
                                                                  {areAccesManagement && (
                                                                      <li><Link className="dropdown-item" to="/cazare">🏠 Management Cazare</Link></li>
                                                                  )}
                                                              </ul>
                                                          </li>
                                                      )}


                             {/* RAPOARTE — strict Coordonator Principal */}
                                                     {areAccesRapoarteLocale && (
                                                         <li className="nav-item">
                                                             <Link className="nav-link fw-bold" to="/raport-manager">Rapoarte</Link>
                                                         </li>
                                                     )}

                             {/* BUGET TABARA — strict Coordonator Principal (buget agregat Admin e in alta sectiune) */}
                                                     {areAccesRapoarteLocale && (
                                                         <li className="nav-item">
                                                             <Link className="nav-link fw-bold" to="/buget">💰 Buget</Link>
                                                         </li>
                                                     )}

                               {/* SETĂRI ADMIN (Apare doar dacă rolul este de Admin - ex: '1') */}
                               {esteAdmin && (
                                                           <li className="nav-item dropdown">
                                                               <a className="nav-link dropdown-toggle text-warning" href="#" role="button" data-bs-toggle="dropdown">

                                                                   ⚙️ Admin
                                                               </a>
                                                               <ul className="dropdown-menu">
                                                                   <li><Link className="dropdown-item" to="/admin/utilizatori">Gestiune Utilizatori</Link></li>
                                                                  <li><Link  className="dropdown-item" to="/admin/tabere">Gestiune Tabere</Link></li>
                                                                   <li><Link className="dropdown-item" to="/admin-dashboard">Admin Dashboard</Link></li>
                                                                   <li><Link className="dropdown-item fw-bold text-success" to="/admin/buget-agregat">💰 Buget Agregat (toate taberele)</Link></li>

                                                                      <li><hr className="dropdown-divider" /></li>
                                                                     <li><Link className="dropdown-item" to="/admin/adauga-tabara">Adaugă Tabără</Link></li>

                                                               </ul>
                                                           </li>
                                                       )}

                                 {/* COMUNICARE — doar admin și coordonatori */}
                                                       {(esteAdmin || esteCoordinator) && (
                                                           <li className="nav-item">
                                                               <Link className="nav-link fw-bold" to="/broadcast">Comunicare</Link>
                                                           </li>
                                                       )}

                               {/* AVIZIER — doar logați ca coordonator/admin cu tabără activă */}
                                                       {(esteAdmin || esteCoordinator) && (
                                                           <li className="nav-item ms-lg-3 me-2">
                                                               <Link to="/avizier-staff" className="nav-link position-relative text-warning fs-5" title="Avizier Staff">
                                                                   🔔
                                                                   {hasNewAnnouncements && (
                                                                       <span className="position-absolute top-25 start-75 translate-middle p-1 bg-danger border border-light rounded-circle"
                                                                           style={{ width: '10px', height: '10px' }}>
                                                                           <span className="visually-hidden">Anunțuri noi</span>
                                                                       </span>
                                                                   )}
                                                               </Link>
                                                           </li>
                                                       )}

                               {/* ZONA DE AUTENTIFICARE */}
                                                    {!token ? (
                                                        <li className="nav-item dropdown ms-lg-2">
                                                            <button className="btn btn-primary btn-sm dropdown-toggle mt-1 mt-lg-0"
                                                                onClick={() => setShowLoginMenu(!showLoginMenu)}>
                                                                Logare
                                                            </button>
                                                            <ul className={`dropdown-menu dropdown-menu-end shadow ${showLoginMenu ? 'show' : ''}`}
                                                                style={{ position: 'absolute', right: 0 }}>
                                                                <li>
                                                                    <Link className="dropdown-item py-2" to="/login"
                                                                        onClick={() => setShowLoginMenu(false)}>
                                                                        <strong>Logare in User Hub</strong><br />
                                                                        <small className="text-muted">Pentru participanți și părinți</small>
                                                                    </Link>
                                                                </li>
                                                                <li><hr className="dropdown-divider" /></li>
                                                                <li>
                                                                    <Link className="dropdown-item py-2" to="/admin-login"
                                                                        onClick={() => setShowLoginMenu(false)}>
                                                                        <span className="text-danger fw-bold">Logare in Admin Hub</span><br />
                                                                        <small className="text-muted">Pentru coordonatori si admin</small>
                                                                    </Link>
                                                                </li>
                                                            </ul>
                                                        </li>
                                                    ) : (
                                                        <>
                                                            <li className="nav-item ms-lg-3">
                                                                <Link className="nav-link active fw-bold text-info" to={caleCatreProfil}>
                                                                    Profilul meu
                                                                </Link>
                                                            </li>
                                                            <li className="nav-item ms-lg-2">
                                                                <button className="btn btn-outline-danger btn-sm mt-1 mt-lg-0"
                                                                    onClick={handleLogout}>
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