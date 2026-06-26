import React, {useState, useEffect} from 'react';
import {MapContainer, TileLayer, Polyline, Marker, useMapEvents} from 'react-leaflet';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
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

const EditTrailForm = () => {
     const navigate = useNavigate();
     const { id } = useParams();
     const [points, setPoints]=useState([]);
     const [loading, setLoading] = useState(true);
     const [traseuData, setTraseuData]= useState({
           nume:'',
           dificultate:'USOR',
           distantaKm:'',
           durataOre:'',
           descriere:''
     });

     // Preîncărcăm traseul existent — coordonatele vin ca string "lat,lng;lat,lng"
     useEffect(()=>{
        axios.get(`http://localhost:8080/trasee/lista`)
             .then(res=>{
                const traseu = res.data.find(t => t.id === parseInt(id));
                if (traseu) {
                    setTraseuData({
                        nume: traseu.nume || '',
                        dificultate: traseu.dificultate || 'USOR',
                        distantaKm: traseu.distantaKm || '',
                        durataOre: traseu.durataOre || '',
                        descriere: traseu.descriere || ''
                    });
                    if (traseu.coordonate) {
                        const puncteExistente = traseu.coordonate.split(';').map(pereche => {
                            const [lat, lng] = pereche.split(',').map(Number);
                            return [lat, lng];
                        });
                        setPoints(puncteExistente);
                    }
                }
             })
             .catch(err=>console.error("Eroare la încărcarea traseului",err))
             .finally(() => setLoading(false));
     },[id]);

const formatCoordinates=()=>{
  return points.map(p=>`${p[0]},${p[1]}`).join(';');
};

  const handleSubmit=(e)=>{
     e.preventDefault();
     const payload={
        nume:traseuData.nume,
        dificultate: traseuData.dificultate.toUpperCase(),
        distantaKm:parseFloat(traseuData.distantaKm),
        durataOre:parseFloat(traseuData.durataOre),
        descriere:traseuData.descriere,
        coordonate:formatCoordinates(),
     };
    axios.put(`http://localhost:8080/trasee/actualizare/${id}`, payload)
         .then(()=>{
         alert("Traseu actualizat cu succes!");
         navigate('/trasee');
         })
         .catch(err=>{
            console.error(err);
            alert("Eroare la salvare. Verifică consola (F12).");
         });
  };

  if (loading) {
      return (
          <div className="container mt-5 text-center">
              <div className="spinner-border text-primary" role="status" />
              <p className="text-muted mt-3">Se încarcă traseul...</p>
          </div>
      );
  }

return (
        <div className="container mt-4 border p-4 rounded shadow">
                    <h4>🗺️ Editează Traseu</h4>

                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-4">

                                <input
                                    className="form-control mb-2"
                                    placeholder="Nume Traseu"
                                    value={traseuData.nume}
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
                                <input type="number" step="0.1" className="form-control mb-2" placeholder="Km" value={traseuData.distantaKm} onChange={e => setTraseuData({...traseuData, distantaKm: e.target.value})} />
                                <input type="number" step="0.1" className="form-control mb-2" placeholder="Ore" value={traseuData.durataOre} onChange={e => setTraseuData({...traseuData, durataOre: e.target.value})} />
                                </div>

                                <textarea className="form-control mb-2" placeholder="Descriere (opțional)" rows="2" value={traseuData.descriere} onChange={e => setTraseuData({...traseuData, descriere: e.target.value})}></textarea>

                                <button type="button" className="btn btn-warning mb-2 w-100" onClick={() => setPoints([])}>Șterge Punctele</button>

                                <button type="submit" className="btn btn-primary w-100">
                                    Salvează Modificările ({points.length} puncte)
                                </button>

                                <p className="small mt-2">Instrucțiuni: Dă click pe hartă pentru a adăuga puncte noi traseului existent.</p>
                            </div>

                            <div className="col-md-8">
                                <MapContainer center={points.length > 0 ? points[0] : [46.77, 23.59]} zoom={11} style={{ height: '450px', borderRadius: '8px' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <RouteDrawer points={points} setPoints={setPoints} />
                                    {points.length > 0 && <Polyline positions={points} color="blue" weight={4} dashArray="5, 10" />}
                                    {points.map((p, idx) => <Marker key={idx} position={p} />)}
                                </MapContainer>
                            </div>
                        </div>
                    </form>
                </div>
            );
};
export default EditTrailForm;