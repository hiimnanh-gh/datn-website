import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle2, ShieldAlert, 
  MapPin, Truck, Check, Info, FileText, Send, User, ChevronRight, X, UserCheck, Sparkles, Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import useAuthStore from '../../../store/useAuthStore';
import { dispatchRequestService } from '../../../services/dispatchRequestService';
import { dispatchResourceService } from '../../../services/dispatchResourceService';
import { dispatchMissionService } from '../../../services/dispatchMissionService';
import { providerService } from '../../../services/providerService';
import { serviceTypeService } from '../../../services/serviceTypeService';
import { edgeNodeService } from '../../../services/edgeNodeService';
import wsService from '../../../services/websocket';
import SimulationControlModal from '../components/SimulationControlModal';

// Leaflet default icon fix
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const reqMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const getUrgencyBadge = (urgency) => {
  switch (urgency?.toUpperCase()) {
    case 'CRITICAL':
      return { label: 'CRITICAL - Khẩn cấp cực cao', bg: 'bg-red-500/20 text-red-400 border-red-500/40' };
    case 'HIGH':
      return { label: 'HIGH - Khẩn cấp cao', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    case 'MEDIUM':
      return { label: 'MEDIUM - Khẩn cấp trung bình', bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' };
    case 'LOW':
    default:
      return { label: 'LOW - Thấp', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  }
};

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'READY':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'DISPATCHED':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    case 'CANCELLED':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'COMPLETED':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

const EmergencyIntakeDispatch = () => {
  const { user } = useAuthStore();

  // Data states
  const [requests, setRequests] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);

  const [providers, setProviders] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [edgeNodes, setEdgeNodes] = useState([]);

  // UI & Loading states
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [isLoadingReqDetail, setIsLoadingReqDetail] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [isSubmittingMission, setIsSubmittingMission] = useState(false);

  const [apiError, setApiError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  // Filter states
  const [reqSearch, setReqSearch] = useState('');
  const [reqUrgencyFilter, setReqUrgencyFilter] = useState('ALL');
  const [reqStatusFilter, setReqStatusFilter] = useState('ALL');
  const [reqServiceTypeFilter, setReqServiceTypeFilter] = useState('ALL');
  const [reqEdgeNodeFilter, setReqEdgeNodeFilter] = useState('ALL');

  const [resStatusFilter, setResStatusFilter] = useState('ALL');
  const [resTypeFilter, setResTypeFilter] = useState('ALL');
  const [resProviderFilter, setResProviderFilter] = useState('ALL');
  const [resEdgeNodeFilter, setResEdgeNodeFilter] = useState('ALL');

  // Dispatch Form & Modal
  const [destinationName, setDestinationName] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdMission, setCreatedMission] = useState(null);
  const [resourceDetailModal, setResourceDetailModal] = useState(null);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [simulatingMission, setSimulatingMission] = useState(null);
  const [isLoadingMissionForSim, setIsLoadingMissionForSim] = useState(false);

  // New Request Action States
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timelineModal, setTimelineModal] = useState(null);
  const [recsModal, setRecsModal] = useState(null);

  const handleVerifyRequest = async () => {
    if (!selectedRequest) return;
    try {
      await dispatchRequestService.verify(selectedRequest.id);
      // Auto trigger getRecommendations to transition status to RECOMMENDING
      await dispatchRequestService.getRecommendations(selectedRequest.id).catch(() => {});
      alert(`Đã xác minh và chuẩn bị gợi ý xe thành công cho REQ-${selectedRequest.id}`);
      fetchReqDetail(selectedRequest.id);
      fetchRequestsAndCatalogs();
    } catch (err) {
      alert('Lỗi xác minh: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    const reason = prompt('Nhập lý do từ chối (báo động giả / trùng lặp):');
    if (reason === null) return;
    try {
      await dispatchRequestService.reject(selectedRequest.id, reason);
      alert(`Đã từ chối yêu cầu REQ-${selectedRequest.id}`);
      fetchReqDetail(selectedRequest.id);
      fetchRequestsAndCatalogs();
    } catch (err) {
      alert('Lỗi từ chối ca: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAnalyzeAI = async () => {
    if (!selectedRequest) return;
    setIsAnalyzing(true);
    try {
      const res = await dispatchRequestService.analyze(selectedRequest.id);
      alert('Phân tích AI hoàn tất! Mức độ nghiêm trọng gợi ý: ' + (res?.urgencyLevel || res?.severity || 'HIGH'));
      fetchReqDetail(selectedRequest.id);
    } catch (err) {
      alert('Lỗi phân tích AI: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUpdateSeverity = async (newLevel) => {
    if (!selectedRequest || !newLevel) return;
    try {
      await dispatchRequestService.updateSeverity(selectedRequest.id, newLevel);
      fetchReqDetail(selectedRequest.id);
      fetchRequestsAndCatalogs();
    } catch (err) {
      alert('Lỗi cập nhật mức độ khẩn cấp: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFetchTimeline = async () => {
    if (!selectedRequest) return;
    try {
      const data = await dispatchRequestService.getTimeline(selectedRequest.id);
      setTimelineModal({ requestId: selectedRequest.id, items: Array.isArray(data) ? data : [] });
    } catch (err) {
      alert('Lỗi tải timeline: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFetchRecommendations = async () => {
    if (!selectedRequest) return;
    try {
      const recs = await dispatchRequestService.getRecommendations(selectedRequest.id);
      setRecsModal({ requestId: selectedRequest.id, items: Array.isArray(recs) ? recs : [] });
      fetchReqDetail(selectedRequest.id);
      fetchRequestsAndCatalogs();
    } catch (err) {
      alert('Lỗi tải gợi ý xe: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenSimulation = (mission) => {
    if (!mission || !mission.id) return;
    setSimulatingMission(mission);
    setIsSimulationModalOpen(true);
  };

  const handleOpenSimulationForRequest = async (request) => {
    if (!request || !request.id) return;
    setIsLoadingMissionForSim(true);
    try {
      let targetMission = null;

      // 1. If request already contains missionId
      if (request.missionId) {
        try {
          targetMission = await dispatchMissionService.getById(request.missionId);
        } catch (e) {
          targetMission = { id: request.missionId };
        }
      }

      // 2. Fetch mission by requestId from backend dispatch missions
      if (!targetMission || !targetMission.id) {
        targetMission = await dispatchMissionService.getByRequestId(request.id);
      }

      // 3. If no mission found, alert user clearly without fallback to request.id
      if (!targetMission || !targetMission.id) {
        alert(`Không tìm thấy Lệnh điều xe (Mission) tương ứng với yêu cầu REQ-${request.id}. Vui lòng tạo lệnh điều xe trước khi chạy mô phỏng!`);
        return;
      }

      setSimulatingMission({
        id: targetMission.id, // Actual Mission ID (e.g. 8), NEVER request.id (e.g. 17)
        requestId: request.id,
        resourceCode: targetMission.resourceCode || request.resourceCode || (targetMission.resourceId ? `Xe #${targetMission.resourceId}` : 'Xe Cấp cứu'),
        resourceId: targetMission.resourceId || request.resourceId,
        status: targetMission.status || 'ACCEPTED',
        driverName: targetMission.driverName || targetMission.driver?.fullName || 'Đã điều phối'
      });
      setIsSimulationModalOpen(true);
    } catch (err) {
      console.error('Error opening simulation for request:', err);
      alert('Lỗi tải thông tin Mission: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoadingMissionForSim(false);
    }
  };

  // 1. Fetch Request List & Supporting Catalogs
  const fetchRequestsAndCatalogs = useCallback(async () => {
    setIsLoadingRequests(true);
    setApiError(null);
    try {
      const [reqData, provData, stData, enData] = await Promise.all([
        dispatchRequestService.getAll(),
        providerService.getAll().catch(() => []),
        serviceTypeService.getAll().catch(() => []),
        edgeNodeService.getAll().catch(() => []),
      ]);

      const reqList = Array.isArray(reqData) ? reqData : [];
      setRequests(reqList);
      setProviders(Array.isArray(provData) ? provData : []);
      setServiceTypes(Array.isArray(stData) ? stData : []);
      setEdgeNodes(Array.isArray(enData) ? enData : []);

      // Auto-select first request if none selected
      if (reqList.length > 0 && !selectedReqId) {
        setSelectedReqId(reqList[0].id);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching requests:', err);
      if (err.response?.status === 401) {
        setApiError('Phiên đăng nhập đã hết hạn');
      } else {
        setApiError('Không thể kết nối API Dispatch Requests. Vui lòng kiểm tra Server.');
      }
    } finally {
      setIsLoadingRequests(false);
    }
  }, [selectedReqId]);

  // 2. Fetch Resources List
  const fetchResources = useCallback(async () => {
    setIsLoadingResources(true);
    try {
      const resData = await dispatchResourceService.getAll();
      setResources(Array.isArray(resData) ? resData : []);
    } catch (err) {
      console.error('Error fetching resources:', err);
    } finally {
      setIsLoadingResources(false);
    }
  }, []);

  // 3. Fetch Single Request Detail when selectedReqId changes
  const fetchReqDetail = useCallback(async (reqId) => {
    const idToFetch = reqId || selectedReqId;
    if (!idToFetch) {
      setSelectedRequest(null);
      return;
    }
    setIsLoadingReqDetail(true);
    try {
      const detail = await dispatchRequestService.getById(idToFetch);
      setSelectedRequest(detail);
      setDestinationName(`Hiện trường yêu cầu REQ-${detail.id}`);
    } catch (err) {
      console.error('Error fetching request detail:', err);
      // Fallback to item in request list
      const fallback = requests.find(r => r.id === idToFetch);
      setSelectedRequest(fallback || null);
    } finally {
      setIsLoadingReqDetail(false);
    }
  }, [selectedReqId, requests]);

  useEffect(() => {
    fetchReqDetail(selectedReqId);
  }, [selectedReqId, fetchReqDetail]);

  // Initial Load & Polling setup
  useEffect(() => {
    fetchRequestsAndCatalogs();
    fetchResources();

    // WebSocket connection attempt
    wsService.connect(
      () => {
        setWsConnected(true);
        wsService.subscribe('/topic/dispatches', () => {
          fetchRequestsAndCatalogs();
        });
        wsService.subscribe('/topic/dispatcher/missions', () => {
          fetchResources();
        });
      },
      (err) => {
        console.warn('WebSocket error, falling back to REST polling:', err);
        setWsConnected(false);
      }
    );

    // Fallback polling interval 15s
    const pollInterval = setInterval(() => {
      fetchRequestsAndCatalogs();
      fetchResources();
    }, 15000);

    return () => {
      clearInterval(pollInterval);
      wsService.disconnect();
    };
  }, [fetchRequestsAndCatalogs, fetchResources]);

  // Manual Refresh Handler
  const handleRefresh = () => {
    fetchRequestsAndCatalogs();
    fetchResources();
  };

  // Filter requests
  const filteredRequests = requests.filter(req => {
    const codeMatch = reqSearch ? `REQ-${req.id}`.toLowerCase().includes(reqSearch.toLowerCase()) || req.id.toString().includes(reqSearch) : true;
    const urgencyMatch = reqUrgencyFilter === 'ALL' || req.urgencyLevel === reqUrgencyFilter;
    const statusMatch = reqStatusFilter === 'ALL' || req.status === reqStatusFilter;
    const typeMatch = reqServiceTypeFilter === 'ALL' || req.serviceTypeId === Number(reqServiceTypeFilter);
    const edgeMatch = reqEdgeNodeFilter === 'ALL' || req.edgeNodeId === Number(reqEdgeNodeFilter);
    return codeMatch && urgencyMatch && statusMatch && typeMatch && edgeMatch;
  });

  // Filter resources
  const filteredResources = resources.filter(res => {
    const statusMatch = resStatusFilter === 'ALL' || res.status === resStatusFilter;
    const typeMatch = resTypeFilter === 'ALL' || res.resourceTypeId === Number(resTypeFilter);
    const provMatch = resProviderFilter === 'ALL' || res.providerId === Number(resProviderFilter);
    const edgeMatch = resEdgeNodeFilter === 'ALL' || res.edgeNodeId === Number(resEdgeNodeFilter);
    return statusMatch && typeMatch && provMatch && edgeMatch;
  });

  // Handle open Dispatch Confirmation Modal
  const handlePreDispatchCheck = async () => {
    if (!selectedRequest) {
      alert('Vui lòng chọn một Yêu cầu điều phối!');
      return;
    }
    if (!selectedResource) {
      alert('Vui lòng chọn một Tài nguyên xe có sẵn (AVAILABLE)!');
      return;
    }
    if (selectedResource.status !== 'AVAILABLE') {
      alert('Tài nguyên đã chọn không ở trạng thái SẴN SÀNG (AVAILABLE)!');
      return;
    }

    // Re-verify resource status from API before showing modal
    try {
      const freshRes = await dispatchResourceService.getById(selectedResource.id);
      if (freshRes.status !== 'AVAILABLE') {
        alert(`Tài nguyên ${freshRes.resourceCode} vừa thay đổi trạng thái sang ${freshRes.status}. Vui lòng chọn xe khác!`);
        fetchResources();
        return;
      }
      setShowConfirmModal(true);
    } catch (err) {
      console.error('Error verifying resource status:', err);
      setShowConfirmModal(true);
    }
  };

  // Submit POST /api/v1/dispatch-missions
  const handleConfirmDispatch = async () => {
    setIsSubmittingMission(true);
    try {
      // Backend requires Request to be in status 'RECOMMENDING' before creating a mission
      if (selectedRequest && selectedRequest.status !== 'RECOMMENDING' && selectedRequest.status !== 'DISPATCHED') {
        try {
          if (selectedRequest.status === 'PENDING') {
            await dispatchRequestService.verify(selectedRequest.id).catch(() => {});
          }
          await dispatchRequestService.getRecommendations(selectedRequest.id).catch(() => {});
        } catch (e) {
          console.warn('Auto transition to RECOMMENDING failed:', e);
        }
      }

      const payload = {
        requestId: selectedRequest.id,
        resourceId: selectedResource.id,
        destinationName: destinationName || `Hiện trường yêu cầu REQ-${selectedRequest.id}`,
        notes: dispatchNotes || 'Phát lệnh bởi điều phối viên'
      };

      const mission = await dispatchMissionService.create(payload);
      setCreatedMission(mission);
      setShowConfirmModal(false);
      
      // Refresh resources & requests after mission creation
      fetchRequestsAndCatalogs();
      fetchResources();
      if (selectedRequest?.id) {
        fetchReqDetail(selectedRequest.id);
      }
    } catch (err) {
      console.error('Error creating mission:', err);
      alert('Tạo lệnh điều xe thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingMission(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
      {/* ── HEADER (VÙNG A) ── */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <ShieldAlert size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base text-slate-100 flex items-center gap-2">
              Tiếp nhận & Điều phối
              <span className="text-xs font-normal text-slate-400 font-mono">Emergency Intake & Dispatch</span>
            </h1>
          </div>
        </div>

        {/* System Status Indicators */}
        <div className="flex items-center gap-4 text-xs">
          {/* WebSocket Badge */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${wsConnected ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' : 'bg-amber-950/40 text-amber-400 border-amber-800'}`}>
            {wsConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{wsConnected ? 'WebSocket Live' : 'REST Polling'}</span>
          </div>

          {/* API Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${apiError ? 'bg-red-950/40 text-red-400 border-red-800' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
            <span className={`w-2 h-2 rounded-full ${apiError ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <span>{apiError ? 'Lỗi API' : 'API OK'}</span>
          </div>

          {/* Last updated */}
          <span className="text-slate-400 font-mono hidden md:inline">
            Cập nhật: {lastUpdated}
          </span>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 active:scale-95"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={15} className={isLoadingRequests ? 'animate-spin' : ''} />
          </button>

          {/* User profile info */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
            <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-xs text-white">
              {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'D'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="font-medium leading-none text-slate-200">{user?.fullName || user?.username || 'Dispatcher'}</div>
              <div className="text-[10px] text-indigo-400 font-mono mt-0.5">{user?.role || 'DISPATCHER'}</div>
            </div>
          </div>
        </div>
      </header>

      {/* API Error Toast Banner */}
      {apiError && (
        <div className="bg-red-950/80 border-b border-red-800 px-4 py-2 text-xs text-red-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-red-400" />
            <span>{apiError}</span>
          </div>
          <button onClick={handleRefresh} className="underline text-red-300 hover:text-white">Thử lại</button>
        </div>
      )}

      {/* ── 3-COLUMN MAIN CONTAINER ── */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ── CỘT TRÁI (VÙNG B): HÀNG ĐỢI YÊU CẦU (30%) ── */}
        <section className="w-[30%] border-r border-slate-800 flex flex-col bg-slate-900/50">
          {/* Header & Filter Toolbar */}
          <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                Hàng đợi Yêu cầu
                <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[11px] font-mono">
                  {filteredRequests.length}
                </span>
              </span>
            </div>

            {/* Search Input */}
            <input
              type="text"
              placeholder="Search Request ID..."
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <select
                value={reqUrgencyFilter}
                onChange={(e) => setReqUrgencyFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none"
              >
                <option value="ALL">Mức độ: Tất cả</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              <select
                value={reqStatusFilter}
                onChange={(e) => setReqStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none"
              >
                <option value="ALL">Trạng thái: Tất cả</option>
                <option value="PENDING">PENDING</option>
                <option value="READY">READY</option>
                <option value="DISPATCHED">DISPATCHED</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>

              <select
                value={reqServiceTypeFilter}
                onChange={(e) => setReqServiceTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none col-span-2"
              >
                <option value="ALL">Loại dịch vụ: Tất cả</option>
                {serviceTypes.map(st => (
                  <option key={st.id} value={st.id}>{st.displayName || st.typeCode}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Request Queue List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoadingRequests ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-20 bg-slate-800/40 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Không tìm thấy yêu cầu điều phối phù hợp.
              </div>
            ) : (
              filteredRequests.map(req => {
                const urgency = getUrgencyBadge(req.urgencyLevel);
                const isSelected = selectedReqId === req.id;
                const hasCoords = req.latitude != null && req.longitude != null;
                const hasExtended = req.extendedRequirements && Object.keys(req.extendedRequirements).length > 0;

                return (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReqId(req.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono font-bold text-xs text-indigo-400">
                        REQ-{req.id}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${urgency.bg}`}>
                        {req.urgencyLevel || 'LOW'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium mb-1 line-clamp-1">
                      {req.serviceTypeName || 'Dịch vụ Cấp cứu'}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Vùng: {req.edgeNodeName || 'Toàn quốc'}</span>
                      <span className={`px-1.5 py-0.2 rounded border ${getStatusBadge(req.status)}`}>
                        {req.status}
                      </span>
                    </div>

                    {/* Indicators */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={11} className={hasCoords ? 'text-emerald-400' : 'text-slate-600'} />
                        {hasCoords ? 'Có tọa độ GPS' : 'Thiếu GPS'}
                      </span>
                      {hasExtended && (
                        <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                          +Requirements
                        </span>
                      )}
                      <span className="font-mono text-slate-500">
                        {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* ── CỘT GIỮA (VÙNG C): CHI TIẾT DISPATCH REQUEST (38%) ── */}
        <section className="w-[38%] border-r border-slate-800 flex flex-col bg-slate-950">
          {/* Detail Request Header Bar */}
          <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900 shrink-0">
            <h2 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center gap-2">
              Chi tiết Dispatch Request
              {selectedRequest && (
                <span className="text-[11px] font-mono text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/50">
                  REQ-{selectedRequest.id}
                </span>
              )}
            </h2>
            {selectedRequest && (
              <button
                onClick={fetchReqDetail}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
              >
                <RefreshCw size={11} className={isLoadingReqDetail ? 'animate-spin' : ''} />
                Làm mới
              </button>
            )}
          </div>

          {/* Detail Panel Scroll-Free Content */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-sans">
            {isLoadingReqDetail ? (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <RefreshCw className="animate-spin text-indigo-500 mx-auto" size={24} />
                <p className="text-xs font-mono">Đang tải chi tiết request...</p>
              </div>
            ) : !selectedRequest ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Vui lòng chọn một Request từ danh sách bên trái để xem chi tiết.
              </div>
            ) : (
              <>
                {/* 1. Request Primary Info Card */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-100 text-sm">REQ-{selectedRequest.id}</span>
                      <span className="text-[10px] text-slate-400">Call ID: #{selectedRequest.callId || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${getStatusBadge(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${getUrgencyBadge(selectedRequest.urgencyLevel).bg}`}>
                        {selectedRequest.urgencyLevel}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-300 font-sans">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-mono">Loại dịch vụ</span>
                      <span className="font-semibold text-indigo-300 text-[12px]">{selectedRequest.serviceTypeName || `ID: ${selectedRequest.serviceTypeId}`}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-mono">Vùng quản lý (Node)</span>
                      <span className="font-semibold text-slate-200 text-[12px]">
                        {selectedRequest.edgeNodeName || selectedRequest.operationZoneName || selectedRequest.zoneName || (selectedRequest.edgeNodeId || selectedRequest.operationZoneId || selectedRequest.zoneId ? `Node #${selectedRequest.edgeNodeId || selectedRequest.operationZoneId || selectedRequest.zoneId}` : 'Chưa phân vùng')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-mono">Điều phối viên</span>
                      <span className="font-medium text-slate-300 text-[11px]">{selectedRequest.createdByDispatcherName || 'Hệ thống kịch bản'}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase font-mono">Đồng bộ Cloud</span>
                      <span className="font-medium text-slate-300 text-[11px]">{selectedRequest.isSyncedToCloud ? 'Đã đồng bộ' : 'Chưa đồng bộ'}</span>
                    </div>
                  </div>

                  {/* Operational Action Bar for Dispatcher */}
                  <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <button
                      onClick={handleVerifyRequest}
                      className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60 rounded font-medium flex items-center gap-1"
                      title="Xác minh yêu cầu cấp cứu"
                    >
                      <CheckCircle2 size={12} />
                      Xác minh
                    </button>

                    <button
                      onClick={handleRejectRequest}
                      className="px-2 py-1 bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 rounded font-medium flex items-center gap-1"
                      title="Từ chối / Báo động giả"
                    >
                      <X size={12} />
                      Từ chối
                    </button>

                    <button
                      onClick={handleAnalyzeAI}
                      disabled={isAnalyzing}
                      className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 rounded font-medium flex items-center gap-1"
                      title="Chạy phân tích AI"
                    >
                      <Sparkles size={12} className={isAnalyzing ? 'animate-spin' : ''} />
                      {isAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                    </button>

                    <button
                      onClick={handleFetchRecommendations}
                      className="px-2 py-1 bg-amber-950/60 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded font-medium flex items-center gap-1"
                      title="Top 3 xe đề xuất tốt nhất"
                    >
                      <Truck size={12} />
                      Top 3 Xe
                    </button>

                    <button
                      onClick={handleFetchTimeline}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium flex items-center gap-1"
                      title="Xem lịch sử xử lý"
                    >
                      <FileText size={12} />
                      Timeline
                    </button>

                    <select
                      value={selectedRequest.urgencyLevel || 'LOW'}
                      onChange={(e) => handleUpdateSeverity(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none ml-auto text-[10px]"
                      title="Thay đổi mức độ nghiêm trọng"
                    >
                      <option value="CRITICAL">Urgency: CRITICAL</option>
                      <option value="HIGH">Urgency: HIGH</option>
                      <option value="MEDIUM">Urgency: MEDIUM</option>
                      <option value="LOW">Urgency: LOW</option>
                    </select>
                  </div>
                </div>

                {/* 2. Extended Requirements Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <h3 className="font-bold text-xs text-slate-200 flex items-center gap-1.5 border-b border-slate-800/80 pb-1.5 uppercase tracking-wider">
                    <FileText size={13} className="text-indigo-400" />
                    Yêu cầu mở rộng (Extended Requirements)
                  </h3>
                  {selectedRequest.extendedRequirements ? (
                    <div className="space-y-1.5 pt-0.5">
                      {selectedRequest.extendedRequirements.symptoms && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px] shrink-0 font-mono">Triệu chứng:</span>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(selectedRequest.extendedRequirements.symptoms) ? (
                              selectedRequest.extendedRequirements.symptoms.map((symptom, idx) => (
                                <span key={idx} className="bg-red-950/60 text-red-300 border border-red-800/60 px-1.5 py-0.2 rounded text-[10px] font-mono">
                                  {symptom}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-300 text-[11px]">{selectedRequest.extendedRequirements.symptoms}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedRequest.extendedRequirements.equipment && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px] shrink-0 font-mono">Thiết bị:</span>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(selectedRequest.extendedRequirements.equipment) ? (
                              selectedRequest.extendedRequirements.equipment.map((eq, idx) => (
                                <span key={idx} className="bg-blue-950/60 text-blue-300 border border-blue-800/60 px-1.5 py-0.2 rounded text-[10px] font-mono">
                                  {eq}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-300 text-[11px]">{selectedRequest.extendedRequirements.equipment}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedRequest.extendedRequirements.notes && (
                        <div className="text-[11px] text-slate-300 italic bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          "{selectedRequest.extendedRequirements.notes}"
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[10px] italic">Không có thông tin yêu cầu mở rộng.</p>
                  )}
                </div>

                {/* 3. Location & Tactical Map Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="flex items-center gap-1.5 font-bold text-xs text-slate-200 uppercase tracking-wider">
                      <MapPin size={13} className="text-emerald-400" />
                      Vị trí Sự cố Khẩn cấp
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      {selectedRequest.latitude && selectedRequest.longitude ? `${selectedRequest.latitude}, ${selectedRequest.longitude}` : 'N/A'}
                    </span>
                  </div>

                  {selectedRequest.latitude != null && selectedRequest.longitude != null ? (
                    <div className="h-32 w-full rounded-lg overflow-hidden border border-slate-800 relative z-0">
                      <MapContainer
                        key={selectedRequest.id}
                        center={[selectedRequest.latitude, selectedRequest.longitude]}
                        zoom={14}
                        className="w-full h-full"
                        zoomControl={false}
                      >
                        <TileLayer
                          attribution='&copy; OpenStreetMap'
                          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />
                        <Marker
                          position={[selectedRequest.latitude, selectedRequest.longitude]}
                          icon={reqMarkerIcon}
                        >
                          <Popup>
                            <div className="text-xs font-sans text-slate-900">
                              <strong>REQ-{selectedRequest.id}</strong>
                              <div>{selectedRequest.serviceTypeName}</div>
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center text-slate-500 text-[11px]">
                      <AlertTriangle size={18} className="mx-auto mb-1 text-amber-500/60" />
                      Chưa có dữ liệu vị trí GPS cho yêu cầu này.
                    </div>
                  )}
                </div>

                {/* 4. Streamlined Call & AI Info Footer Row */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-slate-400 flex items-center gap-2">
                    <Info size={14} className="text-slate-500 shrink-0" />
                    <div className="text-[10px] leading-tight">
                      <strong className="text-slate-300">Call ID #{selectedRequest.callId || 'N/A'}:</strong>
                      <p className="text-slate-500 text-[9px] mt-0.5">Tích hợp API Emergency Call.</p>
                    </div>
                  </div>

                  <div className="bg-indigo-950/30 border border-indigo-900/50 rounded-xl p-2 text-indigo-300 flex items-center gap-2">
                    <Sparkles size={14} className="text-indigo-400 shrink-0" />
                    <div className="text-[10px] leading-tight">
                      <strong className="text-indigo-200">Gợi ý hỗ trợ từ AI:</strong>
                      <p className="text-indigo-300/80 text-[9px] mt-0.5">
                        Ưu tiên vùng <strong>{selectedRequest.edgeNodeName || 'Đống Đa'}</strong> • {selectedRequest.serviceTypeName || 'ALS'}
                      </p>
                    </div>
                  </div>
                </div>

              </>
            )}
          </div>
        </section>

        {/* ── CỘT PHẢI (VÙNG D): TÀI NGUYÊN & PHÁT LỆNH (32%) ── */}
        <section className="w-[32%] flex flex-col bg-slate-900/30 font-sans">
          
          {selectedRequest && (selectedRequest.status === 'DISPATCHED' || selectedRequest.status === 'COMPLETED') ? (
            /* ── VIEW DÀNH CHO YÊU CẦU ĐÃ ĐƯỢC GIAO XE (DISPATCHED) ── */
            <div className="flex-1 flex flex-col p-4 bg-slate-900 border-l border-slate-800 justify-between overflow-y-auto space-y-4 font-sans">
              <div className="space-y-4">
                {/* Header Badge */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                      Trạng thái Điều xe
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2.5 py-1 rounded-full">
                    DISPATCHED
                  </span>
                </div>

                {/* Main Dispatched Mission Banner */}
                <div className="bg-slate-950/90 border border-emerald-500/40 p-4 rounded-2xl space-y-3 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 size={18} />
                    <span>YÊU CẦU REQ-{selectedRequest.id} ĐÃ ĐƯỢC GIAO XE</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    Lệnh điều động cấp cứu đã được khởi tạo thành công trên hệ thống và chuyển sang trạng thái chờ phản hồi.
                  </p>

                  {/* Info Table */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Mã Yêu cầu</span>
                      <strong className="text-red-400 text-sm font-bold">REQ-{selectedRequest.id}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Mức độ Khẩn cấp</span>
                      <span className="text-amber-400 font-bold">{selectedRequest.urgencyLevel}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Loại Dịch vụ</span>
                      <span className="text-indigo-300">{selectedRequest.serviceTypeName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Khu vực (Node)</span>
                      <span className="text-slate-300">{selectedRequest.edgeNodeName}</span>
                    </div>
                  </div>

                  {/* Driver Waiting Wave Banner */}
                  <div className="text-xs bg-amber-950/40 border border-amber-800/50 p-3 rounded-xl text-amber-200 flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                    <div>
                      <div className="font-bold text-amber-300">Đã gửi thông báo tới ứng dụng tài xế</div>
                      <div className="text-[11px] text-amber-400/80 mt-0.5">Đang chờ tài xế tiếp nhận lệnh và di chuyển tới hiện trường...</div>
                    </div>
                  </div>

                  {/* OSRM Simulation Button */}
                  <button
                    onClick={() => handleOpenSimulationForRequest(selectedRequest)}
                    disabled={isLoadingMissionForSim}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoadingMissionForSim ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Zap size={16} />
                    )}
                    <span>{isLoadingMissionForSim ? 'Đang tìm kiếm Mission...' : 'Mở Bảng Mô Phỏng OSRM Real-time'}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Instruction Card */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 text-xs space-y-1.5 text-slate-400">
                <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                  <Info size={14} className="text-indigo-400" />
                  <span>Hướng dẫn điều phối:</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Yêu cầu này đã hoàn tất giao xe. Để chọn xe và phát lệnh cho một yêu cầu mới, vui lòng click chọn một Yêu cầu ở trạng thái <strong className="text-amber-400">PENDING</strong> trong danh sách bên trái.
                </p>
              </div>
            </div>
          ) : (
            /* ── VIEW DÀNH CHO YÊU CẦU CHƯA GIAO XE (PENDING / READY) ── */
            <>
              {/* Resource Filter Toolbar */}
              <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Truck size={14} className="text-indigo-400" />
                    Tài nguyên điều phối
                    <span className="bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded text-[11px] font-mono">
                      {filteredResources.filter(r => r.status === 'AVAILABLE').length} AVAILABLE
                    </span>
                  </span>
                </div>

                <div className="text-[10px] text-slate-400 italic">
                  Lọc phù hợp phía giao diện
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <select
                    value={resStatusFilter}
                    onChange={(e) => setResStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Status: Tất cả</option>
                    <option value="AVAILABLE">AVAILABLE (Có sẵn)</option>
                    <option value="BUSY">BUSY (Bận)</option>
                    <option value="OFFLINE">OFFLINE (Tắt máy)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
                  </select>

                  <select
                    value={resProviderFilter}
                    onChange={(e) => setResProviderFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Đơn vị: Tất cả</option>
                    {providers.map(p => (
                      <option key={p.id} value={p.id}>{p.providerName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resources Selection List */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {isLoadingResources ? (
                  <div className="space-y-2 p-2">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="h-16 bg-slate-800/40 rounded animate-pulse" />
                    ))}
                  </div>
                ) : filteredResources.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-xs">
                    Không tìm thấy xe điều phối phù hợp.
                  </div>
                ) : (
                  filteredResources.map(res => {
                    const isAvailable = res.status === 'AVAILABLE';
                    const isSelected = selectedResource?.id === res.id;

                    return (
                      <div
                        key={res.id}
                        onClick={() => {
                          if (isAvailable) setSelectedResource(res);
                        }}
                        className={`p-2.5 rounded-lg border transition-all ${
                          !isAvailable
                            ? 'bg-slate-950/40 border-slate-900 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-emerald-950/40 border-emerald-500 shadow-md cursor-pointer'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono font-bold text-xs text-slate-200 flex items-center gap-1.5">
                            <Truck size={13} className={isAvailable ? 'text-emerald-400' : 'text-slate-500'} />
                            {res.resourceCode}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                            res.status === 'AVAILABLE' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' :
                            res.status === 'BUSY' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' :
                            'bg-slate-500/20 text-slate-400 border-slate-500/40'
                          }`}>
                            {res.status}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-300 flex items-center justify-between">
                          <span>{res.providerName || 'Đơn vị Cấp cứu'}</span>
                          <span className="font-mono text-indigo-300">{res.resourceTypeName}</span>
                        </div>

                        <div className="mt-1.5 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Tài xế: {res.currentDriverName || 'Chưa gán'}</span>
                          <div className="flex items-center gap-2">
                            {!isAvailable && (
                              <button
                                type="button"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await dispatchResourceService.updateStatus(res.id, 'AVAILABLE');
                                    fetchResources();
                                  } catch (err) {
                                    console.error('Failed to update status:', err);
                                  }
                                }}
                                className="text-[9px] font-mono text-emerald-300 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 px-1.5 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                                title="Đặt lại trạng thái AVAILABLE để có thể điều xe"
                              >
                                <RefreshCw size={10} />
                                + AVAILABLE
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setResourceDetailModal(res);
                              }}
                              className="text-indigo-400 hover:underline cursor-pointer"
                            >
                              Chi tiết
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── DISPATCH FORM & ACTION PANEL ── */}
              <div className="p-3.5 bg-slate-900/95 border-t border-slate-800 space-y-3 shrink-0 font-sans">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-100 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    Phát lệnh Điều xe (Dispatch Action)
                  </h3>
                  {selectedRequest && selectedResource && (
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                      Sẵn sàng phát lệnh
                    </span>
                  )}
                </div>

                <div className="space-y-2.5 text-xs">
                  {/* Request & Resource Pills */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-mono block uppercase mb-0.5">Yêu cầu (Request)</span>
                      {selectedRequest ? (
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-red-400 text-xs">REQ-{selectedRequest.id}</span>
                          <span className="text-[9px] font-mono bg-red-500/20 text-red-300 px-1.5 py-0.2 rounded border border-red-500/30">
                            {selectedRequest.urgencyLevel}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">Chưa chọn yêu cầu</span>
                      )}
                    </div>

                    <div className="bg-slate-950 p-2 rounded-xl border border-slate-800/80">
                      <span className="text-[10px] text-slate-500 font-mono block uppercase mb-0.5">Tài nguyên (Resource)</span>
                      {selectedResource ? (
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-emerald-400 text-xs flex items-center gap-1">
                            <Truck size={12} />
                            {selectedResource.resourceCode}
                          </span>
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                            {selectedResource.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-600 italic text-[11px]">Chưa chọn tài nguyên</span>
                      )}
                    </div>
                  </div>

                  {/* Destination Input */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-mono block mb-1">Điểm đến (Destination Name)</label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={destinationName}
                        onChange={(e) => setDestinationName(e.target.value)}
                        placeholder="Nhập tên điểm đến / địa chỉ hiện trường..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 rounded-xl pl-8 pr-3 py-1.5 text-slate-100 text-xs transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Notes Input & Quick Tags */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-slate-400 font-mono block">Ghi chú lệnh điều xe (Notes)</label>
                      <div className="flex items-center gap-1 text-[9px] text-slate-500">
                        <span>Thêm nhanh:</span>
                        <button 
                          type="button" 
                          onClick={() => setDispatchNotes(prev => prev ? `${prev}, Khẩn cấp 115` : 'Khẩn cấp 115')}
                          className="text-indigo-400 hover:underline"
                        >
                          +115
                        </button>
                        <span>•</span>
                        <button 
                          type="button" 
                          onClick={() => setDispatchNotes(prev => prev ? `${prev}, Cần Oxy` : 'Cần Oxy')}
                          className="text-indigo-400 hover:underline"
                        >
                          +Oxy
                        </button>
                      </div>
                    </div>
                    <div className="relative">
                      <FileText size={14} className="absolute left-2.5 top-2.5 text-slate-500" />
                      <textarea
                        rows={2}
                        value={dispatchNotes}
                        onChange={(e) => setDispatchNotes(e.target.value)}
                        placeholder="Ghi chú thêm cho tài xế..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-red-500/60 focus:ring-1 focus:ring-red-500/40 rounded-xl pl-8 pr-3 py-1.5 text-slate-100 text-xs transition-all outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Submit Dispatch Action Button */}
                  <button
                    onClick={handlePreDispatchCheck}
                    disabled={!selectedRequest || !selectedResource || selectedResource.status !== 'AVAILABLE'}
                    className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-red-950/40 border border-red-500/30 font-sans"
                  >
                    <Send size={15} className="animate-bounce" />
                    <span>Phát lệnh Điều xe</span>
                  </button>
                </div>

                {/* Mission Created High-Tech Result Panel */}
                {createdMission && (
                  <div className="bg-slate-950/90 border border-emerald-500/40 p-3.5 rounded-xl text-xs space-y-2.5 shadow-xl shadow-emerald-950/30 relative overflow-hidden animate-fadeIn font-sans">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                      <div className="flex items-center gap-2 font-bold text-emerald-400 tracking-wide text-xs">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <span>ĐÃ PHÁT LỆNH THÀNH CÔNG!</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {createdMission.dispatchedAt ? new Date(createdMission.dispatchedAt).toLocaleTimeString() : ''}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Mã Nhiệm vụ</span>
                        <strong className="text-emerald-400 text-sm font-bold">#MISSION-{createdMission.id}</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Trạng thái</span>
                        <span className="inline-block mt-0.5 bg-indigo-950 text-indigo-300 border border-indigo-800/60 px-2 py-0.5 rounded font-bold text-[10px]">
                          {createdMission.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-[11px] bg-amber-950/30 border border-amber-800/40 p-2.5 rounded-xl text-amber-200 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                      <div className="flex-1">
                        <div className="font-semibold text-amber-300 text-[11px]">Đã truyền tin tới thiết bị tài xế</div>
                        <div className="text-[10px] text-amber-400/80">Đang chờ tài xế xác nhận nhiệm vụ...</div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenSimulation(createdMission)}
                      className="w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
                    >
                      <Zap size={14} />
                      <span>Kích hoạt Mô phỏng OSRM Real-time</span>
                    </button>
                  </div>
                )}

              </div>
            </>
          )}

        </section>

      </div>

      {/* ── CONFIRMATION MODAL ── */}
      {showConfirmModal && selectedRequest && selectedResource && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <ShieldAlert className="text-red-500" size={20} />
                Xác nhận Phát lệnh Điều xe
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono">
                <div>Yêu cầu: <span className="text-indigo-400 font-bold">REQ-{selectedRequest.id}</span></div>
                <div>Loại dịch vụ: <span className="text-slate-200">{selectedRequest.serviceTypeName}</span></div>
                <div>Mức độ: <span className="text-red-400 font-bold">{selectedRequest.urgencyLevel}</span></div>
              </div>

              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1 font-mono">
                <div>Mã xe: <span className="text-emerald-400 font-bold">{selectedResource.resourceCode}</span></div>
                <div>Đơn vị: <span className="text-slate-200">{selectedResource.providerName}</span></div>
                <div>Tài xế: <span className="text-slate-200">{selectedResource.currentDriverName || 'Chưa gán'}</span></div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Điểm đến:</span>
                <div className="font-medium text-slate-200">{destinationName}</div>
              </div>

              {dispatchNotes && (
                <div>
                  <span className="text-slate-500 text-[10px] block uppercase">Ghi chú:</span>
                  <div className="italic text-slate-400">{dispatchNotes}</div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmDispatch}
                disabled={isSubmittingMission}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-lg flex items-center gap-2"
              >
                {isSubmittingMission ? 'Đang phát lệnh...' : 'Xác nhận Phát lệnh'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RESOURCE DETAIL MODAL ── */}
      {resourceDetailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Truck className="text-indigo-400" size={20} />
                Chi tiết Tài nguyên Xe cấp cứu
              </h3>
              <button onClick={() => setResourceDetailModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">MÃ TÀI NGUYÊN</span>
                  <span className="font-bold text-emerald-400 text-sm">{resourceDetailModal.resourceCode}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">TRẠNG THÁI</span>
                  <span className="font-bold text-slate-200">{resourceDetailModal.status}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">LOẠI DỊCH VỤ</span>
                  <span className="text-indigo-300">{resourceDetailModal.resourceTypeName}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">VÙNG (EDGE NODE)</span>
                  <span className="text-slate-300">{resourceDetailModal.edgeNodeName}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block">ĐƠN VỊ CUNG CẤP (PROVIDER)</span>
                <div className="font-medium text-slate-200">{resourceDetailModal.providerName}</div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block">TÀI XẾ HIỆN TẠI</span>
                <div className="font-medium text-slate-200">{resourceDetailModal.currentDriverName || 'Chưa gán tài xế'}</div>
              </div>

              <div>
                <span className="text-slate-500 text-[10px] block">TỌA ĐỘ VỊ TRÍ</span>
                <div className="font-mono text-slate-300">
                  {resourceDetailModal.latitude && resourceDetailModal.longitude ? `${resourceDetailModal.latitude}, ${resourceDetailModal.longitude}` : 'Chưa có dữ liệu GPS'}
                </div>
              </div>

              {resourceDetailModal.extendedAttributes && (
                <div>
                  <span className="text-slate-500 text-[10px] block">THUỘC TÍNH MỞ RỘNG</span>
                  <pre className="bg-slate-950 p-2 rounded text-[11px] text-slate-300 font-mono overflow-x-auto border border-slate-800">
                    {JSON.stringify(resourceDetailModal.extendedAttributes, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end border-t border-slate-800 pt-3">
              <button
                onClick={() => setResourceDetailModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── OSRM SIMULATION CONTROL MODAL ── */}
      <SimulationControlModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        mission={simulatingMission}
        onRequestRefresh={() => {
          fetchRequestsAndCatalogs();
          fetchResources();
        }}
      />

      {/* ── TIMELINE MODAL ── */}
      {timelineModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FileText className="text-indigo-400" size={18} />
                Lịch sử Timeline Xử lý Ca REQ-{timelineModal.requestId}
              </h3>
              <button onClick={() => setTimelineModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 text-xs">
              {timelineModal.items.length === 0 ? (
                <div className="text-slate-500 text-center py-6">Chưa có dữ liệu timeline cho ca này.</div>
              ) : (
                timelineModal.items.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between font-mono text-[11px]">
                      <span className="font-bold text-indigo-300">{item.status || item.action || 'Sự kiện'}</span>
                      <span className="text-slate-500">{item.timestamp ? new Date(item.timestamp).toLocaleString() : 'N/A'}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{item.description || item.notes || 'Thao tác điều phối'}</p>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setTimelineModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECOMMENDATIONS MODAL ── */}
      {recsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="text-amber-400" size={18} />
                Gợi ý Top 3 Xe Cứu Thương Tốt Nhất (AI Ranking)
              </h3>
              <button onClick={() => setRecsModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {recsModal.items.length === 0 ? (
                <div className="text-slate-500 text-center py-6">Không tìm thấy xe cứu thương khả thi phù hợp tiêu chí.</div>
              ) : (
                recsModal.items.map((rec, idx) => (
                  <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-emerald-400 text-sm">{rec.resourceCode || `Xe #${rec.id}`}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">{rec.providerName || 'Provider'}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-sans">
                        Khoảng cách: <strong className="text-slate-200 font-mono">{rec.distanceKm ? `${rec.distanceKm} km` : 'N/A'}</strong> • Thời gian tới: <strong className="text-amber-300 font-mono">{rec.etaMinutes ? `${rec.etaMinutes} phút` : 'N/A'}</strong>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const targetRes = resources.find(r => r.id === rec.id || r.resourceCode === rec.resourceCode);
                        if (targetRes) {
                          setSelectedResource(targetRes);
                          setRecsModal(null);
                        } else {
                          alert(`Đã chọn xe ${rec.resourceCode || rec.id}`);
                          setRecsModal(null);
                        }
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shrink-0"
                    >
                      Chọn xe này
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setRecsModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmergencyIntakeDispatch;
