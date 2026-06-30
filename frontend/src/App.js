import React from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import axios from 'axios';

import CampList from './components/CampList';
import ActivityList from './components/ActivityList';
import UserList from './components/UserList';
import Navbar from './components/Navbar';
import RegistrationListManagement from './components/RegistrationListManagement';
import AddRegistrationForm from './components/AddRegistrationForm';
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
import ComparePage from './components/ComparePage';
import BroadcastPage from './components/BroadcastPage';
import InternalAnnouncementsPage from './components/InternalAnnouncementsPage';
import Checkout from './components/stripe/Checkout';
import SuccessPayment from './components/stripe/SuccessPayment';
import CancelPayment from './components/stripe/CancelPayment';
import RegistrationDetails from './components/RegistrationDetails';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ActivityForm from  './components/ActivityForm';
import RaportsManager from './components/RaportsManager';
import CampManagement from './components/CampManagement';
import UserDetails from './components/UserDetails';
import AdminProfile from './components/auth/AdminProfile';
import CoordinatorBudgetPage from './components/CoordinatorBudgetPage';
import AdminBudgetPage from './components/AdminBudgetPage';
import CategoryManagement from './components/CategoryManagement';
import WaitlistManagement from './components/WaitlistManagement';
import TrailList from './components/TrailList';
import EditTrailForm from './components/EditTrailForm';
import EditActivityForm from './components/EditActivityForm';

import 'leaflet/dist/leaflet.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import './campcore-auth.css';


//interceptor pentru cereri(se adauga token)
axios.interceptors.request.use(
  (config) => {
    // Luăm token-ul din localStorage
    const token = localStorage.getItem('token');

    // Dacă există token, îl lipim în Header la orice cerere
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

///in caz ca tokenul expira
//se seteaza un "ascultator" pe toate raspunsurile care vin de la backend
axios.interceptors.response.use(
  (response) => {
  //daca totul e ok(ex status 200), se lasa raspunsul sa treaca
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


//Componente de protectie rute
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
    const token    = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token) return <Navigate to="/login" />;
    if (userRole !== '1') return <Navigate to="/dashboard" />;
    return children;
};

//ruta doar pentru utilizatorul user
const UserRoute = ({ children }) => {
    const token    = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token) return <Navigate to="/login" />;
    if (userRole !== '5') return <Navigate to="/admin-dashboard" />;
    return children;
};

const CoordRoute = ({ children }) => {
    // Accesibil de admin și orice coordonator
    const token    = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    if (!token) return <Navigate to="/login" />;
    if (userRole !== '1' && userRole !== '2') return <Navigate to="/dashboard" />;
    return children;
};


const PrincipalRoute = ({ children }) => {
    // Accesibil doar de admin și coordonator principal
    const token         = localStorage.getItem('token');
    const userRole      = localStorage.getItem('userRole');
    const estePrincipal = localStorage.getItem('esteCoordonatorPrincipal') === 'true';
    if (!token) return <Navigate to="/login" />;
    if (userRole === '1') return children;                    // admin trece mereu
    if (userRole === '2' && estePrincipal) return children;   // principal trece
    return <Navigate to="/dashboard" />;
};

function App() {

 const isAuthenticated = localStorage.getItem('token');
  return (
    <Router>
    <Navbar />
    <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mt-5">

        <h1 className="text-center mb-4">Sistem Gestiune Tabere</h1>

        <Routes>
        {/* Dacă ești logat, mergi la Dashboard(user). Dacă nu, mergi la Login */}
                {/* Publice */}
                    <Route path="/"              element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard"     element={<Dashboard />} />
                    <Route path="/login"         element={<LoginPage />} />
                    <Route path="/admin-login"   element={<AdminLoginPage />} />
                    <Route path="/tabere"        element={<CampList />} />
                    <Route path="/harta"         element={<CampsMapPage />} />
                    <Route path="/camp-details/:id" element={<CampDetails />} />
                    <Route path="/register"      element={<RegisterPage />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password"  element={<ResetPassword />} />
                    <Route path="/comparare"     element={<ComparePage />} />
                    <Route path="/activitati"    element={<ActivityList />} />
                    <Route path="/trasee" element={<TrailList />} />

                    {/* Utilizator logat (orice rol) */}
                    <Route path="/user-profile"  element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                    <Route path="/checkout/:id"  element={<PrivateRoute><Checkout /></PrivateRoute>} />
                    <Route path="/success-plata" element={<PrivateRoute><SuccessPayment /></PrivateRoute>} />
                    <Route path="/cancel-plata"  element={<PrivateRoute><CancelPayment /></PrivateRoute>} />

                    {/* User (sau viitor participant)*/}
                     <Route path="/add-registration" element={<UserRoute><AddRegistrationForm /></UserRoute>} />

                    {/* Coordonator și Admin */}
                    <Route path="/coordonator-profile" element={<CoordRoute><CoordonatorProfile /></CoordRoute>} />
                    <Route path="/prezenta"      element={<CoordRoute><AttendancePage /></CoordRoute>} />
                    <Route path="/check-in-out"  element={<CoordRoute><CheckInOutPage /></CoordRoute>} />
                    <Route path="/panou-medical" element={<CoordRoute><PanouMedical /></CoordRoute>} />
                    <Route path="/avizier-staff" element={<CoordRoute><InternalAnnouncementsPage /></CoordRoute>} />
                    <Route path="/broadcast"     element={<CoordRoute><BroadcastPage /></CoordRoute>} />
                    <Route path="/participanti"  element={<CoordRoute><ParticipantList /></CoordRoute>} />
                    <Route path="/admin-dashboard" element={<CoordRoute><AdminDashboard /></CoordRoute>} />
                    <Route path="/admin-profile" element={<CoordRoute><AdminProfile /></CoordRoute>} />

                    {/* Coordonator Principal și Admin */}
                    <Route path="/inscrieri"     element={<PrincipalRoute><RegistrationListManagement /></PrincipalRoute>} />
                    <Route path="/cazare"        element={<PrincipalRoute><AccommodationPage /></PrincipalRoute>} />
                    <Route path="/raport-manager" element={<PrincipalRoute><RaportsManager /></PrincipalRoute>} />
                    <Route path="/buget"          element={<PrincipalRoute><CoordinatorBudgetPage /></PrincipalRoute>} />
                    <Route path="/admin/inscrieri/:id" element={<PrincipalRoute><RegistrationDetails /></PrincipalRoute>} />
                    <Route path="/admin/adauga-activitate" element={<PrincipalRoute><ActivityForm /></PrincipalRoute>} />
                    <Route path="/admin/adauga-traseu" element={<PrincipalRoute><AddTrailForm /></PrincipalRoute>} />
                    <Route path="/waitlist" element={<PrincipalRoute><WaitlistManagement /></PrincipalRoute>} />
                    <Route path="/admin/editeaza-traseu/:id" element={<PrincipalRoute><EditTrailForm /></PrincipalRoute>} />
                    <Route path="/admin/editeaza-activitate/:id" element={<PrincipalRoute><EditActivityForm /></PrincipalRoute>} />

                    {/* Doar Admin */}
                    <Route path="/admin/utilizatori"   element={<AdminRoute><UserList /></AdminRoute>} />
                   <Route path="/utilizatori/:id" element={<AdminRoute><UserDetails /></AdminRoute>} />
                    <Route path="/admin/tabere" element={<AdminRoute><CampManagement /></AdminRoute>} />
                    <Route path="/admin/adauga-tabara" element={<AdminRoute><AddCampForm /></AdminRoute>} />
                    <Route path="/admin/buget-agregat" element={<AdminRoute><AdminBudgetPage /></AdminRoute>} />
                    <Route path="/admin/categorii" element={<AdminRoute><CategoryManagement /></AdminRoute>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;





