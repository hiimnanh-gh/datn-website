import React, { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCw, Wifi, WifiOff, AlertTriangle, CheckCircle2, ShieldAlert, 
  MapPin, Truck, Check, Info, FileText, Send, User, ChevronRight, X, UserCheck, Sparkles, Zap, Maximize2, Building2
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
import { medicalHospitalService } from '../../../services/medicalHospitalService';
import { callService } from '../../../services/callService';
import wsService from '../../../services/websocket';
import SimulationControlModal from '../components/SimulationControlModal';
import HeaderUserProfile from '../../../components/HeaderUserProfile';

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

const ambMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const hospMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const getUrgencyBadge = (urgency) => {
  switch (urgency?.toUpperCase()) {
    case 'CRITICAL':
      return { label: 'CRITICAL - Cực kỳ khẩn cấp', bg: 'bg-red-500/20 text-red-400 border-red-500/40' };
    case 'HIGH':
      return { label: 'HIGH - Khẩn cấp cao', bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
    case 'MEDIUM':
      return { label: 'MEDIUM - Khẩn cấp vừa', bg: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40' };
    case 'LOW':
    default:
      return { label: 'LOW - Mức độ thấp', bg: 'bg-slate-500/20 text-slate-300 border-slate-500/40' };
  }
};

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'PENDING':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'CONFIRMED':
    case 'RECOMMENDING':
    case 'READY':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'DISPATCHING':
    case 'DISPATCHED':
      return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
    case 'REJECTED':
    case 'CANCELLED':
    case 'FAILED':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'COMPLETED':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  }
};

const getCallerInfo = (req) => {
  if (!req) return { phone: null, name: null, display: 'N/A' };
  const phone = 
    req.reporterPhone ||
    req.callerPhone ||
    req.phoneNumber ||
    req.phone ||
    req.contactPhone ||
    req.patientPhone ||
    req.victimPhone ||
    req.requesterPhone ||
    req.callerNumber ||
    req.user?.phoneNumber ||
    req.user?.phone ||
    req.caller?.phoneNumber ||
    req.caller?.phone ||
    req.call?.callerPhone ||
    req.call?.phoneNumber ||
    req.call?.fromNumber ||
    req.call?.from ||
    req.extendedRequirements?.callerPhone ||
    req.extendedRequirements?.phoneNumber ||
    req.extendedRequirements?.phone ||
    null;

  const name = 
    req.reporterName ||
    req.callerName ||
    req.contactName ||
    req.victimName ||
    req.patientName ||
    req.userName ||
    req.requesterName ||
    req.user?.fullName ||
    req.user?.name ||
    req.caller?.name ||
    null;

  let display = 'N/A';
  if (name && phone) {
    display = `${name} (${phone})`;
  } else if (phone) {
    display = phone;
  } else if (name) {
    display = name;
  }

  return { phone, name, display };
};

const EmergencyIntakeDispatch = () => {
  const { user } = useAuthStore();

  const [requests, setRequests] = useState([]);
  const [selectedReqId, setSelectedReqId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);

  const [providers, setProviders] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [hospitals, setHospitals] = useState([]);

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

  const [resStatusFilter, setResStatusFilter] = useState('ALL');
  const [resTypeFilter, setResTypeFilter] = useState('ALL');
  const [resProviderFilter, setResProviderFilter] = useState('ALL');

  // Dispatch Form & Modal
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createdMission, setCreatedMission] = useState(null);
  const [resourceDetailModal, setResourceDetailModal] = useState(null);
  const [isSimulationModalOpen, setIsSimulationModalOpen] = useState(false);
  const [simulatingMission, setSimulatingMission] = useState(null);
  const [isLoadingMissionForSim, setIsLoadingMissionForSim] = useState(false);

  // Request Action Modals
  const [timelineModal, setTimelineModal] = useState(null);
  const [recsModal, setRecsModal] = useState(null);
  const [isFullMapOpen, setIsFullMapOpen] = useState(false);

  // 1. Verify Request Handler
  const handleVerifyRequest = async () => {
    if (!selectedRequest) return;
    try {
      const payload = {
        verificationNote: 'Đã xác minh bởi điều phối viên',
        confirmedUrgencyLevel: selectedRequest.urgencyLevel || 'HIGH',
        confirmedAddress: selectedRequest.address || selectedRequest.callerAddress || 'Hà Nội',
        confirmedLatitude: selectedRequest.latitude,
        confirmedLongitude: selectedRequest.longitude
      };
      await dispatchRequestService.verify(selectedRequest.id, payload);
      alert(`Đã xác minh yêu cầu REQ-${selectedRequest.id} thành công!`);
      fetchReqDetail(selectedRequest.id);
      fetchRequestsAndCatalogs();
    } catch (err) {
      alert('Lỗi xác minh: ' + (err.response?.data?.message || err.message));
    }
  };

  // 2. Reject Request Handler
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

  // 3. Timeline Handler with Strict Normalization
  const handleFetchTimeline = async () => {
    if (!selectedRequest) return;
    try {
      const data = await dispatchRequestService.getTimeline(selectedRequest.id);
      const normalized = (Array.isArray(data) ? data : []).map(item => ({
        type: item.event || item.type || item.status || 'EVENT',
        occurredAt: item.time || item.occurredAt || item.timestamp,
        description: item.note !== undefined ? item.note : (item.description || '')
      }));
      setTimelineModal({ requestId: selectedRequest.id, items: normalized });
    } catch (err) {
      alert('Lỗi tải timeline: ' + (err.response?.data?.message || err.message));
    }
  };

  // 4. Recommendations Handler (Chỉ lấy dữ liệu từ API Backend, không tự sinh fallback)
  const handleFetchRecommendations = async () => {
    if (!selectedRequest) return;
    try {
      let recsList = [];
      const res = await dispatchRequestService.getRecommendations(selectedRequest.id);
      if (Array.isArray(res)) {
        recsList = res;
      } else if (res && typeof res === 'object') {
        recsList = res.recommendations || res.suggestedResources || res.resources || res.items || res.data || [];
      }

      setRecsModal({ requestId: selectedRequest.id, items: Array.isArray(recsList) ? recsList : [] });
      fetchReqDetail(selectedRequest.id);
      fetchRequestsAndCatalogs();
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      alert('Lỗi tải gợi ý xe: ' + (err.response?.data?.message || err.message));
    }
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

      // 2. Fetch mission by requestId from backend dispatch missions if not found yet
      if (!targetMission || !targetMission.id) {
        try {
          targetMission = await dispatchMissionService.getByRequestId(request.id);
        } catch (e) {
          console.warn('Could not fetch mission by requestId:', e);
        }
      }

      // 3. Construct mission parameters safely (with fallback to request attributes)
      const missionId = targetMission?.id || request.missionId || request.id;
      const resourceId = targetMission?.resourceId || request.assignedResourceId || request.resourceId;
      const resourceCode = targetMission?.resourceCode || request.resourceCode || (resourceId ? `AMB-${resourceId}` : 'Xe Cấp cứu');

      setSimulatingMission({
        id: missionId,
        requestId: request.id,
        resourceCode: resourceCode,
        resourceId: resourceId,
        destinationId: targetMission?.destinationId || request.destinationId,
        destinationName: targetMission?.destinationName || request.destinationName,
        status: targetMission?.status || 'ACCEPTED',
        driverName: targetMission?.driverName || targetMission?.driver?.fullName || 'Đã điều phối'
      });
      setIsSimulationModalOpen(true);
    } catch (err) {
      console.error('Error opening simulation for request:', err);
      // Even on error, open simulation modal with available request data
      setSimulatingMission({
        id: request.missionId || request.id,
        requestId: request.id,
        resourceCode: request.resourceCode || 'Xe Cấp cứu',
        resourceId: request.assignedResourceId || request.resourceId,
        status: 'ACCEPTED'
      });
      setIsSimulationModalOpen(true);
    } finally {
      setIsLoadingMissionForSim(false);
    }
  };

  // 1. Fetch Single Request Detail
  const fetchReqDetail = useCallback(async (reqId) => {
    const idToFetch = reqId || selectedReqId;
    if (!idToFetch) {
      setSelectedRequest(null);
      return;
    }
    setIsLoadingReqDetail(true);
    try {
      const detail = await dispatchRequestService.getById(idToFetch);
      let enriched = { ...detail };

      // If callId exists, enrich from GET /api/v1/calls/{callId}
      if (detail?.callId) {
        try {
          const callData = await callService.getById(detail.callId);
          if (callData) {
            enriched = {
              ...enriched,
              callerPhone: callData.callerPhone || callData.phoneNumber || callData.phone || callData.contactPhone || callData.fromNumber || callData.from,
              callerName: callData.callerName || callData.contactName || callData.victimName || callData.name || callData.fullName,
              description: enriched.description || callData.description || callData.notes || callData.note || callData.locationDescription || callData.reason,
              address: enriched.address || callData.address || callData.callerAddress || callData.location,
              callInfo: callData,
            };
          }
        } catch (callErr) {
          console.warn('Call info fetch fallback:', callErr);
        }
      }

      setSelectedRequest(enriched);
    } catch (err) {
      console.error('Error fetching request detail:', err);
    } finally {
      setIsLoadingReqDetail(false);
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

  // 3. Fetch Request List & Catalogs
  const fetchRequestsAndCatalogs = useCallback(async () => {
    setIsLoadingRequests(true);
    setApiError(null);
    try {
      const [reqData, provData, stData, hospData] = await Promise.all([
        dispatchRequestService.getAll(),
        providerService.getAll().catch(() => []),
        serviceTypeService.getAll().catch(() => []),
        medicalHospitalService.getAll().catch(() => []),
      ]);

      const reqList = Array.isArray(reqData) ? reqData : [];
      setRequests(reqList);

      // Async background enrichment of list items with call info
      Promise.all(
        reqList.map(async (req) => {
          if (!req.callId) return req;
          try {
            const call = await callService.getById(req.callId);
            if (call) {
              return {
                ...req,
                callerPhone: call.callerPhone || call.phoneNumber || call.phone || call.contactPhone || call.fromNumber || call.from,
                callerName: call.callerName || call.contactName || call.victimName || call.name || call.fullName,
                description: req.description || call.description || call.notes || call.note || call.locationDescription || call.reason,
                address: req.address || call.address || call.callerAddress || call.location,
              };
            }
          } catch (e) {
            // ignore
          }
          return req;
        })
      ).then(enrichedList => {
        setRequests(enrichedList);
      });

      setProviders(Array.isArray(provData) ? provData : []);
      setServiceTypes(Array.isArray(stData) ? stData : []);
      const hospList = Array.isArray(hospData) ? hospData : [];
      setHospitals(hospList);
      if (hospList.length > 0 && !selectedHospitalId) {
        setSelectedHospitalId(hospList[0].id);
      }

      // Auto-select first request if none selected
      if (reqList.length > 0 && !selectedReqId) {
        setSelectedReqId(reqList[0].id);
        fetchReqDetail(reqList[0].id);
      }
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching requests:', err);
      if (err.response?.status === 401) {
        setApiError('Phiên đăng nhập đã hết hạn');
      } else {
        setApiError('Không thể kết nối API Dispatch Requests.');
      }
    } finally {
      setIsLoadingRequests(false);
    }
  }, [selectedReqId, selectedHospitalId, fetchReqDetail]);

  // Trigger detail fetch whenever selectedReqId changes
  useEffect(() => {
    if (selectedReqId) {
      fetchReqDetail(selectedReqId);
    }
  }, [selectedReqId, fetchReqDetail]);

  // Handle Initial Load and Polling / WebSocket
  useEffect(() => {
    fetchRequestsAndCatalogs();
    fetchResources();

    wsService.connect(
      () => {
        setWsConnected(true);
        wsService.subscribe('/topic/dispatcher/ambulances', (event) => {
          if (event?.eventType === 'AMBULANCE_POSITION_UPDATED' && event.resourceId) {
            setResources(prev =>
              prev.map(r =>
                r.id === event.resourceId
                  ? {
                      ...r,
                      latitude: event.position?.latitude ?? r.latitude,
                      longitude: event.position?.longitude ?? r.longitude,
                      updatedAt: event.occurredAt ?? new Date().toISOString()
                    }
                  : r
              )
            );
          }
        });
        wsService.subscribe('/topic/dispatcher/requests', () => {
          fetchRequestsAndCatalogs();
          if (selectedReqId) fetchReqDetail(selectedReqId);
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

    const pollInterval = setInterval(() => {
      fetchRequestsAndCatalogs();
      fetchResources();
    }, 15000);

    return () => {
      clearInterval(pollInterval);
      wsService.disconnect();
    };
  }, [fetchRequestsAndCatalogs, fetchResources, selectedReqId, fetchReqDetail]);

  const handleRefresh = () => {
    fetchRequestsAndCatalogs();
    fetchResources();
  };

  const filteredRequests = requests.filter(req => {
    const codeMatch = reqSearch ? `REQ-${req.id}`.toLowerCase().includes(reqSearch.toLowerCase()) || req.id.toString().includes(reqSearch) : true;
    const urgencyMatch = reqUrgencyFilter === 'ALL' || req.urgencyLevel === reqUrgencyFilter;
    const statusMatch = reqStatusFilter === 'ALL' || req.status === reqStatusFilter;
    const typeMatch = reqServiceTypeFilter === 'ALL' || req.serviceTypeId === Number(reqServiceTypeFilter);
    return codeMatch && urgencyMatch && statusMatch && typeMatch;
  });

  const filteredResources = resources.filter(res => {
    const statusMatch = resStatusFilter === 'ALL' || res.status === resStatusFilter;
    const typeMatch = resTypeFilter === 'ALL' || res.resourceTypeId === Number(resTypeFilter);
    const provMatch = resProviderFilter === 'ALL' || res.providerId === Number(resProviderFilter);
    return statusMatch && typeMatch && provMatch;
  });

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

  const handleConfirmDispatch = async () => {
    setIsSubmittingMission(true);
    try {
      const chosenHospital = hospitals.find(h => h.id === Number(selectedHospitalId));
      const payload = {
        requestId: selectedRequest.id,
        resourceId: selectedResource.id,
        destinationId: selectedHospitalId ? Number(selectedHospitalId) : null,
        destinationName: chosenHospital?.hospitalName || destinationName || `Hiện trường yêu cầu REQ-${selectedRequest.id}`,
        notes: dispatchNotes || 'Phát lệnh bởi điều phối viên'
      };

      const mission = await dispatchMissionService.create(payload);
      setCreatedMission(mission);
      setShowConfirmModal(false);
      
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

  const isRequestDispatched = selectedRequest && (
    selectedRequest.status === 'DISPATCHING' || 
    selectedRequest.status === 'DISPATCHED' || 
    selectedRequest.status === 'COMPLETED'
  );

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      
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

        <div className="flex items-center gap-4 text-xs">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${wsConnected ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800' : 'bg-amber-950/40 text-amber-400 border-amber-800'}`}>
            {wsConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{wsConnected ? 'WebSocket Live' : 'REST Polling'}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${apiError ? 'bg-red-950/40 text-red-400 border-red-800' : 'bg-slate-800 text-slate-300 border-slate-700'}`}>
            <span className={`w-2 h-2 rounded-full ${apiError ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <span>{apiError ? 'Lỗi API' : 'API OK'}</span>
          </div>

          <span className="text-slate-400 font-mono hidden md:inline">
            Cập nhật: {lastUpdated}
          </span>

          <button
            onClick={handleRefresh}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 active:scale-95 cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={15} className={isLoadingRequests ? 'animate-spin' : ''} />
          </button>

          <div className="pl-2 border-l border-slate-800">
            <HeaderUserProfile profilePath="/dispatcher/profile" />
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <section className="w-[30%] border-r border-slate-800 flex flex-col bg-slate-900/50">
          <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                Hàng đợi Yêu cầu
                <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded text-[11px] font-mono">
                  {filteredRequests.length}
                </span>
              </span>
            </div>

            <input
              type="text"
              placeholder="Tìm kiếm REQ-ID..."
              value={reqSearch}
              onChange={(e) => setReqSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

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
                <option value="PENDING">PENDING (Chờ)</option>
                <option value="CONFIRMED">CONFIRMED (Đã xác minh)</option>
                <option value="RECOMMENDING">RECOMMENDING</option>
                <option value="DISPATCHED">DISPATCHED (Đã giao xe)</option>
                <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
                <option value="REJECTED">REJECTED (Từ chối)</option>
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

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {isLoadingRequests ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3].map(n => <div key={n} className="h-20 bg-slate-800/40 rounded animate-pulse" />)}
              </div>
            ) : filteredRequests.map(req => {
              const urgency = getUrgencyBadge(req.urgencyLevel);
              const isSelected = selectedReqId === req.id;
              const hasCoords = (req.confirmedLatitude ?? req.latitude) != null && (req.confirmedLongitude ?? req.longitude) != null;
              
              return (
                <div
                  key={req.id}
                  onClick={() => {
                    setSelectedReqId(req.id);
                    fetchReqDetail(req.id);
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-indigo-950/40 border-indigo-500 shadow-md' : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono font-bold text-xs text-indigo-400">REQ-{req.id}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${urgency.bg}`}>
                      {req.urgencyLevel || 'LOW'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 font-medium mb-1 line-clamp-1">
                    {req.serviceTypeName || 'Dịch vụ Cấp cứu'}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span className="text-slate-500 truncate max-w-[120px]">{req.address || req.callerAddress || 'Hà Nội'}</span>
                    <span className={`px-1.5 py-0.2 rounded border ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin size={11} className={hasCoords ? 'text-emerald-400' : 'text-slate-600'} />
                      {hasCoords ? 'Có GPS' : 'Thiếu GPS'}
                    </span>
                    <span className="font-mono text-slate-500">
                      {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="w-[38%] border-r border-slate-800 flex flex-col bg-slate-950">
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
                onClick={() => fetchReqDetail()}
                className="text-[11px] font-mono text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
              >
                <RefreshCw size={11} className={isLoadingReqDetail ? 'animate-spin' : ''} />
                Làm mới
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2 font-sans">
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
                {/* 1. Primary Request Info Card (Ultra Compact) */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="font-bold text-slate-100 text-sm">REQ-{selectedRequest.id}</span>
                      <span className="text-[11px] text-slate-400 font-sans truncate max-w-[200px]">{selectedRequest.address || selectedRequest.callerAddress || 'Hà Nội'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${getStatusBadge(selectedRequest.status)}`}>
                        {selectedRequest.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono font-medium">Dịch vụ yêu cầu</span>
                      <span className="font-semibold text-indigo-300 text-[12px] block leading-snug break-words">
                        {selectedRequest.serviceTypeName || `ID: ${selectedRequest.serviceTypeId}`}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono font-medium">Người báo tin / SĐT</span>
                      <span className="font-semibold text-emerald-400 text-[12px] block leading-snug break-words">
                        {getCallerInfo(selectedRequest).display}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono font-medium">Thời gian tiếp nhận</span>
                      <span className="font-mono text-slate-300 text-[11px] block leading-snug">
                        {selectedRequest.createdAt ? new Date(selectedRequest.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + new Date(selectedRequest.createdAt).toLocaleDateString() + ')' : 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-mono font-medium">Mức độ khẩn cấp</span>
                      <span className={`inline-block font-mono text-[10px] font-bold px-2 py-0.5 rounded border mt-0.5 ${getUrgencyBadge(selectedRequest.confirmedUrgencyLevel || selectedRequest.urgencyLevel || 'HIGH').bg}`}>
                        {selectedRequest.confirmedUrgencyLevel || selectedRequest.urgencyLevel || 'HIGH'}
                      </span>
                    </div>
                  </div>

                  {(selectedRequest.description || selectedRequest.callerDescription || selectedRequest.note || selectedRequest.notes) && (
                    <div className="bg-slate-950/70 border border-amber-900/40 rounded-lg p-2 text-[11px] text-slate-200">
                      <span className="text-[10px] text-amber-400 font-bold block uppercase font-mono mb-0.5">Mô tả của người báo tin:</span>
                      <p className="text-slate-300 leading-relaxed">{selectedRequest.description || selectedRequest.callerDescription || selectedRequest.note || selectedRequest.notes}</p>
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-slate-800/80 flex flex-wrap items-center gap-1.5 text-[11px]">
                    {selectedRequest.status === 'PENDING' && (
                      <>
                        <button
                          onClick={handleVerifyRequest}
                          className="px-2.5 py-0.5 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 size={12} />
                          Xác minh
                        </button>
                        <button
                          onClick={handleRejectRequest}
                          className="px-2.5 py-0.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-700/60 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <X size={12} />
                          Từ chối
                        </button>
                      </>
                    )}
                    <button
                      onClick={handleFetchRecommendations}
                      className="px-2.5 py-0.5 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-700/60 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Sparkles size={12} className="text-amber-400" />
                      Gợi ý Top 3 Xe Cứu Thương
                    </button>
                    <button
                      onClick={handleFetchTimeline}
                      className="px-2.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <FileText size={12} />
                      Timeline
                    </button>
                  </div>
                </div>

                {/* 2. Extended Requirements */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <span className="font-bold text-[11px] text-slate-300 flex items-center gap-1 border-b border-slate-800/80 pb-1 uppercase tracking-wider">
                    <FileText size={12} className="text-indigo-400" />
                    Yêu cầu mở rộng
                  </span>

                  {selectedRequest.extendedRequirements && (selectedRequest.extendedRequirements.symptoms || selectedRequest.extendedRequirements.equipment) ? (
                    <div className="space-y-1 text-[11px]">
                      {selectedRequest.extendedRequirements.symptoms && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500 shrink-0 font-mono text-[10px]">Triệu chứng:</span>
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(selectedRequest.extendedRequirements.symptoms) ? (
                              selectedRequest.extendedRequirements.symptoms.map((s, idx) => (
                                <span key={idx} className="bg-red-950/60 text-red-300 border border-red-800/60 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                  {s}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-300 font-medium">{selectedRequest.extendedRequirements.symptoms}</span>
                            )}
                          </div>
                        </div>
                      )}
                      {selectedRequest.extendedRequirements.equipment && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500 shrink-0 font-mono text-[10px]">Thiết bị:</span>
                          <span className="text-slate-300 font-medium">{Array.isArray(selectedRequest.extendedRequirements.equipment) ? selectedRequest.extendedRequirements.equipment.join(', ') : selectedRequest.extendedRequirements.equipment}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[10px] italic py-0.5 text-center">
                      Không có yêu cầu mở rộng
                    </p>
                  )}
                </div>

                {/* 3. Location & Map Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1">
                    <span className="flex items-center gap-1 font-bold text-[11px] text-slate-200 uppercase tracking-wider">
                      <MapPin size={12} className="text-emerald-400" />
                      Vị trí Sự cố
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-slate-400">
                        {selectedRequest.latitude && selectedRequest.longitude ? `${selectedRequest.latitude.toFixed(4)}, ${selectedRequest.longitude.toFixed(4)}` : 'N/A'}
                      </span>
                      {selectedRequest.latitude != null && selectedRequest.longitude != null && (
                        <button
                          onClick={() => setIsFullMapOpen(true)}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5 cursor-pointer font-sans"
                          title="Mở rộng toàn màn hình"
                        >
                          <Maximize2 size={11} />
                          <span>Phóng to</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {selectedRequest.latitude != null && selectedRequest.longitude != null ? (
                    <div 
                      className="h-36 w-full rounded-lg overflow-hidden border border-slate-800 relative z-0 group"
                    >
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
                            <div className="text-xs font-sans text-slate-900 space-y-1 min-w-[180px]">
                              <strong className="text-red-600 font-bold block">REQ-{selectedRequest.id}: {selectedRequest.serviceTypeName || 'Cấp cứu'}</strong>
                              {selectedRequest.address && <div className="text-[11px] text-slate-700">{selectedRequest.address}</div>}
                              {getCallerInfo(selectedRequest).display !== 'N/A' && (
                                <div className="text-[11px] text-slate-600">SĐT / Người báo: <strong>{getCallerInfo(selectedRequest).display}</strong></div>
                              )}
                              {(selectedRequest.description || selectedRequest.callerDescription || selectedRequest.note || selectedRequest.notes) && (
                                <div className="text-[11px] text-slate-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                                  <strong className="text-amber-900 block font-semibold mb-0.5">Mô tả của người báo tin:</strong>
                                  <span>{selectedRequest.description || selectedRequest.callerDescription || selectedRequest.note || selectedRequest.notes}</span>
                                </div>
                              )}
                            </div>
                          </Popup>
                        </Marker>
                      </MapContainer>
                      <div className="absolute bottom-1 right-1 bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-[9px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1 font-sans">
                        <Maximize2 size={9} />
                        <span>Click để phóng to</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-16 w-full rounded-lg border border-dashed border-slate-800 flex flex-col items-center justify-center text-[10px] text-slate-500 font-mono">
                      <AlertTriangle size={14} className="mx-auto mb-0.5 text-amber-500/60" />
                      Chưa có dữ liệu vị trí GPS cho yêu cầu này.
                    </div>
                  )}
                </div>

                {/* 4. AI Analysis Panel (Placed below map, auto-expanding height based on text) */}
                <div className="bg-slate-900 border border-indigo-950/80 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                    <span className="font-bold text-[11px] text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles size={13} className="text-indigo-400" />
                      Phân tích AI
                    </span>
                    {selectedRequest.aiConfidenceScore != null && (
                      <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                        {Math.round(selectedRequest.aiConfidenceScore * (selectedRequest.aiConfidenceScore <= 1 ? 100 : 1))}% Tin cậy
                      </span>
                    )}
                  </div>

                  {selectedRequest.aiUrgencyPrediction || selectedRequest.aiTranscript ? (
                    <div className="space-y-2 text-xs">
                      {selectedRequest.aiUrgencyPrediction && (
                        <div className="flex items-center justify-between text-slate-300 font-mono bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-800/80">
                          <span className="text-slate-400 text-[11px]">Mức độ đề xuất:</span>
                          <span className="font-bold text-amber-400 text-xs">{selectedRequest.aiUrgencyPrediction}</span>
                        </div>
                      )}
                      {selectedRequest.aiTranscript && (
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Trích xuất nội dung cuộc gọi:</span>
                          <div className="text-[11px] text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap break-words leading-relaxed font-sans shadow-inner">
                            "{selectedRequest.aiTranscript}"
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-[10px] italic py-1 text-center font-sans">
                      Chưa có dữ liệu AI
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="w-[32%] flex flex-col bg-slate-900/30 font-sans">
          {isRequestDispatched ? (
            <div className="flex-1 flex flex-col p-4 bg-slate-900 border-l border-slate-800 justify-between overflow-y-auto space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <h3 className="font-bold text-sm text-slate-100 uppercase tracking-wider">
                      Trạng thái Lệnh Điều xe
                    </h3>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </div>

                <div className="bg-slate-950/90 border border-emerald-500/40 p-4 rounded-2xl space-y-3 shadow-xl relative overflow-hidden">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 size={18} />
                    <span>REQ-{selectedRequest.id}: {selectedRequest.status === 'COMPLETED' ? 'CA ĐÃ HOÀN TẤT' : 'ĐÃ PHÁT LỆNH ĐIỀU XE'}</span>
                  </div>

                  <p className="text-xs text-slate-300">
                    {selectedRequest.status === 'COMPLETED'
                      ? 'Nhiệm vụ cấp cứu đã hoàn tất.'
                      : 'Lệnh điều động cấp cứu đã được gửi tới tài xế.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase">Mã Yêu cầu</span>
                      <strong className="text-red-400 text-sm font-bold">REQ-{selectedRequest.id}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 block uppercase">Mức độ Khẩn cấp</span>
                      <span className="text-amber-400 font-bold">{selectedRequest.urgencyLevel}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenSimulationForRequest(selectedRequest)}
                    disabled={isLoadingMissionForSim}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    {isLoadingMissionForSim ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                    <span>{isLoadingMissionForSim ? 'Đang tải...' : 'Mở Bảng Mô Phỏng Real-time'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-slate-800 space-y-2 bg-slate-900">
                <span className="font-semibold text-xs text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={14} className="text-indigo-400" />
                  Tài nguyên xe & Tài xế
                </span>
                <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                  <select value={resStatusFilter} onChange={(e) => setResStatusFilter(e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none">
                    <option value="ALL">Status: Tất cả</option>
                    <option value="AVAILABLE">AVAILABLE (Có sẵn)</option>
                  </select>
                  <select value={resProviderFilter} onChange={(e) => setResProviderFilter(e.target.value)} className="bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-slate-300 focus:outline-none">
                    <option value="ALL">Đơn vị: Tất cả</option>
                    {providers.map(p => <option key={p.id} value={p.id}>{p.providerName}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {filteredResources.map(res => {
                  const isSelected = selectedResource?.id === res.id;
                  const isAvailable = res.status === 'AVAILABLE';

                  return (
                    <div
                      key={res.id}
                      onClick={() => isAvailable && setSelectedResource(res)}
                      className={`p-3 rounded-xl border transition-all ${
                        isSelected 
                          ? 'bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/40 shadow-lg cursor-pointer' 
                          : isAvailable 
                            ? 'bg-slate-900 border-slate-800 hover:border-slate-700 cursor-pointer' 
                            : 'bg-slate-950/40 opacity-50 cursor-not-allowed border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-slate-100">{res.resourceCode}</span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-1.5 py-0.2 rounded flex items-center gap-1 border border-emerald-500/40">
                              <CheckCircle2 size={11} /> Đang chọn
                            </span>
                          )}
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${getStatusBadge(res.status)}`}>
                          {res.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-sans mt-1.5 pt-1.5 border-t border-slate-800/60">
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <User size={12} className="text-indigo-400" />
                          <span className="font-medium">{res.currentDriverName || res.driverName || 'Chưa gán tài xế'}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{res.providerName || 'Đơn vị Cấp cứu'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-slate-900/95 border-t border-slate-800 space-y-2 shrink-0">
                {selectedResource ? (
                  <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-xl space-y-1 text-xs font-sans">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 uppercase font-mono">Xe đã chọn:</span>
                      <span className="font-mono font-bold text-emerald-400">{selectedResource.resourceCode}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Tài xế:</span>
                      <span className="text-slate-200 font-medium">{selectedResource.currentDriverName || selectedResource.driverName || 'Sẵn sàng nhận lệnh'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-center text-slate-500 text-[11px]">
                    Chưa chọn xe. Click chọn 1 xe AVAILABLE ở trên.
                  </div>
                )}

                <button
                  onClick={handlePreDispatchCheck}
                  disabled={!selectedRequest || !selectedResource}
                  className="w-full bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <Send size={15} />
                  <span>Phát lệnh Điều xe</span>
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Send size={18} className="text-red-500" />
                Xác nhận Phát lệnh Điều xe
              </h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase text-[10px]">Ca Cấp cứu:</span>
                  <strong className="text-red-400">REQ-{selectedRequest?.id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase text-[10px]">Xe Điều Động:</span>
                  <strong className="text-emerald-400">{selectedResource?.resourceCode}</strong>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Bệnh viện tiếp nhận (Destination Hospital):</label>
                <select
                  value={selectedHospitalId}
                  onChange={(e) => setSelectedHospitalId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Chọn bệnh viện đích --</option>
                  {hospitals.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.hospitalName || h.name || `Bệnh viện #${h.id}`} ({h.hospitalAddress || 'Hà Nội'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Ghi chú điều phối (Notes):</label>
                <input
                  type="text"
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  placeholder="Ghi chú thêm cho tài xế..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button 
                onClick={() => setShowConfirmModal(false)} 
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmDispatch} 
                disabled={isSubmittingMission}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-1.5"
              >
                {isSubmittingMission ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                <span>{isSubmittingMission ? 'Đang phát lệnh...' : 'Xác nhận Điều xe'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {resourceDetailModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6">
            <h3 className="font-bold text-base">Chi tiết Xe: {resourceDetailModal.resourceCode}</h3>
            <button onClick={() => setResourceDetailModal(null)} className="mt-4 px-4 py-2 bg-slate-800 rounded-lg text-xs">Đóng</button>
          </div>
        </div>
      )}

           {/* ── TIMELINE MODAL (Normalized per contract) ── */}
      {timelineModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <FileText className="text-indigo-400" size={18} />
                Lịch sử Timeline REQ-{timelineModal.requestId}
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
                      <span className="font-bold text-indigo-300">{item.type}</span>
                      <span className="text-slate-500">{item.occurredAt ? new Date(item.occurredAt).toLocaleString() : 'N/A'}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] font-sans">{item.description}</p>
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

      {/* ── RECOMMENDATIONS MODAL (Top 3 xe) ── */}
      {recsModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sparkles className="text-amber-400" size={18} />
                Gợi ý Top 3 Xe Cứu Thương
              </h3>
              <button onClick={() => setRecsModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {recsModal.items.length === 0 ? (
                <div className="text-slate-400 text-center py-8 space-y-2">
                  <div className="text-sm font-semibold text-slate-300">Không có dữ liệu gợi ý xe</div>
                  <div className="text-xs text-slate-500">Máy chủ chưa có đề xuất xe cứu thương nào cho yêu cầu này (data: []).</div>
                </div>
              ) : (
                recsModal.items.map((rec, idx) => {
                  const rId = rec.resourceId ?? rec.id;
                  const rCode = rec.resourceCode ?? `AMB-${rId}`;
                  const rank = rec.rank ?? (idx + 1);
                  const isFirst = rank === 1;

                  return (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isFirst 
                          ? 'bg-slate-950 border-amber-500/50 ring-1 ring-amber-500/30' 
                          : 'bg-slate-950/80 border-slate-800'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2 font-mono">
                          <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border ${
                            rank === 1 
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                              : rank === 2 
                                ? 'bg-slate-400/20 text-slate-300 border-slate-400/50' 
                                : 'bg-orange-500/20 text-orange-400 border-orange-500/50'
                          }`}>
                            #{rank}
                          </span>
                          <span className="font-bold text-emerald-400 text-sm">{rCode}</span>
                          {isFirst && (
                            <span className="text-[9px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/40 px-1.5 py-0.2 rounded">
                              Tối ưu nhất
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-300 font-sans">
                          Khoảng cách: <strong className="text-white font-mono">{rec.distanceKm != null ? `${rec.distanceKm} km` : 'Gần nhất'}</strong> • ETA: <strong className="text-amber-300 font-mono">{rec.etaSeconds != null ? `${Math.round(rec.etaSeconds / 60)} phút` : '5 phút'}</strong>
                        </div>

                        {(rec.providerName || rec.driverName) && (
                          <div className="text-[10px] text-slate-400 font-sans truncate">
                            {rec.providerName && <span>Đơn vị: <span className="text-slate-300 font-medium">{rec.providerName}</span></span>}
                            {rec.driverName && <span className="ml-2">Tài xế: <span className="text-slate-300 font-medium">{rec.driverName}</span></span>}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          const targetRes = resources.find(r => r.id === rId || r.resourceCode === rCode);
                          if (targetRes) {
                            setSelectedResource(targetRes);
                          } else {
                            setSelectedResource({ id: rId, resourceCode: rCode, status: rec.status || 'AVAILABLE' });
                          }
                          setRecsModal(null);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer shadow-md ${
                          isFirst 
                            ? 'bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold shadow-amber-600/30' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
                        }`}
                      >
                        Chọn xe này
                      </button>
                    </div>
                  );
                })
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

      <SimulationControlModal
        isOpen={isSimulationModalOpen}
        onClose={() => setIsSimulationModalOpen(false)}
        mission={simulatingMission}
        onRequestRefresh={() => {
          fetchRequestsAndCatalogs();
          fetchResources();
        }}
      />

      {/* ── FULL SCREEN / ENLARGED MAP MODAL ── */}
      {isFullMapOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl h-[88vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                    Bản đồ Toàn cảnh Vị trí Sự cố REQ-{selectedRequest.id}
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${getStatusBadge(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedRequest.address || selectedRequest.callerAddress || 'Hà Nội'} • Tọa độ: {selectedRequest.latitude?.toFixed(5)}, {selectedRequest.longitude?.toFixed(5)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-4 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  <span className="flex items-center gap-1.5 text-red-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Hiện trường
                  </span>
                  <span className="flex items-center gap-1.5 text-blue-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Xe Cứu thương ({resources.filter(r => r.latitude && r.longitude).length})
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Bệnh viện ({hospitals.filter(h => h.latitude && h.longitude).length})
                  </span>
                </div>

                <button
                  onClick={() => setIsFullMapOpen(false)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 relative z-0">
              <MapContainer
                key={`full-map-${selectedRequest.id}`}
                center={[selectedRequest.latitude || 21.0285, selectedRequest.longitude || 105.8542]}
                zoom={14}
                className="w-full h-full"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Incident Marker (Red) */}
                {selectedRequest.latitude != null && selectedRequest.longitude != null && (
                  <Marker
                    position={[selectedRequest.latitude, selectedRequest.longitude]}
                    icon={reqMarkerIcon}
                  >
                    <Popup>
                      <div className="text-xs font-sans text-slate-900 space-y-1.5 min-w-[200px]">
                        <strong className="text-red-600 font-bold block text-sm">REQ-{selectedRequest.id}: {selectedRequest.serviceTypeName || 'Khẩn cấp'}</strong>
                        <div><strong className="text-slate-700">Địa chỉ:</strong> {selectedRequest.address || 'Hà Nội'}</div>
                        {getCallerInfo(selectedRequest).display !== 'N/A' && (
                          <div><strong className="text-slate-700">Người báo / SĐT:</strong> {getCallerInfo(selectedRequest).display}</div>
                        )}
                        <div className="font-mono text-[11px]">Mức độ: <span className="font-bold text-red-600">{selectedRequest.confirmedUrgencyLevel || selectedRequest.urgencyLevel || 'HIGH'}</span></div>
                        {(selectedRequest.description || selectedRequest.callerDescription || selectedRequest.note || selectedRequest.notes) && (
                          <div className="text-[11px] text-slate-800 bg-amber-50 p-1.5 rounded border border-amber-200">
                            <strong className="text-amber-900 block font-semibold mb-0.5">Mô tả của người báo tin:</strong>
                            <span>{selectedRequest.description || selectedRequest.callerDescription || selectedRequest.note || selectedRequest.notes}</span>
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}

                {/* Ambulance Markers (Blue) */}
                {resources
                  .filter(res => res.latitude != null && res.longitude != null)
                  .map(res => (
                    <Marker
                      key={`amb-${res.id}`}
                      position={[res.latitude, res.longitude]}
                      icon={ambMarkerIcon}
                    >
                      <Popup>
                        <div className="text-xs font-sans text-slate-900 space-y-1">
                          <strong className="text-blue-600 font-bold">{res.resourceCode}</strong>
                          <div>Trạng thái: <strong>{res.status}</strong></div>
                          <div>Tài xế: {res.currentDriverName || res.driverName || 'Chưa gán'}</div>
                          {res.status === 'AVAILABLE' && (
                            <button
                              onClick={() => {
                                setSelectedResource(res);
                                setIsFullMapOpen(false);
                              }}
                              className="mt-1 w-full px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold cursor-pointer"
                            >
                              Chọn xe này
                            </button>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                {/* Hospital Markers (Green) */}
                {hospitals
                  .filter(h => h.latitude != null && h.longitude != null)
                  .map(h => (
                    <Marker
                      key={`hosp-${h.id}`}
                      position={[h.latitude, h.longitude]}
                      icon={hospMarkerIcon}
                    >
                      <Popup>
                        <div className="text-xs font-sans text-slate-900 space-y-1">
                          <strong className="text-emerald-700 font-bold">{h.hospitalName || h.name}</strong>
                          <div>{h.hospitalAddress || 'Hà Nội'}</div>
                          <div>Hotline: {h.contactPhone || '115'}</div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EmergencyIntakeDispatch;
