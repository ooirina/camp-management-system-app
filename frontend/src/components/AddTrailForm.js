import React, {useState, useEffect} from 'react';
import {MapContainer, TileLayer, Polyline, Marker, useMapEvents} from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon=L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon=DefaultIcon;

const RouteDrawer =({points, setPoints})=>{
   useMapEvents({
          click(e){
               setPoints([...points,[e.latlng.lat, e.latlng.lng]]);
          },
   });
   return null;
};

const AddTrailForm=({ idTabaraSelectata})=>{
     const [points, setPoints]=useState([]);
     const [tabere, setTabere]=useState([]);
     const [traseuData, setTraseuData]= useState({
           nume:'',
           dificultate:'USOR',
           distantaKm:'',
           durataOre:'',
           descriere:'',
           tabaraId:''


     });
///se incarca lista de tabere pentru putea asocia traseul
     useEffect(()=>{
        axios.get('http://localhost:8080/tabere/lista')
             .then(res=> setTabere(res.data))
             .catch(err=>console.error("Eroare la încărcarea taberelor",err));
     },[]);

///Transforamre array-ul de puncte intr-un string;"lat,lng;lat,lng"-transforma automat clickurile in formatul din bd
const formatCoordinates=()=>{
  return points.map(p=>`${p[0]},${p[1]}`).join(';');
};
  const handleSubmit=(e)=>{
     e.preventDefault();
     //construire  playload ul asa cum cere backendul (obiectul tabara)
     const payload={
        nume:traseuData.nume,
        dificultate: traseuData.dificultate.toUpperCase(),
        distantaKm:parseFloat(traseuData.distantaKm),
        durataOre:parseFloat(traseuData.durataOre),
        descriere:traseuData.descriere,
        coordonate:formatCoordinates(),
        tabara:{id:parseInt(traseuData.tabaraId)}//trimitem obiectul cu ID-ul taberei
     };
    axios.post('http://localhost:8080/trasee/creare', payload)
         .then(()=>{
         alert("Traseu desenat și salvat!");
         setPoints([]);//Resetare punctele de pe harta dupa succes
         })
         .catch(err=>console.error(err));
  };
return (
        <div className="container mt-4 border p-4 rounded shadow">
                    <h4>🗺️ Desenează Traseu</h4>

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-4">

                            {/* Select pentru a alege tabăra de care aparține traseul */}
                            <select
                                className="form-control mb-2"
                                required
                                value={traseuData.tabaraId}
                                onChange={e => setTraseuData({...traseuData, tabaraId: e.target.value})}
                            >
                                <option value="">-- Alege Tabăra --</option>
                                {tabere.map(t => (
                                    <option key={t.id} value={t.id}>{t.nume} ({t.locatie})</option>
                                ))}
                            </select>

                                <input
                                    className="form-control mb-2"
                                    placeholder="Nume Traseu"
                                    onChange={e => setTraseuData({...traseuData, nume: e.target.value})}
                                    required
                                />

                                <select
                                    className="form-control mb-2"
                                    value={traseuData.dificultate}
                                    onChange={e => setTraseuData({...traseuData, dificultate: e.target.value})}
                                >
                                    <option value="USOR">Ușor (Verde)</option>
                                    <option value="MEDIU">Mediu (Portocaliu)</option>
                                    <option value="GREU">Greu (Roșu)</option>
                                </select>

                                <div className="d-flex gap-2">
                                <input type="number" step="0.1" className="form-control mb-2" placeholder="Km" onChange={e => setTraseuData({...traseuData, distantaKm: e.target.value})} />
                                <input type="number" step="0.1" className="form-control mb-2" placeholder="Ore" onChange={e => setTraseuData({...traseuData, durataOre: e.target.value})} />
                                </div>

                                <textarea className="form-control mb-2" placeholder="Descriere (opțional)" rows="2" onChange={e => setTraseuData({...traseuData, descriere: e.target.value})}></textarea>

                                <button type="button" className="btn btn-warning mb-2 w-100" onClick={() => setPoints([])}>Șterge Punctele</button>

                                {/* BUTONUL ESTE ACUM DE TIP SUBMIT PENTRU A DECLANSA HANDLESUBMIT DIN FORM */}
                                <button type="submit" className="btn btn-primary w-100">
                                    Salvează Traseul ({points.length} puncte)
                                </button>

                                <p className="small mt-2">Instrucțiuni: Dă click pe hartă succesiv pentru a crea curbele traseului.</p>
                            </div>

                            <div className="col-md-8">
                                <MapContainer center={[46.77, 23.59]} zoom={11} style={{ height: '450px', borderRadius: '8px' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <RouteDrawer points={points} setPoints={setPoints} />
                                    {/* Desenăm linia în timp real pe măsură ce adminul dă click */}
                                    {points.length > 0 && <Polyline positions={points} color="blue" weight={4} dashArray="5, 10" />}
                                    {points.map((p, idx) => <Marker key={idx} position={p} />)}
                                </MapContainer>
                            </div>
                        </div>
                    </form>
                </div>
            );

};
export default AddTrailForm;