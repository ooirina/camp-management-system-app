import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pentru iconița markerului (să nu fie invizibilă)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const LocationSelector = ({ setPosition }) => {
    useMapEvents({
        click(e) {
            if (e && e.latlng) {
                setPosition([e.latlng.lat, e.latlng.lng]);
            }
        },
    });
    return null;
};

const AddCampForm = () => {
    const [pos, setPos] = useState([45.9432, 24.9668]);
    const [locatieMutata, setLocatieMutata]=useState(false);
    const [formData, setFormData] = useState({
        nume: '',
        locatie: '',
        dataInceput: '',
        dataSfarsit: '',
        capacitate: '',
        pret: '',
        varstaMin: '',
        varstaMax: '',
        tipPublic: '',
        latitudine: 45.9432,
        longitudine: 24.9668
    });

    // 1. Funcția care se ocupă de CLICK-UL pe hartă
    const handleMapClick = (coords) => {
        setPos(coords);
        setLocatieMutata(true);///ca sa stim ca s-a modificat fata de starea initiala
        setFormData(prevState => ({///prevState este starea actuala a formularului
            ...prevState,
            latitudine: coords[0],
            longitudine: coords[1]
        }));
    };

    // 2. Funcția care se ocupă de SCRISUL în input-uri
    const handleChange = (e) => {
        const { name, value } = e.target;//se ia campul nume de xemplu si ce am scris
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        //VAlidare: daca locatia nu a fost mutata,oprim executia
        if (!locatieMutata) {
                alert(" Te rugăm să selectezi locația exactă a taberei pe hartă (dă click pe hartă unde se află tabăra)!");
                return;
                }
        axios.post('http://localhost:8080/tabere/creare', formData, { withCredentials: true })
            .then(res => alert("Tabără adăugată cu succes!"))
            .catch(err => {
                console.error(err);
                alert("Eroare la salvare!");
            });
    };

    return (
        <div className="container mt-4">
            <h3>➕ Adaugă Tabără Nouă</h3>
            <form onSubmit={handleSubmit} className="row">
                <div className="col-md-6">
                    <input name="nume" className="form-control mb-2" placeholder="Nume Tabără" onChange={handleChange} required />
                    <input name="locatie" className="form-control mb-2" placeholder="Oraș/Locație" onChange={handleChange} required />
                    <div className="d-flex gap-2">
                        <input name="dataInceput" type="date" className="form-control mb-2" onChange={handleChange} required />
                        <input name="dataSfarsit" type="date" className="form-control mb-2" onChange={handleChange} required />
                    </div>
                    <div className="d-flex gap-2">
                        <input name="capacitate" type="number" className="form-control mb-2" placeholder="Capacitate" onChange={handleChange} />
                        <input name="pret" type="number" className="form-control mb-2" placeholder="Preț" onChange={handleChange} />
                    </div>
                    <div className="d-flex gap-2">
                        <input name="varstaMin" type="number" className="form-control mb-2" placeholder="Vârstă Min" onChange={handleChange} />
                        <input name="varstaMax" type="number" className="form-control mb-2" placeholder="Vârstă Max" onChange={handleChange} />
                    </div>
                   <label className="small fw-bold text-muted">Cui se adresează tabăra?</label>
                   <select
                       name="tipPublic"
                       className="form-control mb-2"
                       onChange={handleChange}
                       value={formData.tipPublic}
                       required
                   >
                       <option value="">-- Selectează Categoria --</option>
                       <option value="COPII">Copii</option>
                       <option value="ADULTI">Adulți</option>
                       <option value="STUDENTI">Studenți</option>
                       <option value="FAMILIE">Familie</option>
                       <option value="MIXTA">Mixtă / Toate categoriile</option>
                   </select>

                   {/* Container ascuns pentru coordonate */}
                   <div style={{ display: 'none' }}>
                       <input name="latitudine" value={formData.latitudine} readOnly />
                       <input name="longitudine" value={formData.longitudine} readOnly />
                   </div>

                    {/* Indicator vizual UX */}
                    <div className={`alert ${locatieMutata ? 'alert-success' : 'alert-warning'} py-2 small fw-bold`}>
                        {locatieMutata ? (
                            <span>✅ Locație fixată: {formData.latitudine.toFixed(4)}, {formData.longitudine.toFixed(4)}</span>
                        ) : (
                            <span>📍 Click pe hartă pentru a muta pinul în locația corectă!</span>
                        )}
                    </div>


                    <button type="submit" className="btn btn-success w-100 py-2 fw-bold">Salvează Tabăra</button>
                </div>

                <div className="col-md-6">
                    <p className="text-muted mb-1">Dă click pe hartă pentru a fixa locația:</p>
                    <MapContainer center={pos} zoom={6} style={{ height: '450px', borderRadius: '12px', border: '2px solid #ddd' }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationSelector setPosition={handleMapClick} />
                        <Marker position={pos} />
                    </MapContainer>
                </div>
            </form>
        </div>
    );
};

export default AddCampForm;