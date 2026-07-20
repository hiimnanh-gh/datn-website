import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle2, ShieldAlert, 
  MapPin, Truck, Check, Info, FileText, Send, User, ChevronRight, X, UserCheck
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
      setApiError('Không thể kết nối API Dispatch Requests. Vui lòng kiểm tra Server.');
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
  useEffect(() => {
    if (!selectedReqId) {
      setSelectedRequest(null);
      return;
    }
    const fetchReqDetail = async () => {
      setIsLoadingReqDetail(true);
      try {
        const detail = await dispatchRequestService.getById(selectedReqId);
        setSelectedRequest(detail);
        setDestinationName(`Hiện trường yêu cầu REQ-${detail.id}`);
      } catch (err) {
        console.error('Error fetching request detail:', err);
        // Fallback to item in request list
        const fallback = requests.find(r => r.id === selectedReqId);
        setSelectedRequest(fallback || null);
      } finally {
        setIsLoadingReqDetail(false);
      }
    };
    fetchReqDetail();
  }, [selectedReqId, requests]);

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
        <section className="w-[38%] border-r border-slate-800 flex flex-col bg-slate-950 overflow-y-auto">
          {isLoadingReqDetail ? (
            <div className="p-8 text-center text-slate-500 text-xs animate-pulse">
              Đang tải chi tiết Yêu cầu điều phối...
            </div>
          ) : !selectedRequest ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Vui lòng chọn một Yêu cầu từ cột Hàng đợi để xem chi tiết.
            </div>
          ) : (
            <div className="p-4 space-y-4 text-xs">
              
              {/* Request Main Header */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-100 font-mono flex items-center gap-2">
                      REQ-{selectedRequest.id}
                      <span className="text-xs font-normal text-slate-400">Call ID: #{selectedRequest.callId || 'N/A'}</span>
                    </h2>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Tạo lúc: {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded border text-xs font-bold ${getUrgencyBadge(selectedRequest.urgencyLevel).bg}`}>
                    {selectedRequest.urgencyLevel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-300">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Loại dịch vụ</span>
                    <span className="font-medium text-indigo-300">{selectedRequest.serviceTypeName || `ID: ${selectedRequest.serviceTypeId}`}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Vùng quản lý (Edge Node)</span>
                    <span className="font-medium text-slate-200">{selectedRequest.edgeNodeName || `Node #${selectedRequest.edgeNodeId}`}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Điều phối viên khởi tạo</span>
                    <span className="font-medium text-slate-200">{selectedRequest.createdByDispatcherName || 'Chưa gán'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Đồng bộ Cloud</span>
                    <span className="font-medium text-slate-200">{selectedRequest.isSyncedToCloud ? 'Đã đồng bộ' : 'Chưa đồng bộ'}</span>
                  </div>
                </div>
              </div>

              {/* Extended Requirements Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-2">
                  <FileText size={14} className="text-indigo-400" />
                  Yêu cầu mở rộng (Extended Requirements)
                </h3>
                {selectedRequest.extendedRequirements ? (
                  <div className="space-y-2 pt-1">
                    {selectedRequest.extendedRequirements.symptoms && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Triệu chứng lâm sàng:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(selectedRequest.extendedRequirements.symptoms) ? (
                            selectedRequest.extendedRequirements.symptoms.map((symptom, idx) => (
                              <span key={idx} className="bg-red-950/60 text-red-300 border border-red-800/60 px-2 py-0.5 rounded text-[11px]">
                                {symptom}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-300">{selectedRequest.extendedRequirements.symptoms}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedRequest.extendedRequirements.equipment && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Trang thiết bị yêu cầu:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(selectedRequest.extendedRequirements.equipment) ? (
                            selectedRequest.extendedRequirements.equipment.map((eq, idx) => (
                              <span key={idx} className="bg-blue-950/60 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded text-[11px]">
                                {eq}
                              </span>
                            ))
                          ) : (
                            <span className="text-slate-300">{selectedRequest.extendedRequirements.equipment}</span>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedRequest.extendedRequirements.notes && (
                      <div>
                        <span className="text-slate-400 text-[11px] block">Ghi chú bổ sung:</span>
                        <p className="bg-slate-950 p-2 rounded border border-slate-800 text-slate-300 mt-1 italic">
                          "{selectedRequest.extendedRequirements.notes}"
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 text-[11px] italic">Không có thông tin yêu cầu mở rộng.</p>
                )}
              </div>

              {/* Location & Map Section */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <h3 className="font-semibold text-slate-200 flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="flex items-center gap-2">
                    <MapPin size={14} className="text-emerald-400" />
                    Vị trí Sự cố Khẩn cấp
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {selectedRequest.latitude && selectedRequest.longitude ? `${selectedRequest.latitude}, ${selectedRequest.longitude}` : 'N/A'}
                  </span>
                </h3>

                {selectedRequest.latitude != null && selectedRequest.longitude != null ? (
                  <div className="h-44 w-full rounded-lg overflow-hidden border border-slate-800 relative z-0">
                    <MapContainer
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
                  <div className="p-6 bg-slate-950 rounded-lg border border-slate-800 text-center text-slate-500">
                    <AlertTriangle size={24} className="mx-auto mb-2 text-amber-500/60" />
                    Chưa có dữ liệu vị trí GPS cho yêu cầu này.
                  </div>
                )}
              </div>

              {/* Emergency Call Placeholder */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-slate-400 flex items-center gap-3">
                <Info size={18} className="text-slate-500 shrink-0" />
                <div className="text-[11px]">
                  <strong>Thông tin Cuộc gọi (Call ID: #{selectedRequest.callId || 'N/A'}):</strong>
                  <p className="text-slate-500 mt-0.5">Chi tiết cuộc gọi sẽ được bổ sung tự động khi tích hợp API Emergency Call.</p>
                </div>
              </div>

              {/* AI Support Suggestions */}
              <div className="bg-indigo-950/20 border border-indigo-900/40 rounded-xl p-3 text-indigo-300 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-indigo-400 text-base">auto_awesome</span>
                <div className="text-[11px]">
                  <strong className="text-indigo-200">Gợi ý hỗ trợ từ AI:</strong>
                  <p className="text-indigo-300/80 mt-0.5">
                    Ưu tiên lựa chọn xe thuộc vùng <strong>{selectedRequest.edgeNodeName || 'Đống Đa'}</strong> có cung cấp dịch vụ <strong>{selectedRequest.serviceTypeName || 'ALS'}</strong> và trạng thái AVAILABLE.
                  </p>
                </div>
              </div>

            </div>
          )}
        </section>

        {/* ── CỘT PHẢI (VÙNG D): TÀI NGUYÊN & PHÁT LỆNH (32%) ── */}
        <section className="w-[32%] flex flex-col bg-slate-900/30">
          
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setResourceDetailModal(res);
                        }}
                        className="text-indigo-400 hover:underline"
                      >
                        Chi tiết
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── DISPATCH FORM & ACTION PANEL ── */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 space-y-3 shrink-0">
            <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wider">
              Phát lệnh Điều xe (Dispatch Action)
            </h3>

            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 block">Yêu cầu (Request)</label>
                  <input
                    type="text"
                    disabled
                    value={selectedRequest ? `REQ-${selectedRequest.id}` : 'Chưa chọn'}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-400 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block">Tài nguyên (Resource)</label>
                  <input
                    type="text"
                    disabled
                    value={selectedResource ? selectedResource.resourceCode : 'Chưa chọn'}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-emerald-400 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">Điểm đến (Destination Name)</label>
                <input
                  type="text"
                  value={destinationName}
                  onChange={(e) => setDestinationName(e.target.value)}
                  placeholder="Nhập tên điểm đến / địa chỉ..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block">Ghi chú lệnh điều xe (Notes)</label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="Ghi chú cho tài xế..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>

              <button
                onClick={handlePreDispatchCheck}
                disabled={!selectedRequest || !selectedResource || selectedResource.status !== 'AVAILABLE'}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-800 disabled:text-slate-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95 shadow-lg"
              >
                <Send size={15} />
                Phát lệnh Điều xe
              </button>
            </div>

            {/* Mission Created Result Notification Panel */}
            {createdMission && (
              <div className="bg-emerald-950/60 border border-emerald-700 p-3 rounded-lg text-xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center gap-2 font-bold text-emerald-400">
                  <CheckCircle2 size={16} />
                  <span>Đã phát lệnh thành công!</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono space-y-0.5">
                  <div>Mã nhiệm vụ: <strong className="text-white">#Mission-{createdMission.id}</strong></div>
                  <div>Trạng thái: <span className="bg-indigo-900 text-indigo-200 px-1.5 py-0.2 rounded">{createdMission.status}</span></div>
                  <div>Thời gian: {createdMission.dispatchedAt ? new Date(createdMission.dispatchedAt).toLocaleTimeString() : ''}</div>
                </div>
                <div className="text-[11px] text-amber-300 bg-amber-950/40 p-1.5 rounded border border-amber-800/40 mt-1">
                  Đã phát lệnh, đang chờ tài xế phản hồi.
                </div>
              </div>
            )}

          </div>
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

    </div>
  );
};

export default EmergencyIntakeDispatch;
