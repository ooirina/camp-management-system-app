import React, { useState, useEffect } from 'react';
import { CampService, ParticipantService, RegistrationService } from '../services/api';

const AddRegistration = () => {
    const [camps, setCamps] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [formData, setFormData] = useState({
        idTabara: '',
        idParticipant: '',
        dataInscriere: new Date().toISOString().split('T')[0], // Data de azi
        statut: 'In asteptare',
        statusPlata: 'Neachitat',
        suma: 0,
        idPlatitor: 1 // Momentan hardcodat până facem login-ul
    });

    useEffect(() => {
        // Încărcăm taberele și copiii pentru a umple listele de selecție (Dropdowns)
        const loadData = async () => {
            const campsRes = await CampService.getAll();
            const partRes = await ParticipantService.getAll();
            setCamps(campsRes.data);
            setParticipants(partRes.data);
        };
        loadData();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await RegistrationService.create(formData);
            alert("Înscriere realizată cu succes!");
        } catch (err) {
            alert("Eroare la înscriere!");
        }
    };

    return (
        <div className="container mt-4 shadow p-4 rounded bg-light">
            <h3>📝 Înscriere Nouă în Tabără</h3>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label>Selectează Tabăra:</label>
                    <select className="form-select" onChange={(e) => setFormData({...formData, idTabara: e.target.value})}>
                        <option value="">--- Alege Tabăra ---</option>
                        {camps.map(c => <option key={c.id} value={c.id}>{c.nume} - {c.pret} RON</option>)}
                    </select>
                </div>

                <div className="mb-3">
                    <label>Selectează Participantul (Copilul):</label>
                    <select className="form-select" onChange={(e) => setFormData({...formData, idParticipant: e.target.value})}>
                        <option value="">--- Alege Copilul ---</option>
                        {participants.map(p => <option key={p.id} value={p.id}>{p.nume} {p.prenume}</option>)}
                    </select>
                </div>

                <div className="mb-3">
                    <label>Sumă de plată:</label>
                    <input type="number" className="form-control" onChange={(e) => setFormData({...formData, suma: e.target.value})} />
                </div>

                <button type="submit" className="btn btn-primary w-100">Confirmă Înscrierea</button>
            </form>
        </div>
    );
};

export default AddRegistration;