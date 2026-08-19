import React, { useState, useEffect, useCallback } from 'react';
import { 
  X, Play, Square, Gauge, Clock, MapPin, Building2, 
  AlertTriangle, CheckCircle2, RefreshCw, Zap, ShieldCheck, 
  Navigation, Navigation2, Activity
} from 'lucide-react';
import ambulanceSimulationService from '../../../services/ambulanceSimulationService';
import { providerService } from '../../../services/providerService';
import useAmbulanceTracking from '../../../hooks/useAmbulanceTracking';

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
      providerService.getAll()
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
            // No active simulation yet
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
      await ambulanceSimulationService.start(simulation.id);
      setSimulation(prev => ({ ...prev, status: 'RUNNING' }));
      refreshSnapshot();
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
    setErrorMessage('');
    try {
      await ambulanceSimulationService.stop(simulation.id);
      setSimulation(prev => ({ ...prev, status: 'STOPPED' }));
      refreshSnapshot();
      if (onRequestRefresh) onRequestRefresh();
    } catch (err) {
      console.error('Stop simulation error:', err);
      setErrorMessage(err.response?.data?.message || 'Không thể tạm dừng mô phỏng!');
    } finally {
      setIsStopping(false);
    }
  };

  if (!isOpen) return null;

  // Active tracking values merged from WebSocket or REST snapshot
  const activePhase = singleTracking?.phase || simulation?.phase || 'CHƯA BẮT ĐẦU';
  const activeStatus = singleTracking?.status || simulation?.status || 'READY';
  const progressPercent = singleTracking?.progressPercent ?? 0;
  const remainingMeters = singleTracking?.remainingDistanceMeters ?? 0;
  const etaSeconds = singleTracking?.etaSeconds ?? 0;
  const lat = singleTracking?.latitude || simulation?.currentLatitude;
  const lng = singleTracking?.longitude || simulation?.currentLongitude;

  // Format Helper for Phase UI
  const getPhaseDisplay = (p) => {
    switch (p) {
      case 'TO_SCENE':
        return { label: 'Đang di chuyển đến hiện trường', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
      case 'AT_SCENE':
        return { label: 'Đang xử lý tại hiện trường', color: 'text-blue-400 bg-blue-500/10 border-blue-500/30' };
      case 'TO_HOSPITAL':
        return { label: 'Đang di chuyển về bệnh viện', color: 'text-purple-400 bg-purple-500/10 border-purple-500/30' };
      case 'ARRIVED_HOSPITAL':
      case 'COMPLETED':
        return { label: 'Đã đến bệnh viện - Hoàn tất', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      default:
        return { label: p, color: 'text-slate-400 bg-slate-800 border-slate-700' };
    }
  };

  const phaseInfo = getPhaseDisplay(activePhase);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden font-sans flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap size={22} className="animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Mô phỏng Hành trình OSRM
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 font-mono font-bold">
                  Mission #{mission?.id}
                </span>
                {mission?.requestId && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    REQ-{mission?.requestId}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Tính toán đường đi qua OSRM & Phát vị trí Real-time qua WebSocket STOMP
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          
          {/* Mission Details Summary Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 block">Mã Nhiệm vụ (Mission):</span>
              <span className="font-mono font-bold text-emerald-400">#{mission?.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Mã Yêu cầu (Request):</span>
              <span className="font-mono font-bold text-slate-300">{mission?.requestId ? `REQ-${mission.requestId}` : 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Mã xe cứu thương:</span>
              <span className="font-mono font-bold text-indigo-400">{mission?.resourceCode || (mission?.resourceId ? `Xe #${mission.resourceId}` : 'Xe Cấp cứu')}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Trạng thái nhiệm vụ:</span>
              <span className="font-mono text-emerald-400 font-semibold">{mission?.status || 'EN_ROUTE'}</span>
            </div>
          </div>

          {/* Error Banner Handler */}
          {errorMessage && (
            <div className="bg-red-950/60 border border-red-800 rounded-xl p-4 text-xs text-red-200 space-y-1">
              <div className="flex items-center gap-2 font-bold text-red-400">
                <AlertTriangle size={16} />
                <span>Lỗi mô phỏng ({errorCode || 'ERROR'})</span>
              </div>
              <p className="text-red-300">{errorMessage}</p>

              {errorCode === 502 || errorCode === 'OSRM_UNAVAILABLE' ? (
                <div className="mt-2 text-[11px] bg-red-900/30 p-2 rounded border border-red-800/50 font-mono text-red-300">
                  ⚠️ Đảm bảo OSRM Docker container đang chạy trên port 5000:
                  <br />
                  <code>docker run -p 5000:5000 ghcr.io/project-osrm/osrm-backend</code>
                </div>
              ) : null}
            </div>
          )}

          {/* Config Parameters Form */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Gauge size={14} className="text-indigo-400" />
              Cấu hình thông số mô phỏng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Target Hospital Selector */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                  <Building2 size={14} className="text-slate-400" />
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
                      {h.providerName || h.name || `Hospital #${h.id}`} ({h.contactAddress || 'Hà Nội'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Speed Multiplier */}
              <div>
                <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-400" />
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
                <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-slate-400" />
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
                <label className="text-xs text-slate-300 font-medium block mb-1.5 flex items-center gap-1.5">
                  <Clock size={14} className="text-blue-400" />
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

          {/* Live Simulation Tracking Dashboard Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${activeStatus === 'RUNNING' ? 'bg-emerald-500 animate-ping' : 'bg-slate-600'}`} />
                <h4 className="font-bold text-xs text-slate-200 uppercase tracking-wider">
                  Bảng Điều Khiển Live Telemetry
                </h4>
              </div>

              {/* WS Live Badge */}
              <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-mono flex items-center gap-1.5 ${isConnected ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-amber-950/60 text-amber-400 border-amber-800'}`}>
                <Activity size={12} className={isConnected ? 'animate-pulse' : ''} />
                <span>{isConnected ? 'WebSocket Realtime' : 'REST Polling'}</span>
              </div>
            </div>

            {/* Current Phase Badge */}
            <div className={`px-3 py-2 rounded-lg border text-xs font-semibold flex items-center justify-between ${phaseInfo.color}`}>
              <div className="flex items-center gap-2">
                <Navigation2 size={16} className="animate-spin" />
                <span>{phaseInfo.label}</span>
              </div>
              <span className="font-mono text-[11px] opacity-80 uppercase">{activeStatus}</span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Tiến độ chặng:</span>
                <span className="text-indigo-400 font-bold">{progressPercent?.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                />
              </div>
            </div>

            {/* Telemetry Metrics Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase">Khoảng cách còn lại</span>
                <span className="text-slate-100 font-bold text-sm">
                  {remainingMeters > 1000 ? `${(remainingMeters / 1000).toFixed(2)} km` : `${Math.round(remainingMeters)} m`}
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase">Thời gian dự kiến (ETA)</span>
                <span className="text-amber-400 font-bold text-sm">
                  {etaSeconds > 60 ? `${Math.floor(etaSeconds / 60)} phút ${Math.round(etaSeconds % 60)}s` : `${Math.round(etaSeconds)} giây`}
                </span>
              </div>

              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                <span className="text-[10px] text-slate-500 block uppercase">Tọa độ GPS OSRM</span>
                <span className="text-indigo-300 font-mono text-[11px] block truncate">
                  {lat && lng ? `${lat.toFixed(4)}, ${lng.toFixed(4)}` : 'Chưa có tọa độ'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-colors"
          >
            Đóng
          </button>

          <div className="flex items-center gap-3">
            {!simulation ? (
              <button
                onClick={handleCreateSimulation}
                disabled={isCreating}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
              >
                {isCreating ? <RefreshCw size={15} className="animate-spin" /> : <Zap size={15} />}
                <span>Khởi tạo phiên mô phỏng</span>
              </button>
            ) : (
              <>
                {activeStatus === 'RUNNING' ? (
                  <button
                    onClick={handleStopSimulation}
                    disabled={isStopping}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-amber-600/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isStopping ? <RefreshCw size={15} className="animate-spin" /> : <Square size={15} />}
                    <span>Tạm dừng mô phỏng (Stop)</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStartSimulation}
                    disabled={isStarting}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isStarting ? <RefreshCw size={15} className="animate-spin" /> : <Play size={15} />}
                    <span>Bắt đầu di chuyển OSRM (Start)</span>
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
