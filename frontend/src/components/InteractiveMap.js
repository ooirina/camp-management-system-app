import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// marker icons - Importuri critice pentru a vedea pinii
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix pentru iconițele Leaflet care dispar în React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const InteractiveMap = ({ camps, onLocationSelect }) => {
    // functie pentru conversia "lat,lng,lat,lng" string in format Leaflet array
    const parseCoordinates = (coordString) => {
        if (!coordString) return [];
        return coordString.split(';').map(pair => {
            const [lat, lng] = pair.split(',');
            if (!lat || !lng) return null;
            return [parseFloat(lat), parseFloat(lng)];
        }).filter(p => p !== null); // prevenire ca harta sa nu dea crash
    };

    // ne asiguram ca camps este un array inainte de mapare
    const safeCamps = Array.isArray(camps) ? camps : [];

    return (
        <div style={{ position: 'relative' }}>
            {/* Legendă plutitoare pe hartă */}
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                zIndex: 1000,
                backgroundColor: 'white',
                padding: '10px',
                borderRadius: '8px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                fontSize: '12px'
            }}>
                <h6 style={{ margin: '0 0 5px 0', fontSize: '14px' }}>Dificultate Traseu</h6>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
                    <div style={{ width: '20px', height: '4px', backgroundColor: 'green', marginRight: '8px' }}></div> Ușor
                </div>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '3px' }}>
                    <div style={{ width: '20px', height: '4px', backgroundColor: 'orange', marginRight: '8px' }}></div> Mediu
                </div>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{ width: '20px', height: '4px', backgroundColor: 'red', marginRight: '8px' }}></div> Greu
                </div>
            </div>

            <MapContainer
                center={[45.9432, 24.9668]} // centrul Romaniei
                zoom={7}
                style={{ height: '600px', width: '100%', borderRadius: '12px' }}
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {safeCamps.map((camp) => (
                    <React.Fragment key={camp.id}>
                        {/* Pin pentru locatiile taberelor - Folosim parseFloat pentru siguranta */}
                        <Marker
                            position={[parseFloat(camp.latitudine), parseFloat(camp.longitudine)]}
                            eventHandlers={{ click: () => onLocationSelect(camp.locatie) }}
                        >
                            <Tooltip sticky>
                                <strong>{camp.nume}</strong><br />
                                Locatie: {camp.locatie}
                            </Tooltip>
                        </Marker>

                        {/* Desenare traseele daca exista */}
                        {camp.trasee && camp.trasee.map(trail => (
                            <Polyline
                                key={trail.id}
                                positions={parseCoordinates(trail.coordonate)}
                                pathOptions={{
                                    color: trail.dificultate.toUpperCase() === 'GREU' ? 'red' :
                                           trail.dificultate.toUpperCase() === 'MEDIU' ? 'orange' : 'green',
                                    weight: 5
                                }}
                            >
                                <Popup>
                                    <div style={{ minWidth: '180px' }}>
                                        <strong style={{ fontSize: '14px' }}>🥾 {trail.nume}</strong><br />
                                        <span style={{ fontSize: '12px', color: '#666' }}>Tabără: {camp.nume}</span><br />
                                        <hr style={{ margin: '6px 0' }} />
                                        <span><strong>Dificultate:</strong> {trail.dificultate}</span><br />
                                        <span><strong>Distanță:</strong> {trail.distantaKm} km</span><br />
                                        <span><strong>Durată estimată:</strong> {trail.durataOre} ore</span><br />
                                        {trail.descriere && (
                                            <>
                                                <hr style={{ margin: '6px 0' }} />
                                                <span style={{ fontSize: '12px', fontStyle: 'italic' }}>{trail.descriere}</span>
                                            </>
                                        )}
                                    </div>
                                </Popup>
                            </Polyline>
                        ))}
                    </React.Fragment>
                ))}
            </MapContainer>
        </div>
    );
};

export default InteractiveMap;