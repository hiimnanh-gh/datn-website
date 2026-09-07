import { useState, useEffect, useCallback } from 'react';
import { 
  X, Play, Square, Gauge, Clock, MapPin, Building2, 
  AlertTriangle, CheckCircle2, RefreshCw, Zap, 
  Navigation2, FastForward
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import ambulanceSimulationService from '../../../services/ambulanceSimulationService';
import { medicalHospitalService } from '../../../services/medicalHospitalService';
import { dispatchMissionService } from '../../../services/dispatchMissionService';
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
  // Current mission state synced with backend via override pattern (No cascading render)
  const [missionOverride, setMissionOverride] = useState(null);
  const currentMission = (missionOverride && missionOverride.id === mission?.id) ? missionOverride : (mission || null);
  const [isRefreshingMission, setIsRefreshingMission] = useState(false);

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

  // Lock all buttons when any mutation is in flight
  const isActionLoading = isCreating || isStarting || isStopping || isContinuing;

  // Connect live tracking hook (WebSocket + initial REST snapshot)
  const { singleTracking, refreshSnapshot } = useAmbulanceTracking(
    simulation?.id || null, 
    { isDispatcher: true, missionId: currentMission?.id || mission?.id }
  );

  // Fetch latest mission details directly from Backend
  const fetchLatestMission = useCallback(async (missionId) => {
    const id = missionId || mission?.id;
    if (!id) return null;
    try {
      const fresh = await dispatchMissionService.getById(id);
      if (fresh && fresh.id) {
        setMissionOverride(fresh);
        return fresh;
      }
    } catch (err) {
      console.warn('Error fetching latest mission status:', err);
    }
    return null;
  }, [mission?.id]);

  // Fetch simulation state directly from Backend
  const fetchSimulationState = useCallback(async (missionId) => {
    const id = missionId || mission?.id;
    if (!id) return;
    try {
      const track = await ambulanceSimulationService.getTrackingByMission(id);
      if (track && (track.simulationId || track.id)) {
        setSimulation({
          id: track.simulationId || track.id,
          status: track.status,
          phase: track.phase,
          currentLongitude: track.currentLongitude,
          currentLatitude: track.currentLatitude,
          progressPercent: track.progressPercent,
          remainingDistanceMeters: track.remainingDistanceMeters,
          etaSeconds: track.etaSeconds
        });
        return;
      }
    } catch {
      // 404 or not found means simulation is not yet created
      setSimulation(null);
    }
  }, [mission?.id]);

  // Initialize on modal open
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    // 1. Fetch hospitals list
    medicalHospitalService.getAll()
      .then((res) => {
        if (!isMounted) return;
        const list = Array.isArray(res) ? res : [];
        setHospitals(list);
        if (mission?.destinationId) {
          setSelectedHospitalId(mission.destinationId);
        } else if (list.length > 0) {
          setSelectedHospitalId(list[0].id);
        }
      })
      .catch((err) => console.error('Error fetching hospitals for simulation:', err));

    // 2. Fetch initial mission and simulation state
    const loadInitialData = async () => {
      if (!mission?.id) return;

      try {
        const fresh = await dispatchMissionService.getById(mission.id);
        if (isMounted && fresh && fresh.id) {
          setMissionOverride(fresh);
        }
      } catch (err) {
        console.warn('Initial mission fetch error:', err);
      }

      try {
        const track = await ambulanceSimulationService.getTrackingByMission(mission.id);
        if (isMounted && track && (track.simulationId || track.id)) {
          setSimulation({
            id: track.simulationId || track.id,
            status: track.status,
            phase: track.phase,
            currentLongitude: track.currentLongitude,
            currentLatitude: track.currentLatitude,
            progressPercent: track.progressPercent,
            remainingDistanceMeters: track.remainingDistanceMeters,
            etaSeconds: track.etaSeconds
          });
        }
      } catch {
        if (isMounted) {
          setSimulation(null);
        }
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [isOpen, mission]);

  // Handle Create Simulation
  const handleCreateSimulation = async () => {
    const targetMissionId = currentMission?.id || mission?.id;
    if (!targetMissionId || isActionLoading) return;
    setIsCreating(true);
    setErrorMessage('');
    setErrorCode('');

    try {
      const payload = {
        missionId: targetMissionId,
        hospitalId: selectedHospitalId ? Number(selectedHospitalId) : null,
        tickIntervalMs: Number(tickIntervalMs),
        speedMultiplier: Number(speedMultiplier),
        sceneWaitSeconds: Number(sceneWaitSeconds)
      };

      const res = await ambulanceSimulationService.create(payload);
      setSimulation(res);
      if (typeof refreshSnapshot === 'function') await refreshSnapshot();
      await fetchLatestMission();
      if (onRequestRefresh) onRequestRefresh();
    } catch (err) {
      console.error('Create simulation error:', err);
      const code = err.response?.data?.errorCode || err.response?.status || 'UNKNOWN';
      const msg = err.response?.data?.message || err.message || 'Khởi tạo phiên mô phỏng thất bại!';
      setErrorCode(code);
      setErrorMessage(msg);
      await fetchSimulationState();
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Start Simulation
  const handleStartSimulation = async () => {
    const simId = simulation?.id;
    if (!simId || isActionLoading) return;
    setIsStarting(true);
    setErrorMessage('');
    setErrorCode('');

    try {
      const res = await ambulanceSimulationService.start(simId);
      // Backend is source of truth: re-verify with backend detail
      const fresh = await ambulanceSimulationService.getById(simId);
      setSimulation(fresh || res);
      if (typeof refreshSnapshot === 'function') await refreshSnapshot();
      await fetchLatestMission();
      if (onRequestRefresh) onRequestRefresh();
    } catch (err) {
      console.error('Start simulation error:', err);
      const code = err.response?.data?.errorCode || err.response?.status || 'UNKNOWN';
      const msg = err.response?.data?.message || err.message || 'Không thể bắt đầu mô phỏng OSRM!';
      setErrorCode(code);
      setErrorMessage(msg);
      // Re-sync from backend to prevent false UI drift
      await fetchSimulationState();
      await fetchLatestMission();
    } finally {
      setIsStarting(false);
    }
  };

  // Handle Stop Simulation
  const handleStopSimulation = async () => {
    const simId = simulation?.id;
    if (!simId || isActionLoading) return;
    setIsStopping(true);
    setErrorMessage('');
    setErrorCode('');

    try {
      const res = await ambulanceSimulationService.stop(simId);
      const fresh = await ambulanceSimulationService.getById(simId);
      setSimulation(fresh || res);
      if (typeof refreshSnapshot === 'function') await refreshSnapshot();
      await fetchLatestMission();
      if (onRequestRefresh) onRequestRefresh();
    } catch (err) {
      console.error('Stop simulation error:', err);
      const code = err.response?.data?.errorCode || err.response?.status || 'UNKNOWN';
      const msg = err.response?.data?.message || err.message || 'Dừng mô phỏng thất bại!';
      setErrorCode(code);
      setErrorMessage(msg);
      await fetchSimulationState();
    } finally {
      setIsStopping(false);
    }
  };

  // Handle Continue (Phase 2: Scene -> Hospital)
  const handleContinueSimulation = async () => {
    const simId = simulation?.id;
    if (!simId || isActionLoading) return;
    setIsContinuing(true);
    setErrorMessage('');
    setErrorCode('');

    try {
      // NOTE: calling ambulanceSimulationService.continue(id), NOT continueSimulation
      const res = await ambulanceSimulationService.continue(simId);
      const fresh = await ambulanceSimulationService.getById(simId);
      setSimulation(fresh || res);
      if (typeof refreshSnapshot === 'function') await refreshSnapshot();
      await fetchLatestMission();
      if (onRequestRefresh) onRequestRefresh();
    } catch (err) {
      console.error('Continue simulation error:', err);
      const code = err.response?.data?.errorCode || err.response?.status || 'UNKNOWN';
      const msg = err.response?.data?.message || err.message || 'Tiếp tục chặng bệnh viện thất bại!';
      setErrorCode(code);
      setErrorMessage(msg);
      // Re-sync from backend - do not fake state
      await fetchSimulationState();
      await fetchLatestMission();
    } finally {
      setIsContinuing(false);
    }
  };

  // Active status & phase mapped directly from Backend
  const activeStatus = singleTracking?.status || simulation?.status || (simulation ? 'READY' : null);
  const activePhase = singleTracking?.phase || simulation?.phase || 'TO_SCENE';

  // Periodic polling when simulation is RUNNING to ensure real-time progress update
  // even if WebSocket connection drops or packet is delayed
  useEffect(() => {
    if (!isOpen || !simulation?.id) return;
    if (activeStatus !== 'RUNNING') return;

    const interval = setInterval(async () => {
      try {
        if (typeof refreshSnapshot === 'function') {
          await refreshSnapshot();
        } else {
          const track = await ambulanceSimulationService.getTracking(simulation.id);
          if (track) {
            setSimulation(prev => ({
              ...prev,
              ...track,
              id: track.simulationId || prev.id
            }));
          }
        }
      } catch {
        // Silent catch during periodic polling
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, simulation?.id, activeStatus, refreshSnapshot]);

  if (!isOpen) return null;

  // Real metrics directly from Backend Tracking Response
  const progressPercent = typeof singleTracking?.progressPercent === 'number'
    ? singleTracking.progressPercent
    : (activeStatus === 'COMPLETED' || activePhase === 'ARRIVED_HOSPITAL' ? 100 : (simulation?.progressPercent ?? 0));

  const remainingMeters = singleTracking?.remainingDistanceMeters ?? simulation?.remainingDistanceMeters ?? 0;
  const etaSeconds = singleTracking?.etaSeconds ?? simulation?.etaSeconds ?? 0;

  const lat = singleTracking?.latitude 
    ?? singleTracking?.position?.latitude 
    ?? simulation?.currentLatitude 
    ?? currentMission?.latitude 
    ?? 21.0285;

  const lng = singleTracking?.longitude 
    ?? singleTracking?.position?.longitude 
    ?? simulation?.currentLongitude 
    ?? currentMission?.longitude 
    ?? 105.8542;

  // Destination Hospital coordinates if available
  const selectedHospital = hospitals.find(h => String(h.id) === String(selectedHospitalId));
  const hospitalLat = selectedHospital?.latitude ?? selectedHospital?.lat ?? currentMission?.destinationLatitude;
  const hospitalLng = selectedHospital?.longitude ?? selectedHospital?.lng ?? currentMission?.destinationLongitude;

  // Phase mapping (aligned with Backend SimulationPhase enum: TO_SCENE, AT_SCENE, TO_HOSPITAL, ARRIVED_HOSPITAL)
  const getPhaseDisplay = (phase) => {
    switch (phase) {
      case 'TO_SCENE':
      case 'EN_ROUTE_TO_SCENE':
        return { 
          label: 'Chặng 1: Đang di chuyển đến hiện trường', 
          color: 'bg-blue-950/60 text-blue-400 border-blue-800' 
        };
      case 'AT_SCENE':
        return { 
          label: 'Tại hiện trường: Sơ cứu tại chỗ', 
          color: 'bg-amber-950/60 text-amber-400 border-amber-800' 
        };
      case 'TO_HOSPITAL':
      case 'TRANSPORTING':
      case 'EN_ROUTE_TO_HOSPITAL':
        return { 
          label: 'Chặng 2: Đang chuyển bệnh nhân về Bệnh viện', 
          color: 'bg-purple-950/60 text-purple-400 border-purple-800' 
        };
      case 'ARRIVED_HOSPITAL':
      case 'ARRIVED_AT_HOSPITAL':
      case 'COMPLETED':
        return { 
          label: 'Đã đến Bệnh viện & Hoàn thành', 
          color: 'bg-emerald-950/60 text-emerald-400 border-emerald-800' 
        };
      default:
        return { 
          label: phase || 'Chờ khởi chạy', 
          color: 'bg-slate-800 text-slate-300 border-slate-700' 
        };
    }
  };

  // Status display (aligned with Backend SimulationStatus enum: READY, RUNNING, STOPPED, COMPLETED, FAILED, INTERRUPTED)
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'READY':
        return { label: 'Sẵn sàng (READY)', color: 'bg-indigo-950 text-indigo-400 border-indigo-800' };
      case 'RUNNING':
        return { label: 'Đang chạy (RUNNING)', color: 'bg-emerald-950 text-emerald-400 border-emerald-800 animate-pulse' };
      case 'STOPPED':
        return { label: 'Tạm dừng / Tại chỗ (STOPPED)', color: 'bg-amber-950 text-amber-400 border-amber-800' };
      case 'COMPLETED':
        return { label: 'Hoàn thành (COMPLETED)', color: 'bg-blue-950 text-blue-400 border-blue-800' };
      case 'FAILED':
        return { label: 'Thất bại (FAILED)', color: 'bg-rose-950 text-rose-400 border-rose-800' };
      case 'INTERRUPTED':
        return { label: 'Gián đoạn (INTERRUPTED)', color: 'bg-orange-950 text-orange-400 border-orange-800' };
      default:
        return { label: status || 'Chưa khởi tạo', color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  const phaseInfo = getPhaseDisplay(activePhase);
  const statusInfo = getStatusDisplay(activeStatus);
  const mapCenter = [lat, lng];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
              <Zap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">
                  Mô phỏng Hành trình OSRM
                </h2>
                {currentMission?.id && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-300">
                    Mission #{currentMission.id}
                  </span>
                )}
                {currentMission?.requestId && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    REQ-{currentMission.requestId}
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
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 flex-1">
          
          {/* Mission Info Overview */}
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Mã Nhiệm vụ</span>
              <span className="font-mono font-bold text-emerald-400">#{currentMission?.id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Mã Yêu cầu</span>
              <span className="font-mono font-bold text-slate-200">REQ-{currentMission?.requestId || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-mono">Xe Cứu Thương</span>
              <span className="font-mono font-bold text-indigo-300">{currentMission?.resourceCode || `AMB-${currentMission?.resourceId || '0'}`}</span>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 block uppercase font-mono">Mission Status</span>
                <button 
                  onClick={async () => {
                    setIsRefreshingMission(true);
                    await fetchLatestMission();
                    setIsRefreshingMission(false);
                  }}
                  disabled={isRefreshingMission}
                  title="Cập nhật trạng thái nhiệm vụ từ backend"
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={11} className={isRefreshingMission ? 'animate-spin' : ''} />
                </button>
              </div>
              <span className="font-mono font-bold text-amber-400">{currentMission?.status || 'DISPATCHED'}</span>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-950/50 border border-red-800 text-red-300 rounded-xl text-xs flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">
                  Lỗi thao tác mô phỏng {errorCode ? `(${errorCode})` : ''}:
                </span>
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
                  disabled={activeStatus === 'RUNNING' || Boolean(simulation?.id)}
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
                  disabled={activeStatus === 'RUNNING' || Boolean(simulation?.id)}
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
                  disabled={activeStatus === 'RUNNING' || Boolean(simulation?.id)}
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
                  disabled={activeStatus === 'RUNNING' || Boolean(simulation?.id)}
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

          {/* Live Interactive Map */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={14} className="text-emerald-400" />
                Bản đồ lộ trình di chuyển xe cấp cứu
              </span>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${phaseInfo.color}`}>
                  {activePhase}
                </span>
              </div>
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
                        <strong>Xe Cứu Thương: {currentMission?.resourceCode || `AMB-${currentMission?.resourceId || '0'}`}</strong>
                        <div>Vị trí: {lat.toFixed(4)}, {lng.toFixed(4)}</div>
                        <div>Tiến độ: {progressPercent?.toFixed(1)}%</div>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Incident / Destination Marker */}
                {currentMission?.latitude != null && currentMission?.longitude != null && (
                  <Marker position={[currentMission.latitude, currentMission.longitude]} icon={reqMarkerIcon}>
                    <Popup>
                      <div className="text-xs font-sans text-slate-900">
                        <strong>Hiện trường: REQ-{currentMission?.requestId}</strong>
                        <div>{currentMission?.address || 'Điểm xảy ra sự cố'}</div>
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
                        <div>{selectedHospital?.hospitalAddress || 'Bệnh viện'}</div>
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
                  Khoảng cách còn: <strong className="text-white">{remainingMeters > 1000 ? `${(remainingMeters / 1000).toFixed(2)} km` : `${Math.round(remainingMeters)} m`}</strong>
                </span>
                <span>
                  ETA: <strong className="text-amber-300">{etaSeconds > 60 ? `${Math.floor(etaSeconds / 60)}p ${Math.round(etaSeconds % 60)}s` : `${Math.round(etaSeconds)}s`}</strong>
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-800 bg-slate-950/90 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors cursor-pointer text-center"
          >
            Đóng
          </button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Case 5: Completed */}
            {activeStatus === 'COMPLETED' || activePhase === 'ARRIVED_HOSPITAL' || currentMission?.status === 'COMPLETED' ? (
              <div className="px-4 py-2 bg-emerald-950/60 border border-emerald-800 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                <CheckCircle2 size={16} />
                <span>Nhiệm vụ & Mô phỏng đã hoàn tất tại Bệnh viện</span>
              </div>
            ) : !simulation?.id ? (
              /* Case: Not created yet */
              <button
                onClick={handleCreateSimulation}
                disabled={isActionLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                <span>Khởi tạo phiên mô phỏng</span>
              </button>
            ) : activeStatus === 'RUNNING' ? (
              /* Case 2 & 4: Running -> Only Stop allowed, Start is hidden */
              <button
                onClick={handleStopSimulation}
                disabled={isActionLoading}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isStopping ? <RefreshCw size={15} className="animate-spin" /> : <Square size={15} />}
                <span>Dừng mô phỏng (/stop)</span>
              </button>
            ) : activePhase === 'AT_SCENE' ? (
              /* Case 3: Stopped at scene -> Continue */
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {currentMission?.status !== 'TRANSPORTING' && (
                  <span className="text-[11px] text-amber-400 bg-amber-950/50 border border-amber-800/70 px-2.5 py-1 rounded-lg text-center">
                    Cần tài xế bấm "Bắt đầu vận chuyển" (TRANSPORTING)
                  </span>
                )}
                <button
                  onClick={handleContinueSimulation}
                  disabled={isActionLoading || currentMission?.status !== 'TRANSPORTING'}
                  title={currentMission?.status !== 'TRANSPORTING' ? 'Nhiệm vụ phải ở trạng thái TRANSPORTING trước khi tiếp tục' : 'Tiếp tục chặng về bệnh viện'}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isContinuing ? <RefreshCw size={15} className="animate-spin" /> : <FastForward size={15} />}
                  <span>Tiếp tục chặng Bệnh viện (/continue)</span>
                </button>
              </div>
            ) : (
              /* Case 1: READY or Paused Leg 1/2 -> Start */
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                {activePhase === 'TO_SCENE' && currentMission?.status !== 'EN_ROUTE' && (
                  <span className="text-[11px] text-amber-400 bg-amber-950/50 border border-amber-800/70 px-2.5 py-1 rounded-lg text-center">
                    Cần tài xế bấm "Bắt đầu di chuyển" (EN_ROUTE)
                  </span>
                )}
                <button
                  onClick={handleStartSimulation}
                  disabled={isActionLoading || (activePhase === 'TO_SCENE' && currentMission?.status !== 'EN_ROUTE')}
                  title={activePhase === 'TO_SCENE' && currentMission?.status !== 'EN_ROUTE' ? 'Nhiệm vụ phải ở trạng thái EN_ROUTE trước khi bắt đầu' : 'Bắt đầu chạy mô phỏng OSRM'}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isStarting ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
                  <span>{activeStatus === 'STOPPED' ? 'Tiếp tục chạy mô phỏng (/start)' : 'Bắt đầu chạy OSRM (/start)'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SimulationControlModal;
