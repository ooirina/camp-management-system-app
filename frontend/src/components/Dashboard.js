import React, {useEffect} from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function Dashboard (){
const navigate = useNavigate();
const location = useLocation();

useEffect(()=>{
//extragere parametrii din URL
const queryParams=new URLSearchParams(location.search);
const token = queryParams.get('token');
const email = queryParams.get('email');

if(token){
//salvare date in localStorage ca sa le vada Navbarul
localStorage.setItem('token', token);
localStorage.setItem('userEmail', email);
localStorage.setItem('userRole', 'USER');//rol default

//curatare token ul din bara pt a fi curat-prevenire
navigate('/dashboard', {replace:true});

//reincarcare pt ca navbarul sa dedecteze noul localStorage
window.location.reload();

}

}, [location,navigate]);
    return (
        <div className="container">
            <div className="jumbotron p-5 mb-4 bg-light rounded-3 shadow-sm">
                <div className="container-fluid py-5">
                    <h1 className="display-5 fw-bold text-primary">Aventură și Învățare 🏕️</h1>
                    <p className="col-md-8 fs-4">
                        Descoperă cele mai frumoase tabere de vară pentru elevi și studenți.
                        Învață abilități noi, fă-ți prieteni și explorează natura!
                    </p>
                    <Link to="/tabere" className="btn btn-primary btn-lg">
                        Vezi Taberele Disponibile
                    </Link>
                </div>
            </div>

            <div className="row g-4 mt-2">
                <div className="col-md-4">
                    <div className="card h-100 border-0 shadow-sm">
                        <div className="card-body text-center">
                            <div className="fs-1 mb-3">🏔️</div>
                            <h5 className="card-title">Munte</h5>
                            <p className="card-text text-muted">Trasee montane și orientare în natură.</p>
                        </div>
                    </div>
                </div>
                {/* Adaugă mai multe carduri aici... */}
            </div>
        </div>
    );
};

export default Dashboard;