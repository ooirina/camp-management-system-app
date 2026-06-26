import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Checkout = () => {

    // se ia ID-ul inscrierii din URL( exemplu checkout/801)
    const { id } = useParams();
    const navigate = useNavigate();
    const [inscriere, setInscriere] = useState(null);

    // incarcare datele inscrierii pentru a le afisa pe ecran
    useEffect(() => {
        const fetchDetalii = async () => {
            try {
                // Asigură-te că ai ruta asta în backend pentru a lua o singură înscriere
                const response = await axios.get(`http://localhost:8080/inscrieri/${id}`);
                setInscriere(response.data);
            } catch (error) {
                console.error("Eroare la încărcare:", error);
                toast.error("Nu am putut încărca detaliile înscrierii.");
            }
        };
        fetchDetalii();
    }, [id]);

    // functia pentru Stripe
    const handlePlataStripe = async () => {
        try {
            // se extrage tokenul
            const token = localStorage.getItem('token');

            // se apeleaza controller-ul Java direct cu Axios
            const response = await axios.post(`http://localhost:8080/plati/creaza-sesiune/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Se extrage link-ul primit de la Stripe și aruncăm utilizatorul pe el
            const stripeUrl = response.data.url;
            window.location.href = stripeUrl;
        } catch (error) {
            console.error("Eroare la inițializarea plății:", error);
            toast.error("Eroare la conectarea cu procesatorul de plăți.");
        }
    };

    if (!inscriere) return <div className="text-center mt-5">Se încarcă detaliile...</div>;

    return (
        <div className="container mt-5 d-flex justify-content-center">
            <div className="card shadow p-4" style={{ width: '400px' }}>
                <h3 className="text-center mb-4">Sumar Înscriere</h3>

                <div className="mb-3">
                    <strong>Participant:</strong> {inscriere.participant?.nume} {inscriere.participant?.prenume}
                </div>
                <div className="mb-3">
                    <strong>Tabăra:</strong> {inscriere.tabara?.nume}
                </div>
                <div className="mb-4">
                    <h4 className="text-success">Total de plată: {inscriere.suma} RON</h4>
                </div>

                <button
                    className="btn btn-primary w-100 fs-5 mb-3"
                    onClick={handlePlataStripe}
                >
                    💳 Plătește cu Cardul
                </button>

                {/* Buton navigare către lista de tabere */}
                <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => navigate('/tabere')}
                >
                    🏕️ Explorează alte tabere
                </button>
            </div>
        </div>
    );
};

export default Checkout;