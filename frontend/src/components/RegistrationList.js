import React, { useState, useEffect } from 'react';
import { RegistrationService } from '../services/api';

const RegistrationList = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRegistrations = async () => {
            try {
                const response = await RegistrationService.getAll();
                setRegistrations(response.data);
            } catch (err) {
                console.error("Eroare la încărcare înscrieri:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRegistrations();
    }, []);

    if (loading) return <div className="text-center mt-5">Se încarcă lista de înscrieri...</div>;

    return (
        <div className="container mt-4">
            <h2 className="mb-4">📋 Management Înscrieri</h2>
            <table className="table table-hover shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>ID</th>
                        <th>Participant (ID)</th>
                        <th>Tabără (ID)</th>
                        <th>Sumă</th>
                        <th>Status Plată</th>
                        <th>Statut</th>
                        <th>Acțiuni</th>
                    </tr>
                </thead>
                <tbody>
                    {registrations.map(reg => (
                        <tr key={reg.id}>
                            <td>{reg.id}</td>
                            <td>{reg.idParticipant}</td>
                            <td>{reg.idTabara}</td>
                            <td>{reg.suma} RON</td>
                            <td>
                                <span className={`badge ${reg.statusPlata === 'Achitat' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                    {reg.statusPlata}
                                </span>
                            </td>
                            <td>{reg.statut}</td>
                            <td>
                                <button className="btn btn-sm btn-outline-primary me-2">Editează</button>
                                <button className="btn btn-sm btn-outline-danger">Șterge</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default RegistrationList;