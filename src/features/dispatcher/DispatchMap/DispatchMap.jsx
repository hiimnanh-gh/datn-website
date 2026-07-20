import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RefreshCw, MapPin, Truck, Building2, AlertTriangle, Layers } from 'lucide-react';

import { dispatchRequestService } from '../../../services/dispatchRequestService';
import { dispatchResourceService } from '../../../services/dispatchResourceService';
import { providerService } from '../../../services/providerService';

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Markers
const reqMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const ambulanceMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const providerMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DEFAULT_CENTER = [21.0285, 105.8542]; // Hà Nội Center

const DispatchMap = () => {
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Layers visibility toggles
  const [showRequests, setShowRequests] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showProviders, setShowProviders] = useState(true);

  const fetchMapData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqData, resData, provData, callsData] = await Promise.all([
        dispatchRequestService.getAll().catch(() => []),
        dispatchResourceService.getAll().catch(() => []),
        providerService.getAll().catch(() => []),
        dispatchRequestService.getEmergencyCalls().catch(() => []),
      ]);

      // Combine dispatch requests and emergency calls with lat/long
      const reqList = Array.isArray(reqData) ? reqData : [];
      const callsList = Array.isArray(callsData) ? callsData : [];
      
      const combinedRequests = [
        ...reqList,
        ...callsList.map(c => ({
          id: `Call-${c.id}`,
          serviceTypeName: 'Emergency Call SOS',
          urgencyLevel: c.aiUrgencyPrediction || 'HIGH',
          status: c.status || 'PENDING',
          latitude: c.latitude,
          longitude: c.longitude,
          edgeNodeName: 'N/A'
        }))
      ];

      setRequests(combinedRequests);
      setResources(Array.isArray(resData) ? resData : []);
      setProviders(Array.isArray(provData) ? provData : []);
    } catch (err) {
      console.error('Error fetching map data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMapData();
    const interval = setInterval(fetchMapData, 15000);
    return () => clearInterval(interval);
  }, [fetchMapData]);

  // Filter valid coordinates for Requests & Resources
  const validRequests = requests.filter(r => r.latitude != null && r.longitude != null);
  const validResources = resources.filter(r => r.latitude != null && r.longitude != null);

  // Resolve Provider coordinates:
  // If ProviderDto has latitude/longitude, use them.
  // Otherwise, derive location from the provider's resource (ambulance station base).
  const resolvedProviders = providers.map(prov => {
    if (prov.latitude != null && prov.longitude != null) {
      return { ...prov, lat: prov.latitude, lng: prov.longitude };
    }
    // Find matching resource for this provider with valid lat/lng
    const matchingRes = resources.find(r => 
      (r.providerId === prov.id || r.providerName === prov.providerName) && 
      r.latitude != null && r.longitude != null
    );
    if (matchingRes) {
      return { ...prov, lat: matchingRes.latitude, lng: matchingRes.longitude, derivedFromResource: matchingRes.resourceCode };
    }
    return null;
  }).filter(Boolean);

  return (
    <div className="h-full w-full relative bg-slate-950 font-sans">
      
      {/* Tactical Header Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <h2 className="text-slate-100 font-bold tracking-wide text-sm flex items-center gap-2">
            Bản đồ điều phối (Dispatch Map)
          </h2>
        </div>

        <p className="text-slate-400 text-[11px] font-mono">
          Hiển thị dữ liệu GPS thực từ Backend API
        </p>

        {/* Legend / Toggle Counters */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5 font-mono">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showRequests}
              onChange={(e) => setShowRequests(e.target.checked)}
              className="accent-red-500 rounded"
            />
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span>Sự cố Cấp cứu ({validRequests.length}/{requests.length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showResources}
              onChange={(e) => setShowResources(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
            <span>Xe cứu thương ({validResources.length}/{resources.length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showProviders}
              onChange={(e) => setShowProviders(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span>Đơn vị / Bệnh viện ({resolvedProviders.length}/{providers.length})</span>
          </label>
        </div>

        <button
          onClick={fetchMapData}
          className="w-full mt-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          Cập nhật Bản đồ
        </button>
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={12}
        className="w-full h-full z-0"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* 1. Emergency Requests Markers */}
        {showRequests && validRequests.map((req) => (
          <Marker
            key={`req-${req.id}`}
            position={[req.latitude, req.longitude]}
            icon={reqMarkerIcon}
          >
            <Popup>
              <div className="space-y-1 font-sans text-xs text-slate-900">
                <div className="font-bold text-red-600 font-mono">REQ-{req.id}</div>
                <div className="font-semibold text-slate-800">{req.serviceTypeName || 'Emergency Call'}</div>
                <div>Urgency: <strong>{req.urgencyLevel}</strong></div>
                <div>Status: <span className="bg-slate-200 px-1 py-0.2 rounded font-mono">{req.status}</span></div>
                <div className="text-[10px] text-slate-500">Node: {req.edgeNodeName}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 2. Dispatch Resources Markers */}
        {showResources && validResources.map((res) => (
          <Marker
            key={`res-${res.id}`}
            position={[res.latitude, res.longitude]}
            icon={ambulanceMarkerIcon}
          >
            <Popup>
              <div className="space-y-1 font-sans text-xs text-slate-900">
                <div className="font-bold text-blue-600 font-mono">{res.resourceCode}</div>
                <div className="font-semibold text-slate-800">{res.providerName}</div>
                <div>Type: <strong>{res.resourceTypeName}</strong></div>
                <div>Status: <strong className="text-emerald-700">{res.status}</strong></div>
                <div>Tài xế: {res.currentDriverName || 'Chưa gán'}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* 3. Providers / Hospitals Markers */}
        {showProviders && resolvedProviders.map((prov) => (
          <Marker
            key={`prov-${prov.id}`}
            position={[prov.lat, prov.lng]}
            icon={providerMarkerIcon}
          >
            <Popup>
              <div className="space-y-1 font-sans text-xs text-slate-900">
                <div className="font-bold text-emerald-700 font-mono">{prov.providerName}</div>
                <div>Loại: <strong>{prov.providerType || 'Cơ sở Y tế / Cấp cứu'}</strong></div>
                <div>Hotline: {prov.contactPhone || 'N/A'}</div>
                <div className="text-[10px] text-slate-500">{prov.contactAddress || 'Hà Nội'}</div>
              </div>
            </Popup>
          </Marker>
        ))}

      </MapContainer>
    </div>
  );
};

export default DispatchMap;
