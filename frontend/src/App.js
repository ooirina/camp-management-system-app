import React from 'react';
// 1. Importăm rutarea (necesară pentru a naviga între pagini)
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// 2. Importăm noua ta componentă creată separat
import CampList from './components/CampList';
import ActivityList from './components/ActivityList';
import UserList from './components/UserList';

function App() {
  // OBSERVAȚIE: Am șters useEffect și axios de aici!
  // Datele sunt acum gestionate în interiorul lui CampList.js

  return (
    <Router>
      <div className="container mt-5">
        {/* Putem pune aici un Navbar sau un titlu care să apară pe toate paginile */}
        <h1 className="text-center mb-4">Sistem Gestiune Tabere</h1>

        <Routes>
          {/* 3. Când utilizatorul accesează adresa "/", afișăm tabelul din CampList */}
         <Route path="/" element={<CampList />}/>
          <Route path="/tabere" element={<CampList />}/>
          <Route path="/activitati" element={<ActivityList />} />
           <Route path="/utilizatori" element={<UserList />} />
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