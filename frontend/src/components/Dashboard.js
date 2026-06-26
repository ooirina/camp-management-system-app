import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Extragere parametrii din URL (pentru logarea cu Google)
        const queryParams = new URLSearchParams(location.search);
        const token = queryParams.get('token');
        const email = queryParams.get('email');

        if (token) {
            // Salvare date in localStorage ca sa le vada Navbarul
            localStorage.setItem('token', token);
            localStorage.setItem('userEmail', email);

            // Aducem ID-ul real al userului din backend după email
            // (pentru conturile Google, rolul și ID-ul nu vin în URL, doar tokenul și emailul)
            fetch(`http://localhost:8080/utilizatori/get_id_user?email=${email}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(userId => {
                localStorage.setItem('userId', userId.toString());
                // Aducem și rolul real după ID
                return fetch(`http://localhost:8080/utilizatori/${userId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            })
            .then(res => res.json())
            .then(userData => {
                localStorage.setItem('userRole', userData.idRol?.toString() || '5');
                // Curatare token din bara pt a fi curat - prevenire
                navigate('/dashboard', { replace: true });
                // Reincarcare pt ca navbarul sa detecteze noul localStorage
                window.location.reload();
            })
            .catch(() => {
                // Fallback dacă cererile eșuează — rol default utilizator
                localStorage.setItem('userRole', '5');
                navigate('/dashboard', { replace: true });
                window.location.reload();
            });
        }
    }, [location, navigate]);

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8f9fa' }}>

            {/* HERO SECTION (Inspirat de iCampPro) */}
            <div
                style={{
                    position: 'relative',
                    // Folosim o imagine de înaltă calitate cu tematică de tabără/natură
                    backgroundImage: 'url("https://images.unsplash.com/photo-1537225228614-56cc3556d7ed?q=80&w=2070&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '75vh',
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white'
                }}
            >
                {/* Overlay-ul verde închis / transparent care face textul să iasă în evidență */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(12, 59, 36, 0.80)', // Verdele închis tipic aplicațiilor de management outdoor
                    zIndex: 1
                }}></div>

                <div className="container" style={{ position: 'relative', zIndex: 2 }}>
                    <div className="row align-items-center">
                        {/* Partea Stângă cu Textul și Butonul */}
                        <div className="col-lg-7 text-center text-lg-start mb-5 mb-lg-0">
                            <h1 style={{ fontSize: '3.5rem', fontWeight: '800', lineHeight: '1.2', marginBottom: '20px' }}>
                                Sistem Intuitiv de <br /> Explorare și Gestiune Tabere
                            </h1>
                            <p style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '35px', color: '#e0e0e0', maxWidth: '600px' }}>
                                Indiferent de tipul de tabără pe care îl cauți, platforma noastră face totul rapid și ușor.
                                Descoperă cele mai frumoase locații, gestionează-ți înscrierile și pregătește-te de aventură cu doar câteva click-uri.
                            </p>
                            <Link
                                to="/tabere"
                                className="btn btn-lg shadow"
                                style={{
                                    backgroundColor: '#34a853', // Verdele aprins de la butonul "Schedule a Demo"
                                    color: 'white',
                                    padding: '12px 35px',
                                    borderRadius: '50px', // Buton rotund
                                    fontWeight: 'bold',
                                    border: 'none',
                                    transition: 'transform 0.2s'
                                }}
                            >
                                Explorează Taberele 🏕️
                            </Link>
                        </div>

                        {/* Partea Dreaptă - Element vizual de suport (Efect de sticlă modern) */}
                        <div className="col-lg-5 d-none d-lg-block">
                            <div className="shadow-lg" style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)', // Efect de glassmorphism
                                padding: '40px',
                                borderRadius: '20px',
                                border: '1px solid rgba(255,255,255,0.2)'
                            }}>
                                <h4 className="fw-bold mb-4 border-bottom pb-2">User Hub</h4>
                                <ul className="list-unstyled mb-0" style={{ lineHeight: '2.2', fontSize: '1.1rem' }}>
                                    <li><span className="me-2">✅</span> Căutare inteligentă a ofertelor</li>
                                    <li><span className="me-2">✅</span> Înscriere rapidă și securizată</li>
                                    <li><span className="me-2">✅</span> Istoric complet al participărilor</li>
                                    <li><span className="me-2">✅</span> Comunicare directă cu staff-ul</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECȚIUNEA DE CATEGORII (Minimalistă și curată) */}
            <div className="container py-5 my-4">
                <div className="row text-center mb-4">
                    <div className="col-12">
                        <h2 className="fw-bold" style={{ color: '#0c3b24' }}>Găsește aventura perfectă</h2>
                        <p className="text-muted">Alege dintr-o varietate de experiențe adaptate oricărei vârste.</p>
                    </div>
                </div>

                <div className="row g-4 text-center mt-2">
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <div className="card-body py-5">
                                <div className="fs-1 mb-3">🏔️</div>
                                <h5 className="card-title fw-bold">Aventură Montană</h5>
                                <p className="card-text text-muted">Trasee montane, orientare în natură și tehnici de supraviețuire.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <div className="card-body py-5">
                                <div className="fs-1 mb-3">💻</div>
                                <h5 className="card-title fw-bold">Tech & Inovație</h5>
                                <p className="card-text text-muted">Ateliere de robotică, programare și design digital pentru tineri.</p>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card h-100 border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                            <div className="card-body py-5">
                                <div className="fs-1 mb-3">🎨</div>
                                <h5 className="card-title fw-bold">Artă și Creație</h5>
                                <p className="card-text text-muted">Dezvoltă-ți creativitatea prin pictură, teatru și muzică.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;