import React, { useState, useEffect } from 'react';
import { RegistrationService } from '../services/api';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';


const RegistrationList = () => {
    const [registrations, setRegistrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    //filtrare
    const [filtre, setFiltre] = useState({ tabara: 'TOATE', status: 'TOATE', plata: 'TOATE' });

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

    const handleConfirm = async (idInscriere) => {
        try {

            //se extrage tokenul
            const token = localStorage.getItem('token');
            await axios.put(`http://localhost:8080/inscrieri/confirma/${idInscriere}`,{},{
                   headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Înscrierea a fost confirmată cu succes!");

            // Actualizăm tabelul instant
              const response = await RegistrationService.getAll();
               setRegistrations(response.data);
        } catch (error) {
            toast.error("Eroare la confirmare!");
        }
    };

    const handleReject = async (idInscriere) => {
            // Un mic prompt de confirmare pentru a evita click-urile accidentale
            const confirmare = window.confirm("Ești sigur că vrei să respingi această înscriere?");

            if (confirmare) {
                try {
                    const token = localStorage.getItem('token');
                    await axios.put(`http://localhost:8080/inscrieri/respinge/${idInscriere}`,{}, {
                          headers: { Authorization: `Bearer ${token}` }

                    });
                    toast.error("Înscrierea a fost respinsă.");

                    // Refresh automat la listă după respingere/actualzare
                    const response = await RegistrationService.getAll();
                    setRegistrations(response.data);

                } catch (error) {
                    console.error("Eroare la respingere:", error);
                    toast.error("Eroare la respingerea înscrierii!");
                }
            }
        };

    if (loading) return <div className="text-center mt-5">Se încarcă lista de înscrieri...</div>;

//a extrage o listă fără duplicate (pentru dropdown-ul)
     const tabereUnice = [...new Set(registrations.map(r => r.tabara?.nume).filter(Boolean))];

    return (
        <div className="container mt-4">
            <h2 className="mb-4">📋 Management Înscrieri</h2>

            {/*Bara de filtrare*/}
        <div className="row mb-3">
            <div className="col-md-3">
                   <select className="form-select" onChange={(e) => setFiltre({...filtre, tabara: e.target.value})}>
                         <option value="TOATE">Toate Taberele</option>
                              {tabereUnice.map(nume => (
                                   <option key={nume} value={nume}>{nume}</option>
                                 ))}
                      </select>
                 </div>

                <div className="col-md-3">
                    <select className="form-select" onChange={(e) => setFiltre({...filtre, status: e.target.value})}>
                        <option value="TOATE">Toate Statusurile</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMAT">Confirmat</option>
                        <option value="ANULAT">Anulat</option>
                    </select>
                </div>
                <div className="col-md-3">
                    <select className="form-select" onChange={(e) => setFiltre({...filtre, plata: e.target.value})}>
                        <option value="TOATE">Toate Plățile</option>
                        <option value="PLATIT">Plătit</option>
                        <option value="NEPLATIT">Neplătit</option>
                    </select>
                </div>
            </div>


            <table className="table table-hover shadow-sm">
                <thead className="table-dark">
                    <tr>
                        <th>Participant</th>
                        <th>Tabără</th>
                        <th>Sumă</th>
                        <th>Status Plată</th>
                        <th>Statut</th>
                        <th>Acțiuni</th>
                    </tr>
                </thead>

               <tbody>
                   {registrations
                      .filter(reg =>
                          (filtre.tabara === 'TOATE' || reg.tabara?.nume === filtre.tabara) &&
                          (filtre.status === 'TOATE' || reg.statut?.toUpperCase() === filtre.status) &&
                          (filtre.plata === 'TOATE' || reg.statusPlata?.toUpperCase() === filtre.plata)
                      )
                      .map(reg => {

                         const isPending = reg.statut?.trim().toUpperCase() === 'PENDING';
                         const isPlatit = reg.statusPlata?.trim().toUpperCase() === 'PLATIT';

                         return (
                          <tr key={reg.id}>
                              <td>{reg.participant?.nume} {reg.participant?.prenume}</td>
                              <td>{reg.tabara?.nume}</td>
                              <td>{reg.suma} RON</td>
                              <td>
                                  <span className={`badge ${isPlatit ? 'bg-success' : 'bg-warning'}`}>
                                      {reg.statusPlata}
                                  </span>
                              </td>
                              <td>{reg.statut}</td>
                              <td>
                                 <button
                                     className="btn btn-sm btn-info text-white me-1"
                                     onClick={() => navigate(`/admin/inscrieri/${reg.id}`)}
                                 >
                                     🔍 Detalii
                                 </button>

                                  {/* Buton Confirmare */}
                                  {isPending && isPlatit && (
                                      <button className="btn btn-sm btn-success me-1" onClick={() => handleConfirm(reg.id)}>✅</button>
                                  )}

                                  {/* Buton Respingere */}
                                  {isPending && (
                                      <button className="btn btn-sm btn-danger" onClick={() => handleReject(reg.id)}>❌</button>
                                  )}
                              </td>
                          </tr>
                      );
                  })}
              </tbody>
            </table>
        </div>
    );
};

export default RegistrationList;