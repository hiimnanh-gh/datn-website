import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RefreshCw, MapPin, Truck, Building2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

import { dispatchRequestService } from '../../../services/dispatchRequestService';
import { dispatchResourceService } from '../../../services/dispatchResourceService';
import { medicalHospitalService } from '../../../services/medicalHospitalService';
import wsService from '../../../services/websocket';
import HeaderUserProfile from '../../../components/HeaderUserProfile';

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

const activeSimulationMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [30, 48],
  iconAnchor: [15, 48],
  popupAnchor: [1, -40],
  shadowSize: [41, 41]
});

const hospitalMarkerIcon = new L.Icon({
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
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wsConnected, setWsConnected] = useState(false);
  const subRef = useRef(null);

  // Layers visibility toggles
  const [showRequests, setShowRequests] = useState(true);
  const [showResources, setShowResources] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);

  // 1. Initial REST Snapshot loader
  const fetchMapSnapshot = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqData, resData, hospData] = await Promise.all([
        dispatchRequestService.getAll().catch(() => []),
        dispatchResourceService.getAll().catch(() => []),
        medicalHospitalService.getAll().catch(() => []),
      ]);

      const reqList = Array.isArray(reqData) ? reqData : [];
      const resList = Array.isArray(resData) ? resData : [];
      const hospList = Array.isArray(hospData) ? hospData : [];

      console.log('[REQ SNAPSHOT]', reqList.length);
      console.log('[RESOURCE SNAPSHOT]', resList.length);
      console.log('[HOSPITALS SNAPSHOT]', hospList.length);

      setRequests(reqList);
      setResources(resList);
      setHospitals(hospList);
    } catch (err) {
      console.error('Error fetching map snapshot data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 2. Realtime WebSocket Listener for AMBULANCE_POSITION_UPDATED
  useEffect(() => {
    fetchMapSnapshot();

    // Polling fallback
    const interval = setInterval(fetchMapSnapshot, 10000);

    // STOMP WebSocket connect & subscribe
    wsService.connect(
      () => {
        setWsConnected(true);
        console.log('[WS CONNECT] Connected to /ws');

        subRef.current = wsService.subscribe('/topic/dispatcher/ambulances', (msg) => {
          try {
            const event = JSON.parse(msg.body);
            console.log('[WS AMBULANCE EVENT]', event);

            if (event && event.eventType === 'AMBULANCE_POSITION_UPDATED') {
              const resId = event.resourceId;
              const newLat = event.position?.latitude ?? event.currentLatitude;
              const newLng = event.position?.longitude ?? event.currentLongitude;

              if (resId && newLat != null && newLng != null) {
                setResources((prev) => {
                  const exists = prev.some((r) => r.id === resId);
                  if (exists) {
                    return prev.map((r) =>
                      r.id === resId
                        ? {
                            ...r,
                            latitude: newLat,
                            longitude: newLng,
                            status: event.status || r.status,
                            updatedAt: event.occurredAt || new Date().toISOString(),
                            _liveSimulation: event.sourceType === 'SIMULATION' ? event : null
                          }
                        : r
                    );
                  }
                  return prev;
                });
              }
            }
          } catch (e) {
            console.error('Error parsing WS message from /topic/dispatcher/ambulances:', e);
          }
        });
      },
      (err) => {
        setWsConnected(false);
        console.warn('STOMP WS connection error, using REST polling fallback:', err);
      }
    );

    return () => {
      clearInterval(interval);
      if (subRef.current && typeof subRef.current.unsubscribe === 'function') {
        subRef.current.unsubscribe();
      }
    };
  }, [fetchMapSnapshot]);

  // Valid coordinates filtering (NO arbitrary coordinate fallbacks)
  const validRequests = requests.filter(
    (r) => (r.confirmedLatitude ?? r.latitude) != null && (r.confirmedLongitude ?? r.longitude) != null
  );

  const validResources = resources.filter((r) => r.latitude != null && r.longitude != null);

  const validHospitals = hospitals.filter((h) => h.latitude != null && h.longitude != null);

  return (
    <div className="h-full w-full relative bg-slate-950 font-sans">
      {/* Top Right User Profile */}
      <div className="absolute top-4 right-4 z-[1000]">
        <HeaderUserProfile profilePath="/dispatcher/profile" />
      </div>

      {/* Tactical Header Overlay */}
      <div className="absolute top-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-xl shadow-2xl space-y-2 text-xs">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${wsConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            <h2 className="text-slate-100 font-bold tracking-wide text-sm flex items-center gap-2">
              Bản đồ điều phối (Dispatch Map)
            </h2>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            wsConnected ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {wsConnected ? 'LIVE WS' : 'POLLING'}
          </span>
        </div>

        <p className="text-slate-400 text-[11px] font-mono">
          Nguồn chuẩn: Backend REST Snapshot + Realtime STOMP
        </p>

        {/* Legend / Toggle Counters (Count from actual active arrays) */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5 font-mono">
          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showRequests}
              onChange={(e) => setShowRequests(e.target.checked)}
              className="accent-red-500 rounded"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
            <span>Sự cố Cấp cứu ({validRequests.length}/{requests.length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showResources}
              onChange={(e) => setShowResources(e.target.checked)}
              className="accent-blue-500 rounded"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Xe cứu thương ({validResources.length}/{resources.length})</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
            <input
              type="checkbox"
              checked={showHospitals}
              onChange={(e) => setShowHospitals(e.target.checked)}
              className="accent-emerald-500 rounded"
            />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Bệnh viện ({validHospitals.length}/{hospitals.length})</span>
          </label>
        </div>

        <button
          onClick={fetchMapSnapshot}
          className="w-full mt-2 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          Làm mới dữ liệu
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

        {/* 1. Incident Markers (Đỏ) */}
        {showRequests && validRequests.map((req) => {
          const lat = req.confirmedLatitude ?? req.latitude;
          const lng = req.confirmedLongitude ?? req.longitude;
          return (
            <Marker
              key={`req-${req.id}`}
              position={[lat, lng]}
              icon={reqMarkerIcon}
            >
              <Popup>
                <div className="space-y-1 font-sans text-xs text-slate-900">
                  <div className="font-bold text-red-600 font-mono">REQ-{req.id}</div>
                  <div className="font-semibold text-slate-800">{req.serviceTypeName || 'Emergency Call'}</div>
                  <div>Mức khẩn cấp: <strong>{req.urgencyLevel}</strong></div>
                  <div>Trạng thái yêu cầu: <span className="bg-slate-200 px-1 py-0.2 rounded font-mono">{req.status}</span></div>
                  <div className="text-[10px] text-slate-500 font-mono">Tọa độ: {lat.toFixed(4)}, {lng.toFixed(4)}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 2. Ambulance Markers (Xanh dương / Gold Simulation) */}
        {showResources && validResources.map((res) => {
          const isSimulating = Boolean(res._liveSimulation);
          return (
            <Marker
              key={`res-${res.id}`}
              position={[res.latitude, res.longitude]}
              icon={isSimulating ? activeSimulationMarkerIcon : ambulanceMarkerIcon}
            >
              <Popup>
                <div className="space-y-1 font-sans text-xs text-slate-900">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-blue-600 font-mono">{res.resourceCode}</span>
                    {isSimulating && (
                      <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold">
                        ⚡ OSRM Live
                      </span>
                    )}
                  </div>
                  <div className="font-semibold text-slate-800">{res.providerName || 'Đơn vị Cấp cứu'}</div>
                  <div>Loại xe: <strong>{res.resourceTypeName || 'Cứu thương'}</strong></div>
                  <div>Trạng thái xe: <strong className="text-emerald-700">{res.status}</strong></div>
                  <div>Tài xế: {res.currentDriverName || 'Chưa gán'}</div>
                  <div className="text-[10px] text-slate-500 font-mono">Tọa độ: {res.latitude.toFixed(4)}, {res.longitude.toFixed(4)}</div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* 3. Hospital Markers (Xanh lá - Nguồn GET /api/v1/medical-hospitals) */}
        {showHospitals && validHospitals.map((hosp) => (
          <Marker
            key={`hosp-${hosp.id}`}
            position={[hosp.latitude, hosp.longitude]}
            icon={hospitalMarkerIcon}
          >
            <Popup>
              <div className="space-y-1 font-sans text-xs text-slate-900">
                <div className="font-bold text-emerald-700 font-mono flex items-center gap-1">
                  <Building2 size={13} />
                  {hosp.hospitalName}
                </div>
                <div>Địa chỉ: <span className="text-slate-700">{hosp.hospitalAddress || 'Chưa cập nhật'}</span></div>
                <div>Hotline: <strong>{hosp.contactPhone || 'N/A'}</strong></div>
                <div className="text-[10px] text-slate-500 font-mono">Tọa độ: {hosp.latitude.toFixed(4)}, {hosp.longitude.toFixed(4)}</div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default DispatchMap;
