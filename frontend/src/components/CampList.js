import React, { useState, useEffect } from 'react';
import { campService } from '../services/api';
import { Link } from 'react-router-dom';

const CampList = () => {
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCamps = async () => {
            try {
                const response = await campService.getAll(); // se apeleaza /tabere/lista
                setCamps(response.data);
                setLoading(false);
            } catch (err) {
                setError('Eroare la incarcarea taberelor!');
                setLoading(false);
            }
        };
        fetchCamps();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Sigur vrei sa stergi aceasta tabara?")) {
            try {
                await campService.delete(id);
                // se actualizeaza lista pe ecran dupa stergere
                setCamps(camps.filter(camp => camp.id !== id));
            } catch (err) {
                alert("Nu s-a putut sterge tabara!");
            }
        }
    };

    if (loading) return <div className="text-center mt-5">Se incarca taberele</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>⛺ Lista Tabere</h2>
                <Link to="/tabere/new" className="btn btn-success">
                    Adaugă Tabără Nouă
                </Link>
            </div>

            <table className="table table-hover shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Nume</th>
                        <th>Locație</th>
                        <th>Capacitate</th>
                        <th>Acțiuni</th>
                    </tr>
                </thead>
                <tbody>
                    {camps.length === 0 ? (
                        <tr>
                            <td colSpan="5" className="text-center">Nu există tabere înregistrate.</td>
                        </tr>
                    ) : (
                        camps.map(tabara => (
                            <tr key={tabara.id}>
                                <td>{tabara.id}</td>
                                <td>{tabara.nume}</td>
                                <td>{tabara.locatie}</td>
                                <td>{tabara.capacitate}</td>
                                <td>
                                    <Link to={`/tabere/${tabara.id}`} className="btn btn-sm btn-info me-2">Detalii</Link>
                                    <button onClick={() => handleDelete(tabara.id)} className="btn btn-sm btn-danger">Șterge</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default CampList;