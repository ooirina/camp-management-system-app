import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';


const Navbar = () => {
const [showLoginMenu,setShowLoginMenu]=useState(false);
const token = localStorage.getItem('token');
const navigate =useNavigate();
const userEmail=localStorage.getItem('userEmail');
const userRole=localStorage.getItem('userRole');

let caleCatreProfil='/user-profile';
if(userRole ==='2')
caleCatreProfil='/coordonator-profile';
if(userRole ==='1')
caleCatreProfil='/admin-profile';

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
              <Link className="nav-link text-danger fw-bold" to="/panou-medical">
                Panou Medical
              </Link>
            </li>

            <li className="nav-item">
                    <Link className="nav-link" to="/register">Înregistrare</Link>
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