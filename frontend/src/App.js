import React from 'react';
// 1. Importăm rutarea (necesară pentru a naviga între pagini)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import axios from 'axios';
// 2. Importăm noua ta componentă creată separat
import CampList from './components/CampList';
import ActivityList from './components/ActivityList';
import UserList from './components/UserList';
import Navbar from './components/Navbar';
import RegistrationList from './components/RegistrationList';
import AddRegistration from './components/AddRegistration';
import ParticipantList from './components/ParticipantList';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/Dashboard';
import RegisterPage from './components/auth/RegisterPage';
import  AdminLoginPage from './components/auth/AdminLoginPage'
import UserProfile from './components/auth/UserProfile';
import CoordonatorProfile from './components/auth/CoordonatorProfile';
import CampDetails from './components/CampDetails';
import AttendancePage from  './components/AttendancePage';
import AccommodationPage from './components/AccommodationPage';
import CheckInOutPage from './components/CheckInOutPage';
import CampsMapPage from './components/CampsMapPage';
import AddCampForm from './components/AddCampForm';
import AddTrailForm from './components/AddTrailForm';
import AdminDashboard from './components/AdminDashboard';
import PanouMedical from './components/PanouMedical';
import 'leaflet/dist/leaflet.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


///in caz ca tokenul expira
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (localStorage.getItem('userEmail') || localStorage.getItem('token')) {
        alert(" Sesiunea a expirat din motive de securitate. Te rugăm să te conectezi din nou!");
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

function App() {
  // OBSERVAȚIE: Am șters useEffect și axios de aici!
  // Datele sunt acum gestionate în interiorul lui CampList.js

 const isAuthenticated = localStorage.getItem('token');
  return (
    <Router>
    <Navbar />
    <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mt-5">
        {/* Putem pune aici un Navbar sau un titlu care să apară pe toate paginile */}
        <h1 className="text-center mb-4">Sistem Gestiune Tabere</h1>

        <Routes>
        {/* Dacă ești logat, mergi la Dashboard. Dacă nu, mergi la Login */}
       //<Route path="/" element ={isAuthenticated ?<Navigate to="/dashboard" /> : <Navigate to ="/login" />}/>


         //oricine poate accesa pagina principala
         <Route path="/dashboard" element={<Dashboard />}/>

          {/* Protejăm ruta de Profil */}
         <Route path="/user-profile" element={isAuthenticated ? <UserProfile /> : <Navigate to="/login" />} />
         <Route path="/coordonator-profile" element={<CoordonatorProfile />} />

         ///Rute publice
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/tabere" element={<CampList />}/>
          <Route path="/activitati" element={<ActivityList />} />
           <Route path="/utilizatori" element={<UserList />} />
           <Route path="/inscrieri" element={<RegistrationList />} />
           <Route path="/inscrieri/nou" element={<AddRegistration />} />
           <Route path="/participanti"element={<ParticipantList />} />
           <Route path="/register" element={<RegisterPage />} />
           <Route path="/camp-details/:id" element={<CampDetails />}/>
           <Route path="/add-registration" element={<AddRegistration />}/>
           <Route path="/prezenta" element={<AttendancePage/>}/>
           <Route path="/cazare" element={<AccommodationPage />} />
           <Route path="/check-in-out" element={<CheckInOutPage />} />
           <Route path="/harta" element={<CampsMapPage />} />
           <Route path="/admin/adauga-tabara" element={<AddCampForm />} />
           <Route path="/admin/adauga-traseu" element={<AddTrailForm />} />
           <Route path="/admin/dashboard" element={<AdminDashboard/>} />
           <Route path="/panou-medical" element={<PanouMedical />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;









/*import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/