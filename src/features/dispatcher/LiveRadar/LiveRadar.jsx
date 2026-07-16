import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { dispatcherService } from '../../../services/dispatcherService';
import './LiveRadar.css';

// Fix leaflet icon issue in react
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const incidentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const providerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const HANOI_CENTER = [21.0285, 105.8542];

const LiveRadar = () => {
  const [incidents, setIncidents] = useState([]);
  const [providers, setProviders] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [incRes, resRes] = await Promise.all([
          dispatcherService.getDispatchRequests(),
          dispatcherService.getDispatchResources()
        ]);
        
        if (incRes?.data) {
          const mappedIncidents = incRes.data.map(req => {
             // Mock tọa độ cố định theo ID để không bị nhảy
             const pseudoRandom1 = Math.sin(req.id * 1234.5678) * 0.05;
             const pseudoRandom2 = Math.cos(req.id * 8765.4321) * 0.05;
             const lat = req.latitude || (HANOI_CENTER[0] + pseudoRandom1);
             const lng = req.longitude || (HANOI_CENTER[1] + pseudoRandom2);
             return {
                id: `EMS-${req.id}`,
                pos: [lat, lng],
                title: `EMS-${req.id}: ${req.extendedRequirements?.category || "Medical Emergency"}`,
                priority: req.urgencyLevel || "STANDARD",
                details: `Victim: ${req.call?.victimName || "Unknown"} - ${req.status}`
             };
          });
          setIncidents(mappedIncidents);
        }

        if (resRes?.data) {
          const mappedProviders = resRes.data.map((r) => {
            // Mock tọa độ cố định theo ID để xe cấp cứu không bị nhảy
            const pseudoRandom1 = Math.sin(r.id * 9999.1111) * 0.08;
            const pseudoRandom2 = Math.cos(r.id * 3333.2222) * 0.08;
            const lat = r.latitude || (HANOI_CENTER[0] + pseudoRandom1);
            const lng = r.longitude || (HANOI_CENTER[1] + pseudoRandom2);
            return {
              id: r.id,
              pos: [lat, lng],
              name: `${r.resourceCode} (${r.providerName})`,
              contact: r.currentDriverName || 'Không rõ'
            };
          });
          setProviders(mappedProviders);
        }

      } catch (err) {
        console.error("Lỗi tải data Radar:", err);
      }
    };

    fetchData();
    // Poll every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full relative">
      <div className="absolute top-6 left-6 z-[1000] bg-slate-950/90 backdrop-blur border border-slate-800 p-4 rounded-xl shadow-2xl">
        <h2 className="text-white font-bold tracking-wider flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
          LIVE TACTICAL RADAR (HÀ NỘI CENTER)
        </h2>
        <p className="text-[10px] text-slate-400 font-mono mt-1">
          Tracking {incidents.length} SOS and {providers.length} fleets
        </p>
      </div>
      
      <MapContainer 
        center={HANOI_CENTER} 
        zoom={13} 
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Render Incidents */}
        {incidents.map((marker) => (
          <Marker key={marker.id} position={marker.pos} icon={incidentIcon}>
            <Popup className="text-slate-900 font-sans text-xs">
              <div className="space-y-1">
                <div className="font-bold text-red-600 font-mono">{marker.title}</div>
                <div className="font-semibold text-slate-700">Priority: {marker.priority}</div>
                <div className="text-[11px] text-slate-500">{marker.details}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Providers */}
        {providers.map((prov) => (
          <Marker key={`prov-${prov.id}`} position={prov.pos} icon={providerIcon}>
            <Popup className="text-slate-900 font-sans text-xs">
              <div className="space-y-1">
                <div className="font-bold text-blue-600 font-mono">{prov.name}</div>
                <div className="text-[11px] text-slate-500">Fleet Active</div>
                <div className="text-[11px] text-slate-500">Tài xế: {prov.contact}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LiveRadar;
