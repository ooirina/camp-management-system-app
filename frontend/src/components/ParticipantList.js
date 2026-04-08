import React, { useState, useEffect } from 'react';
import { ParticipantService } from '../services/api';

const ParticipantList = () => {
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchParticipants = async () => {
            try {
                const response = await ParticipantService.getAll();
                setParticipants(response.data);
            } catch (err) {
                console.error("Eroare:", err);
                setError("Eroare la încărcare.");
            } finally {
                setLoading(false);
            }
        };
        fetchParticipants();
    }, []);

    if (loading) return <div className="text-center mt-5">Se încarcă...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">👥 Listă Participanți</h2>
            <div className="card shadow-sm">
                <table className="table table-hover mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>Nume</th>
                            <th>Prenume</th>
                            <th>Detalii Medicale</th>
                            <th>Contact</th>
                            <th>Acțiuni</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.length > 0 ? (
                            participants.map(p => (
                                <tr key={p.id}>
                                    <td>{p.nume}</td>
                                    <td>{p.prenume}</td>
                                    <td>{p.alergii || "Fără"}</td>
                                    <td>{p.contactUrgenta}</td>
                                    <td>
                                        <button className="btn btn-sm btn-info me-2">Detalii</button>
                                        <button className="btn btn-sm btn-danger">Șterge</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">Nu există participanți.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ParticipantList;