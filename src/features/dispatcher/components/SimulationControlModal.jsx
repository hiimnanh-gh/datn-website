import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Play, Square, Gauge, Clock, MapPin, Building2, 
  AlertTriangle, CheckCircle2, RefreshCw, Zap, ShieldCheck, 
  Navigation, Navigation2, Activity, FastForward, Maximize2
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import ambulanceSimulationService from '../../../services/ambulanceSimulationService';
import { medicalHospitalService } from '../../../services/medicalHospitalService';
import useAmbulanceTracking from '../../../hooks/useAmbulanceTracking';

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
  iconSize: [28, 45],
  iconAnchor: [14, 45],
  popupAnchor: [1, -38],
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

// Helper component to auto pan map to active ambulance
const MapCenterFollower = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.panTo(center, { animate: true, duration: 0.5 });
    }
  }, [center, map]);
  return null;
};

const SimulationControlModal = ({ isOpen, onClose, mission, onRequestRefresh }) => {
  // Form parameters
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [speedMultiplier, setSpeedMultiplier] = useState(10);
  const [tickIntervalMs, setTickIntervalMs] = useState(1000);
  const [sceneWaitSeconds, setSceneWaitSeconds] = useState(5);

  // Simulation execution state
  const [simulation, setSimulation] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errorCode, setErrorCode] = useState('');

  // Connect live tracking hook when simulation exists
  const { singleTracking, isConnected, refreshSnapshot } = useAmbulanceTracking(
    simulation?.id || null, 
    { isDispatcher: true, missionId: mission?.id }
  );

  // Fetch Hospitals list
  useEffect(() => {
    if (isOpen) {
      medicalHospitalService.getAll()
        .then((res) => {
          const list = Array.isArray(res) ? res : [];
          setHospitals(list);
          if (list.length > 0) {
            setSelectedHospitalId(list[0].id);
          }
        })
        .catch((err) => console.error('Error fetching hospitals for simulation:', err));

      // Check if mission already has active simulation tracking
      if (mission?.id) {
        ambulanceSimulationService.getTrackingByMission(mission.id)
          .then((track) => {
            if (track) {
              setSimulation({
                id: track.simulationId,
                status: track.status,
                phase: track.phase,
                currentLongitude: track.currentLongitude,
                currentLatitude: track.currentLatitude
              });
            }
          })
          .catch(() => {
            setSimulation(null);
          });
      }
    }
  }, [isOpen, mission]);

  // Handle Create Simulation
  const handleCreateSimulation = async () => {
    if (!mission?.id) return;
    setIsCreating(true);
    setErrorMessage('');
    setErrorCode('');

    try {
      const payload = {
        missionId: mission.id,
        hospitalId: selectedHospitalId ? Number(selectedHospitalId) : null,
        tickIntervalMs: Number(tickIntervalMs),
        speedMultiplier: Number(speedMultiplier),
        sceneWaitSeconds: Number(sceneWaitSeconds)
      };

      const res = await ambulanceSimulationService.create(payload);
      setSimulation(res);
      if (onRequestRefresh) onRequestRefresh();
    } catch (err) {
      console.error('Create simulation error:', err);
      const code = err.response?.data?.errorCode || err.response?.status || 'UNKNOWN';
      const msg = err.response?.data?.message || err.message || 'Khởi tạo phiên mô phỏng thất bại!';
      setErrorCode(code);
      setErrorMessage(msg);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Start Simulation
  const handleStartSimulation = async () => {
    if (!simulation?.id) return;
    setIsStarting(true);
    setErrorMessage('');
    try {
      const res = await ambulanceSimulationService.start(simulation.id);
      setSimulation(res);
      if (onRequestRefresh) onRequestRefresh();
    } catch (err) {
      console.error('Start simulation error:', err);
      setErrorMessage(err.response?.data?.message || 'Không thể bắt đầu mô phỏng OSRM!');
    } finally {
      setIsStarting(false);
    }
  };

  // Handle Stop Simulation
  const handleStopSimulation = async () => {
    if (!simulation?.id) return;
    setIsStopping(true);
    try {
      const res = await ambulanceSimulationService.stop(simulation.id);
      setSimulation(res);
      if (onRequestRefresh) onRequestRefresh();
    } catch (err) {
      console.error('Stop simulation error:', err);
      setErrorMessage(err.response?.data?.message || 'Dừng mô phỏng thất bại!');
    } finally {
      setIsStopping(false);
    }
  };

  // Handle Continue (Phase 2: Scene -> Hospital)
  const handleContinueSimulation = async () => {
    if (!simulation?.id) return;
    setIsContinuing(true);
    try {
      const res = await ambulanceSimulationService.continueSimulation(simulation.id);
      setSimulation(res);
      if (onRequestRefresh) onRequestRefresh();
    } catch (err) {
      console.error('Continue simulation error:', err);
      setErrorMessage(err.response?.data?.message || 'Tiếp tục chặng bệnh viện thất bại!');
    } finally {
      setIsContinuing(false);
    }
  };

  if (!isOpen) return null;

  // Active metrics derived from STOMP WS or fallback REST snapshot
  const activeStatus = singleTracking?.status || simulation?.status || 'CREATED';
  const activePhase = singleTracking?.phase || simulation?.phase || 'EN_ROUTE_TO_SCENE';
  const progressPercent = singleTracking?.progressPercent ?? singleTracking?.progress ?? 0;
  const remainingMeters = singleTracking?.remainingDistanceMeters ?? singleTracking?.distanceRemaining ?? 0;
  const etaSeconds = singleTracking?.etaSeconds ?? singleTracking?.estimatedSeconds ?? 0;
  const lat = singleTracking?.currentLatitude ?? simulation?.currentLatitude ?? mission?.latitude ?? 21.0285;
  const lng = singleTracking?.currentLongitude ?? simulation?.currentLongitude ?? mission?.longitude ?? 105.8542;

  // Destination Hospital coordinates if available
  const selectedHospital = hospitals.find(h => String(h.id) === String(selectedHospitalId));
  const hospitalLat = selectedHospital?.latitude ?? selectedHospital?.lat ?? mission?.destinationLatitude;
  const hospitalLng = selectedHospital?.longitude ?? selectedHospital?.lng ?? mission?.destinationLongitude;

  // Phase labels & colors
  const getPhaseDisplay = (phase) => {
    switch (phase) {
      case 'EN_ROUTE_TO_SCENE':
        return { label: 'Chặng 1: Đang di chuyển đến hiện trường', color: 'bg-blue-950/60 text-blue-400 border-blue-800' };
      case 'AT_SCENE':
        return { label: 'Tại hiện trường: Sơ cứu tại chỗ', color: 'bg-amber-950/60 text-amber-400 border-amber-800' };
      case 'TRANSPORTING':
      case 'EN_ROUTE_TO_HOSPITAL':
        return { label: 'Chặng 2: Đang chuyển bệnh nhân về Bệnh viện', color: 'bg-purple-950/60 text-purple-400 border-purple-800' };
      case 'ARRIVED_AT_HOSPITAL':
      case 'COMPLETED':
        return { label: 'Đã đến Bệnh viện & Hoàn thành', color: 'bg-emerald-950/60 text-emerald-400 border-emerald-800' };
      default:
        return { label: phase, color: 'bg-slate-800 text-slate-300 border-slate-700' };
    }
  };

  const phaseInfo = getPhaseDisplay(activePhase);
  const mapCenter = [lat, lng];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Mô phỏng Hành trình OSRM
                </h2>
                {mission?.id && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300">
                    Mission #{mission.id}
                  </span>
                )}
                {mission?.requestId && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    REQ-{mission.requestId}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Tính toán lộ trình thực tế qua OSRM & phát vị trí xe cấp cứu theo thời gian thực
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Mission Info Overview */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Mã Nhiệm vụ</span>
              <span className="font-mono font-bold text-emerald-400">#{mission?.id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Mã Yêu cầu</span>
              <span className="font-mono font-bold text-slate-200">REQ-{mission?.requestId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Mã xe cứu thương</span>
              <span className="font-mono font-bold text-indigo-300">{mission?.resourceCode || `AMB-${mission?.resourceId || '0'}`}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Trạng thái</span>
              <span className="font-mono font-bold text-amber-400">{mission?.status || 'DISPATCHED'}</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Lỗi khởi chạy mô phỏng:</span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* Config Parameters Form */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Gauge size={14} className="text-indigo-400" />
              Cấu hình thông số mô phỏng
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Target Hospital Selector */}
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1 flex items-center gap-1.5">
                  <Building2 size={13} className="text-slate-400" />
                  Bệnh viện đích (Hospital Target):
                </label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  disabled={simulation?.status === 'RUNNING'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60"
                >
                  <option value="">-- Chọn bệnh viện đích --</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.hospitalName || h.name || `Bệnh viện #${h.id}`} ({h.hospitalAddress || 'Hà Nội'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Multiplier */}
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1 flex items-center gap-1.5">
                  <Zap size={13} className="text-amber-400" />
                  Hệ số tốc độ (Speed Multiplier):
                </label>
                <select
                  value={speedMultiplier}
                  onChange={(e) => setSpeedMultiplier(e.target.value)}
                  disabled={simulation?.status === 'RUNNING'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60 font-mono"
                >
                  <option value={1}>1x (Tốc độ thực tế)</option>
                  <option value={5}>5x (Nhanh gấp 5 lần)</option>
                  <option value={10}>10x (Nhanh gấp 10 lần - Khuyên dùng demo)</option>
                  <option value={20}>20x (Nhanh gấp 20 lần)</option>
                  <option value={50}>50x (Siêu tốc)</option>
                </select>
              </div>

              {/* Tick Interval Ms */}
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1 flex items-center gap-1.5">
                  <Clock size={13} className="text-slate-400" />
                  Tần suất phát vị trí (Tick Interval):
                </label>
                <select
                  value={tickIntervalMs}
                  onChange={(e) => setTickIntervalMs(e.target.value)}
                  disabled={simulation?.status === 'RUNNING'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60 font-mono"
                >
                  <option value={250}>250ms (0.25 giây / tick - Cực mượt)</option>
                  <option value={500}>500ms (0.5 giây / tick)</option>
                  <option value={1000}>1000ms (1.0 giây / tick - Tiêu chuẩn)</option>
                  <option value={2000}>2000ms (2.0 giây / tick)</option>
                </select>
              </div>

              {/* Scene Wait Seconds */}
              <div>
                <label className="text-[11px] text-slate-300 font-medium block mb-1 flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-400" />
                  Thời gian sơ cứu tại chỗ (Scene Wait):
                </label>
                <select
                  value={sceneWaitSeconds}
                  onChange={(e) => setSceneWaitSeconds(e.target.value)}
                  disabled={simulation?.status === 'RUNNING'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-60 font-mono"
                >
                  <option value={3}>3 giây</option>
                  <option value={5}>5 giây (Mặc định)</option>
                  <option value={10}>10 giây</option>
                  <option value={30}>30 giây</option>
                </select>
              </div>
            </div>
          </div>

          {/* ── LIVE INTERACTIVE MAP (Thay thế cho bảng telemetry cũ) ── */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-400" />
                Bản đồ lộ trình di chuyển xe cấp cứu
              </span>

              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                activeStatus === 'RUNNING' ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {activeStatus}
              </span>
            </div>

            {/* Map Container */}
            <div className="h-64 w-full rounded-2xl overflow-hidden border border-slate-800 relative z-0 shadow-xl bg-slate-950">
              <MapContainer
                center={mapCenter}
                zoom={14}
                className="w-full h-full"
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Auto center map to moving ambulance */}
                <MapCenterFollower center={mapCenter} />

                {/* Ambulance Marker */}
                {lat != null && lng != null && (
                  <Marker position={[lat, lng]} icon={ambulanceMarkerIcon}>
                    <Popup>
                      <div className="text-xs font-sans text-slate-900">
                        <strong>Xe Cứu Thương: {mission?.resourceCode || `AMB-${mission?.resourceId || '0'}`}</strong>
                        <div>Vị trí hiện tại: {lat.toFixed(4)}, {lng.toFixed(4)}</div>
                        <div>Tiến độ: {progressPercent?.toFixed(1)}%</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Incident / Destination Marker */}
                {mission?.latitude != null && mission?.longitude != null && (
                  <Marker position={[mission.latitude, mission.longitude]} icon={reqMarkerIcon}>
                    <Popup>
                      <div className="text-xs font-sans text-slate-900">
                        <strong>Hiện trường: REQ-{mission?.requestId}</strong>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Hospital Marker */}
                {hospitalLat != null && hospitalLng != null && (
                  <Marker position={[hospitalLat, hospitalLng]} icon={hospitalMarkerIcon}>
                    <Popup>
                      <div className="text-xs font-sans text-slate-900">
                        <strong>{selectedHospital?.hospitalName || 'Bệnh viện tiếp nhận'}</strong>
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>

              {/* Floating Overlay on Top of Map */}
              <div className="absolute top-2 left-2 right-2 z-[1000] flex flex-col gap-1.5 pointer-events-none">
                <div className="flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg">
                  <div className="flex items-center gap-2">
                    <Navigation2 size={14} className={`text-indigo-400 ${activeStatus === 'RUNNING' ? 'animate-spin' : ''}`} />
                    <span className="text-[11px] font-semibold text-slate-100">{phaseInfo.label}</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-indigo-300">{progressPercent?.toFixed(1)}%</span>
                </div>

                {/* Mini progress line */}
                <div className="w-full bg-slate-950/80 rounded-full h-1.5 overflow-hidden border border-slate-800/80">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                </div>
              </div>

              {/* Bottom stats pill over map */}
              <div className="absolute bottom-2 left-2 right-2 z-[1000] flex items-center justify-between bg-slate-900/90 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-xl shadow-lg text-[11px] font-mono text-slate-300 pointer-events-none">
                <span>
                  Khoảng cách: <strong className="text-white">{remainingMeters > 1000 ? `${(remainingMeters / 1000).toFixed(2)} km` : `${Math.round(remainingMeters)} m`}</strong>
                </span>
                <span>
                  ETA: <strong className="text-amber-300">{etaSeconds > 60 ? `${Math.floor(etaSeconds / 60)}p ${Math.round(etaSeconds % 60)}s` : `${Math.round(etaSeconds)}s`}</strong>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>

          <div className="flex items-center gap-3">
            {!simulation ? (
              <button
                onClick={handleCreateSimulation}
                disabled={isCreating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                <span>Khởi tạo phiên mô phỏng</span>
              </button>
            ) : (
              <>
                {activePhase === 'AT_SCENE' ? (
                  <button
                    onClick={handleContinueSimulation}
                    disabled={isContinuing}
                    className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isContinuing ? <RefreshCw size={15} className="animate-spin" /> : <FastForward size={15} />}
                    <span>Tiếp tục chặng Bệnh viện (/continue)</span>
                  </button>
                ) : activeStatus === 'RUNNING' ? (
                  <button
                    onClick={handleStopSimulation}
                    disabled={isStopping}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isStopping ? <RefreshCw size={15} className="animate-spin" /> : <Square size={15} />}
                    <span>Dừng mô phỏng (/stop)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartSimulation}
                    disabled={isStarting}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isStarting ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
                    <span>Bắt đầu chạy OSRM (/start)</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimulationControlModal;
