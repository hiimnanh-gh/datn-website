import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Play, Check, AlertTriangle, MapPin, Navigation, Clock, User } from 'lucide-react';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Coordinates
const DRIVER_START = [10.768, 106.685];
const INCIDENT_LOC = [10.779, 106.671]; // CM8 Q10
const HOSPITAL_LOC = [10.762, 106.660]; // Cho Ray Hospital

const DriverMission = () => {
  const [status, setStatus] = useState('ASSIGNED'); // ASSIGNED, EN_ROUTE, AT_SCENE, TRANSPORTING, COMPLETED
  const [eta, setEta] = useState('6 mins');
  const [distance, setDistance] = useState('1.8 km');

  // Set up active coordinates for map line
  const polylineCoords = status === 'TRANSPORTING' 
    ? [INCIDENT_LOC, HOSPITAL_LOC] 
    : [DRIVER_START, INCIDENT_LOC];

  const mapCenter = status === 'TRANSPORTING' ? HOSPITAL_LOC : INCIDENT_LOC;

  const getStatusStep = () => {
    switch (status) {
      case 'ASSIGNED': return 1;
      case 'EN_ROUTE': return 2;
      case 'AT_SCENE': return 3;
      case 'TRANSPORTING': return 4;
      case 'COMPLETED': return 5;
      default: return 1;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden text-left">
      {/* Status Bar */}
      <div className="p-4 bg-slate-950/80 border-b border-slate-850 shrink-0">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest">Active Dispatch Ticket</span>
          <span className="bg-red-950 text-red-400 border border-red-900 text-[9px] font-bold px-2 py-0.5 rounded font-mono animate-pulse">CRITICAL</span>
        </div>
        
        {/* Mission Timeline Steps */}
        <div className="flex items-center justify-between text-center relative mt-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-800 -translate-y-1/2 z-0" />
          {[
            { label: 'Assigned', step: 1 },
            { label: 'En Route', step: 2 },
            { label: 'At Scene', step: 3 },
            { label: 'Transport', step: 4 },
            { label: 'Done', step: 5 }
          ].map((s) => {
            const active = getStatusStep() >= s.step;
            return (
              <div key={s.label} className="relative z-10 flex flex-col items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                  active 
                    ? 'bg-amber-600 border-amber-500 text-white font-mono' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 font-mono'
                }`}>
                  {getStatusStep() > s.step ? <Check size={12} /> : s.step}
                </div>
                <span className={`text-[8px] mt-1.5 font-bold uppercase tracking-widest ${active ? 'text-amber-400' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Leaflet Navigation Map */}
      <div className="flex-1 min-h-[220px] bg-slate-950 relative">
        {status !== 'COMPLETED' ? (
          <MapContainer 
            center={mapCenter} 
            zoom={14} 
            className="w-full h-full z-0"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {status !== 'TRANSPORTING' && (
              <Marker position={DRIVER_START}>
                <Popup>Driver Current Location</Popup>
              </Marker>
            )}
            <Marker position={INCIDENT_LOC}>
              <Popup>Incident Scene: Nguyễn Văn Hùng</Popup>
            </Marker>
            {status === 'TRANSPORTING' && (
              <Marker position={HOSPITAL_LOC}>
                <Popup>Destination: Cho Ray Hospital</Popup>
              </Marker>
            )}
            <Polyline positions={polylineCoords} color="#f59e0b" weight={4} dashArray="5, 10" />
          </MapContainer>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-950/40 border border-amber-800 text-amber-400 rounded-full flex items-center justify-center animate-bounce">
              <Check size={36} />
            </div>
            <h2 className="text-lg font-bold font-mono tracking-wider text-white">MISSION COMPLETED</h2>
            <p className="text-xs text-slate-400 max-w-[280px]">
              The rescue team has successfully transported the patient to Cho Ray Hospital. Dispatch records updated.
            </p>
          </div>
        )}

        {/* GPS Navigation HUD Overlay */}
        {status !== 'COMPLETED' && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-950/90 border border-slate-850 p-3 rounded-xl shadow-2xl flex items-center justify-between z-[1000] backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Navigation className="text-amber-400 animate-pulse" size={20} />
              <div>
                <span className="text-[10px] text-slate-500 font-mono block">GPS ROUTING</span>
                <span className="text-xs font-semibold text-white">
                  {status === 'TRANSPORTING' ? 'Heading to Cho Ray Hospital' : 'Route: 123 CM8, District 10'}
                </span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs font-bold text-amber-400 block">{eta}</span>
              <span className="text-[9px] text-slate-400 block">{distance}</span>
            </div>
          </div>
        )}
      </div>

      {/* Mission details panel */}
      {status !== 'COMPLETED' && (
        <div className="p-4 bg-slate-900 border-t border-slate-850 space-y-4 shrink-0">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1"><User size={13} /> Patient:</span>
              <span className="font-bold text-slate-200">Nguyễn Văn Hùng (M55)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1"><MapPin size={13} /> Location:</span>
              <span className="font-bold text-slate-200 text-right max-w-[200px] truncate">123 CM8, Quận 10</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1"><Clock size={13} /> Reported:</span>
              <span className="font-bold text-red-400">Cardiogenic Shock / Unconscious</span>
            </div>
          </div>

          {/* Dynamic action triggers */}
          {status === 'ASSIGNED' && (
            <button 
              onClick={() => {
                setStatus('EN_ROUTE');
                setEta('5 mins');
                setDistance('1.5 km');
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-1.5 uppercase font-mono text-xs"
            >
              <Play size={16} />
              Accept Mission
            </button>
          )}

          {status === 'EN_ROUTE' && (
            <button 
              onClick={() => {
                setStatus('AT_SCENE');
                setEta('Arrived');
                setDistance('0 km');
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-1.5 uppercase font-mono text-xs"
            >
              <MapPin size={16} />
              Confirm Arrival at Scene
            </button>
          )}

          {status === 'AT_SCENE' && (
            <button 
              onClick={() => {
                setStatus('TRANSPORTING');
                setEta('4 mins');
                setDistance('1.2 km');
              }}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-1.5 uppercase font-mono text-xs"
            >
              <Check size={16} />
              Patient Loaded / Route to Hospital
            </button>
          )}

          {status === 'TRANSPORTING' && (
            <button 
              onClick={() => setStatus('COMPLETED')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-98 flex items-center justify-center gap-1.5 uppercase font-mono text-xs"
            >
              <Check size={16} />
              Confirm Handover / Complete Mission
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default DriverMission;
