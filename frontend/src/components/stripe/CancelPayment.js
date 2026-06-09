import React from 'react';
import { Link } from 'react-router-dom';

const CancelPayment = () => {
    return (
        <div className="container mt-5 text-center">
            <h2 className="text-danger"> Plata a fost anulată</h2>
            <p>Nu am procesat nicio tranzacție. Poți încerca din nou când ești pregătit.</p>
            <Link to="/" className="btn btn-warning mt-3">Întoarce-te la pagina principală</Link>
        </div>
    );
};
export default CancelPayment;