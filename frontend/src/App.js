import React from 'react';
// 1. Importăm rutarea (necesară pentru a naviga între pagini)
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Profile from './components/Profile';

function App() {
  // OBSERVAȚIE: Am șters useEffect și axios de aici!
  // Datele sunt acum gestionate în interiorul lui CampList.js

 const isAuthenticated = localStorage.getItem('token');
  return (
    <Router>
    <Navbar />
      <div className="container mt-5">
        {/* Putem pune aici un Navbar sau un titlu care să apară pe toate paginile */}
        <h1 className="text-center mb-4">Sistem Gestiune Tabere</h1>

        <Routes>
        {/* Dacă ești logat, mergi la Dashboard. Dacă nu, mergi la Login */}
       //<Route path="/" element ={isAuthenticated ?<Navigate to="/dashboard" /> : <Navigate to ="/login" />}/>


         //oricine poate accesa pagina principala
         <Route path="/dashboard" element={<Dashboard />}/>

          {/* Protejăm ruta de Profil */}
         <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />


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