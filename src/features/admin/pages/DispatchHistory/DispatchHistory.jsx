import React, { useState, useEffect, useCallback } from "react";
import {
  History,
  Search,
  RefreshCw,
  Eye,
  MapPin,
  AlertTriangle,
  FileText,
  X,
  Truck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  User,
  Navigation,
} from "lucide-react";
import { dispatchRequestService } from "../../../../services/dispatchRequestService";
import { dashboardService } from "../../../../services/dashboardService";

const getUrgencyBadge = (urgency) => {
  switch (urgency?.toUpperCase()) {
    case "CRITICAL":
      return {
        bg: "bg-red-950/60 text-red-400 border-red-800/80",
        label: "CRITICAL",
      };
    case "HIGH":
      return {
        bg: "bg-amber-950/60 text-amber-400 border-amber-800/80",
        label: "HIGH",
      };
    case "MEDIUM":
      return {
        bg: "bg-yellow-950/60 text-yellow-400 border-yellow-800/80",
        label: "MEDIUM",
      };
    case "LOW":
    default:
      return {
        bg: "bg-slate-800 text-slate-400 border-slate-700",
        label: urgency || "LOW",
      };
  }
};

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case "COMPLETED":
      return "bg-emerald-950/60 text-emerald-400 border-emerald-800/80";
    case "DISPATCHED":
    case "TRANSPORTING":
    case "ARRIVED_SCENE":
    case "ARRIVED_HOSPITAL":
      return "bg-blue-950/60 text-blue-400 border-blue-800/80";
    case "PENDING":
      return "bg-amber-950/60 text-amber-400 border-amber-800/80";
    case "CANCELLED":
    case "REJECTED":
      return "bg-rose-950/60 text-rose-400 border-rose-800/80";
    default:
      return "bg-slate-800 text-slate-300 border-slate-700";
  }
};

const DispatchHistory = () => {
  const [activeTab, setActiveTab] = useState("missions"); // 'missions' | 'requests'
  const [requests, setRequests] = useState([]);
  const [missions, setMissions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search and Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState("ALL");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Selected Detail Modal
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMission, setSelectedMission] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqData, dashData] = await Promise.all([
        dispatchRequestService.getAll().catch(() => []),
        dashboardService.getAdminDashboard().catch(() => null),
      ]);

      setRequests(Array.isArray(reqData) ? reqData : []);
      const missionDetails = dashData?.details?.missionDetails || [];
      setMissions(missionDetails);
    } catch (err) {
      console.error("Error fetching dispatch and mission history:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, statusFilter, urgencyFilter]);

  // Filtered Missions
  const filteredMissions = missions.filter((m) => {
    const term = search.toLowerCase();
    const matchesSearch = term
      ? `MIS-${m.missionId}`.toLowerCase().includes(term) ||
        (m.resourceCode && m.resourceCode.toLowerCase().includes(term)) ||
        (m.driver && m.driver.toLowerCase().includes(term)) ||
        (m.destination && m.destination.toLowerCase().includes(term))
      : true;

    const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;
    const matchesUrgency =
      urgencyFilter === "ALL" || m.urgency === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  // Filtered Requests
  const filteredRequests = requests.filter((r) => {
    const term = search.toLowerCase();
    const matchesSearch = term
      ? `REQ-${r.id}`.toLowerCase().includes(term) ||
        (r.address && r.address.toLowerCase().includes(term)) ||
        (r.callerName && r.callerName.toLowerCase().includes(term)) ||
        (r.callerPhone && r.callerPhone.includes(term))
      : true;

    const matchesStatus = statusFilter === "ALL" || r.status === statusFilter;
    const matchesUrgency =
      urgencyFilter === "ALL" || r.urgencyLevel === urgencyFilter;
    return matchesSearch && matchesStatus && matchesUrgency;
  });

  const activeList =
    activeTab === "missions" ? filteredMissions : filteredRequests;
  const totalItems = activeList.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedList = activeList.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  return (
    <div className="p-6 bg-slate-950 min-h-full text-slate-100 font-sans space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="text-indigo-400" size={24} />
            Quản lý Điều phối & Nhiệm vụ Cứu thương (Dispatch & Mission
            Management)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi, tra cứu toàn diện các lệnh điều xe cứu thương và yêu cầu
            cấp cứu trên toàn hệ thống.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab("missions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "missions"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <Truck size={15} />
          Nhiệm vụ Điều xe (Missions) ({missions.length})
        </button>

        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "requests"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-white hover:bg-slate-900"
          }`}
        >
          <ShieldAlert size={15} />
          Yêu cầu Cấp cứu (Requests) ({requests.length})
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder={
              activeTab === "missions"
                ? "Tìm theo Mã MIS, Xe, Tài xế, Bệnh viện..."
                : "Tìm theo Mã REQ, SĐT, Địa chỉ..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">Mức độ khẩn cấp: Tất cả</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">Trạng thái: Tất cả</option>
          {activeTab === "missions" ? (
            <>
              <option value="DISPATCHED">DISPATCHED (Đã phát lệnh)</option>
              <option value="ARRIVED_SCENE">
                ARRIVED_SCENE (Đến hiện trường)
              </option>
              <option value="TRANSPORTING">
                TRANSPORTING (Đang chuyển viện)
              </option>
              <option value="COMPLETED">COMPLETED (Hoàn tất)</option>
              <option value="CANCELLED">CANCELLED (Đã hủy)</option>
            </>
          ) : (
            <>
              <option value="PENDING">PENDING (Chờ tiếp nhận)</option>
              <option value="CONFIRMED">CONFIRMED (Đã xác minh)</option>
              <option value="DISPATCHED">DISPATCHED (Đã điều xe)</option>
              <option value="COMPLETED">COMPLETED (Hoàn thành)</option>
              <option value="REJECTED">REJECTED (Từ chối)</option>
            </>
          )}
        </select>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {activeTab === "missions" ? (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mã Nhiệm vụ</th>
                  <th className="py-3 px-4">Xe cứu thương</th>
                  <th className="py-3 px-4">Tài xế</th>
                  <th className="py-3 px-4">Điểm đến</th>
                  <th className="py-3 px-4">Mức độ</th>
                  <th className="py-3 px-4">Thời gian phát lệnh</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {paginatedList.length > 0 ? (
                  paginatedList.map((m, idx) => {
                    const urgBadge = getUrgencyBadge(m.urgency);
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-red-400 font-bold">
                          MIS-{m.missionId}
                        </td>
                        <td className="py-3 px-4 text-slate-100 font-semibold">
                          {m.resourceCode || "N/A"}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-300">
                          {m.driver || "Chưa gán"}
                        </td>
                        <td
                          className="py-3 px-4 font-sans text-slate-300 truncate max-w-[180px]"
                          title={m.destination}
                        >
                          {m.destination || "Hiện trường"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${urgBadge.bg}`}
                          >
                            {urgBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[10px]">
                          {m.dispatchedAt
                            ? new Date(m.dispatchedAt).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(m.status)}`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedMission(m)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-500 text-xs"
                    >
                      Không có nhiệm vụ nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mã Yêu cầu</th>
                  <th className="py-3 px-4">Người báo tin</th>
                  <th className="py-3 px-4">Địa chỉ sự cố</th>
                  <th className="py-3 px-4">Dịch vụ</th>
                  <th className="py-3 px-4">Mức độ</th>
                  <th className="py-3 px-4">Thời gian tiếp nhận</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {paginatedList.length > 0 ? (
                  paginatedList.map((r, idx) => {
                    const urgBadge = getUrgencyBadge(r.urgencyLevel);
                    return (
                      <tr
                        key={idx}
                        className="hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-indigo-400 font-bold">
                          REQ-{r.id}
                        </td>
                        <td className="py-3 px-4 font-sans">
                          <span className="text-slate-100 font-medium block">
                            {r.callerName || "Người dân"}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            {r.callerPhone || "N/A"}
                          </span>
                        </td>
                        <td
                          className="py-3 px-4 font-sans text-slate-300 truncate max-w-[200px]"
                          title={r.address || r.callerAddress}
                        >
                          {r.address || r.callerAddress || "Hà Nội"}
                        </td>
                        <td className="py-3 px-4 font-sans text-indigo-300">
                          {r.serviceTypeName || `Loại ${r.serviceTypeId}`}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${urgBadge.bg}`}
                          >
                            {urgBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400 text-[10px]">
                          {r.createdAt
                            ? new Date(r.createdAt).toLocaleString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(r.status)}`}
                          >
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedRequest(r)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded text-[11px] font-sans font-medium transition-colors cursor-pointer"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-12 text-center text-slate-500 text-xs"
                    >
                      Không có yêu cầu cấp cứu nào phù hợp với bộ lọc tìm kiếm.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div>
            Hiển thị {paginatedList.length} trên tổng số {totalItems} bản ghi
          </div>

          <div className="flex items-center gap-2 font-mono">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="p-1 rounded bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Mission Detail Modal */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 font-mono">
                <Truck size={16} className="text-indigo-400" />
                Chi tiết Nhiệm vụ MIS-{selectedMission.missionId}
              </h3>
              <button
                onClick={() => setSelectedMission(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Mã Nhiệm vụ
                  </span>
                  <span className="text-red-400 font-bold text-sm">
                    MIS-{selectedMission.missionId}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Trạng thái
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getStatusBadge(selectedMission.status)}`}
                  >
                    {selectedMission.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Xe cứu thương
                  </span>
                  <span className="text-slate-100 font-bold text-sm">
                    {selectedMission.resourceCode}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Tài xế phụ trách
                  </span>
                  <span className="text-slate-200 font-sans">
                    {selectedMission.driver || "Chưa gán"}
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-start gap-2">
                  <Navigation
                    size={14}
                    className="text-emerald-400 shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Điểm đến / Bệnh viện
                    </span>
                    <span className="text-slate-200 font-medium">
                      {selectedMission.destination || "Hiện trường cấp cứu"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 font-mono text-[11px] bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian phát lệnh:</span>
                  <span className="text-slate-200">
                    {selectedMission.dispatchedAt
                      ? new Date(selectedMission.dispatchedAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian tài xế nhận:</span>
                  <span className="text-slate-200">
                    {selectedMission.acceptedAt
                      ? new Date(selectedMission.acceptedAt).toLocaleString()
                      : "Chưa nhận"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Thời gian hoàn thành:</span>
                  <span className="text-emerald-400">
                    {selectedMission.completedAt
                      ? new Date(selectedMission.completedAt).toLocaleString()
                      : "Đang thực hiện"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedMission(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 font-mono">
                <ShieldAlert size={16} className="text-red-400" />
                Chi tiết Yêu cầu Cấp cứu REQ-{selectedRequest.id}
              </h3>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Mã Yêu cầu
                  </span>
                  <span className="text-indigo-400 font-bold text-sm">
                    REQ-{selectedRequest.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Trạng thái
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getStatusBadge(selectedRequest.status)}`}
                  >
                    {selectedRequest.status}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Mức độ khẩn cấp
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-0.5 ${getUrgencyBadge(selectedRequest.urgencyLevel).bg}`}
                  >
                    {selectedRequest.urgencyLevel}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">
                    Dịch vụ yêu cầu
                  </span>
                  <span className="text-slate-200 font-sans">
                    {selectedRequest.serviceTypeName ||
                      `ID: ${selectedRequest.serviceTypeId}`}
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 font-sans">
                <div className="flex items-start gap-2">
                  <User size={14} className="text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Người báo tin / SĐT
                    </span>
                    <span className="text-slate-200 font-medium">
                      {selectedRequest.callerName || "Người dân"} -{" "}
                      {selectedRequest.callerPhone || "Không có SĐT"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-1 border-t border-slate-800/60">
                  <MapPin
                    size={14}
                    className="text-emerald-400 shrink-0 mt-0.5"
                  />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-mono">
                      Địa chỉ hiện trường
                    </span>
                    <span className="text-slate-200">
                      {selectedRequest.address ||
                        selectedRequest.callerAddress ||
                        "Hà Nội"}
                    </span>
                    {selectedRequest.latitude && (
                      <span className="text-slate-500 font-mono text-[10px] block mt-0.5">
                        Tọa độ: {selectedRequest.latitude.toFixed(4)},{" "}
                        {selectedRequest.longitude?.toFixed(4)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(selectedRequest.description ||
                selectedRequest.callerDescription) && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-300">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase block mb-1">
                    Mô tả cuộc gọi:
                  </span>
                  <p className="leading-relaxed">
                    {selectedRequest.description ||
                      selectedRequest.callerDescription}
                  </p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
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

export default DispatchHistory;
