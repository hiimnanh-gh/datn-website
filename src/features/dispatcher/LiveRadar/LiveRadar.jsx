import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { HCM_CENTER, INCIDENTS_MARKERS } from './data';
import './LiveRadar.css';

// Fix leaflet icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LiveRadar = () => {
  return (
    <div className="h-full w-full relative">
      <div className="absolute top-6 left-6 z-[1000] bg-slate-950/90 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-2xl">
        <h2 className="text-white font-bold tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          LIVE TACTICAL RADAR (TP. HỒ CHÍ MINH)
        </h2>
        <p className="text-[10px] text-slate-400 font-mono mt-1">
          Tracking {INCIDENTS_MARKERS.length} active GPS telemetry channels
        </p>
      </div>
      
      <MapContainer 
        center={HCM_CENTER} 
        zoom={14} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {INCIDENTS_MARKERS.map((marker) => (
          <Marker key={marker.id} position={marker.pos}>
            <Popup className="text-slate-900 font-sans text-xs">
              <div className="space-y-1">
                <div className="font-bold text-red-600 font-mono">{marker.title}</div>
                <div className="font-semibold text-slate-700">Priority: {marker.priority}</div>
                <div className="text-[11px] text-slate-500">{marker.details}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveRadar;
