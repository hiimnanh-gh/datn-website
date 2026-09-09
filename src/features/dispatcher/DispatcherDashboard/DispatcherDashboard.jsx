import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  BarChart2, 
  Download, 
  ChevronRight, 
  Filter, 
  Zap,
  MapPin,
  FileText,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../../services/dashboardService';
import { dispatchRequestService } from '../../../services/dispatchRequestService';
import HeaderUserProfile from '../../../components/HeaderUserProfile';

const getUrgencyBadge = (urgency) => {
  switch (urgency?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    case 'HIGH':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'MEDIUM':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    case 'LOW':
    default:
      return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
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
    case 'IN_PROGRESS':
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

const formatSecondsToMinutes = (seconds) => {
  if (seconds === null || seconds === undefined || isNaN(seconds) || seconds <= 0) return '0s';
  const sec = Math.round(Number(seconds));
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
};

const DispatcherDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [liveRequests, setLiveRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);

  // Time filter
  const [timeRange, setTimeRange] = useState('TODAY'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'

  const getFilterParams = useCallback(() => {
    const params = {};
    const now = new Date();
    params.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh';

    if (timeRange === 'TODAY') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      params.from = startOfDay.toISOString();
      params.to = now.toISOString();
      params.granularity = 'HOUR';
    } else if (timeRange === 'WEEK') {
      const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      params.from = pastWeek.toISOString();
      params.to = now.toISOString();
      params.granularity = 'DAY';
    } else if (timeRange === 'MONTH') {
      const pastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      params.from = pastMonth.toISOString();
      params.to = now.toISOString();
      params.granularity = 'DAY';
    } else if (timeRange === 'ALL') {
      const pastYear = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      params.from = pastYear.toISOString();
      params.to = now.toISOString();
      params.granularity = 'DAY';
    }
    return params;
  }, [timeRange]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = getFilterParams();
      const [res, liveReqs] = await Promise.all([
        dashboardService.getDispatcherDashboard(params).catch(() => null),
        dispatchRequestService.getAll().catch(() => [])
      ]);
      setDashboardData(res || null);
      setLiveRequests(Array.isArray(liveReqs) ? liveReqs : []);
    } catch (err) {
      console.error('Error fetching dispatcher dashboard:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu thống kê từ máy chủ.');
    } finally {
      setIsLoading(false);
    }
  }, [getFilterParams]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = getFilterParams();
      const blob = await dashboardService.exportDispatcherDashboard(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dispatcher-dashboard-${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Lỗi xuất báo cáo Excel: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsExporting(false);
    }
  };

  const kpis = dashboardData?.kpis || {};
  const seriesData = Array.isArray(dashboardData?.series) ? dashboardData.series : [];
  const maxSeries = Math.max(...seriesData.map(s => Math.max(s.requests || s.assigned || 0, s.completed || 0)), 1);

  const breakdowns = dashboardData?.breakdowns || {};
  const requestStatusBreakdown = Array.isArray(breakdowns.requestStatus) ? breakdowns.requestStatus : [];
  const requestUrgencyBreakdown = Array.isArray(breakdowns.requestUrgency) ? breakdowns.requestUrgency : [];
  const resourceStatusBreakdown = Array.isArray(breakdowns.resourceStatus) ? breakdowns.resourceStatus : [];

  const details = dashboardData?.details || {};
  const requestDetails = (Array.isArray(details.requestDetails) && details.requestDetails.length > 0)
    ? details.requestDetails
    : liveRequests;

  // Live KPI fallbacks if dashboard API returns 0
  const pendingCount = liveRequests.filter(r => r.status === 'PENDING').length;
  const criticalPendingCount = liveRequests.filter(r => r.status === 'PENDING' && (r.urgencyLevel === 'CRITICAL' || r.urgency === 'CRITICAL')).length;
  const processingCount = liveRequests.filter(r => r.status === 'DISPATCHING' || r.status === 'DISPATCHED' || r.status === 'EN_ROUTE').length;
  const completedCount = liveRequests.filter(r => r.status === 'COMPLETED').length;

  const totalRequestsDisplay = kpis.totalRequests != null && kpis.totalRequests > 0 
    ? kpis.totalRequests 
    : (timeRange === 'ALL' || timeRange === 'MONTH' ? Math.max(kpis.totalRequests || 0, liveRequests.length) : (kpis.totalRequests ?? 0));
  const pendingRequestsDisplay = kpis.pendingRequests != null && kpis.pendingRequests > 0 ? kpis.pendingRequests : pendingCount;
  const criticalPendingDisplay = kpis.criticalPendingRequests != null && kpis.criticalPendingRequests > 0 ? kpis.criticalPendingRequests : criticalPendingCount;
  const processingRequestsDisplay = kpis.processingRequests != null && kpis.processingRequests > 0 ? kpis.processingRequests : processingCount;
  const completedRequestsDisplay = kpis.completedRequests != null && kpis.completedRequests > 0 ? kpis.completedRequests : completedCount;

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-3 sm:p-6 overflow-y-auto space-y-5">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Layers className="text-red-500 shrink-0" size={22} />
            <span>Tổng Quan Điều Phối (Dispatcher Dashboard)</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Giám sát thời gian thực số ca cấp cứu, tiến độ điều động xe và chỉ số SLA hệ thống
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-md"
          >
            <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
            <span>{isExporting ? 'Đang xuất...' : 'Xuất Excel'}</span>
          </button>

          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-indigo-400' : ''} />
            <span>Làm mới</span>
          </button>

          <div className="pl-2 border-l border-slate-800">
            <HeaderUserProfile profilePath="/dispatcher/profile" />
          </div>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-red-400 shrink-0" />
          <span className="text-slate-400 font-medium">Khoảng thời gian:</span>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {[
              { id: 'TODAY', label: 'Hôm nay' },
              { id: 'WEEK', label: '7 ngày' },
              { id: 'MONTH', label: '30 ngày' },
              { id: 'ALL', label: 'Tất cả' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                  timeRange === tab.id 
                    ? 'bg-red-600 text-white shadow-sm font-semibold' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Trung tâm Điều phối: <strong className="text-slate-200 font-sans">SmartEMS Dispatch Center</strong></span>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 p-4 rounded-xl text-xs text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={fetchDashboardData}
            className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="py-16 text-center text-slate-400 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <RefreshCw size={36} className="animate-spin text-red-500 mx-auto mb-3" />
          <p className="text-sm font-medium">Đang đồng bộ dữ liệu điều phối từ hệ thống...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* ── KPI Summary Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            
            {/* 1. Total Requests */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase font-mono">Tổng Ca Tiếp Nhận</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white">{totalRequestsDisplay}</span>
                <ShieldAlert size={18} className="text-slate-500" />
              </div>
              <span className="text-[10px] text-slate-500 font-mono block">Toàn bộ yêu cầu</span>
            </div>

            {/* 2. Pending Requests */}
            <div className="bg-slate-900 border border-amber-500/30 p-3.5 rounded-xl space-y-1 shadow-sm bg-amber-950/10">
              <span className="text-[11px] font-semibold text-amber-400 block uppercase font-mono">Chờ Xử Lý (Pending)</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-amber-400">{pendingRequestsDisplay}</span>
                <Clock size={18} className="text-amber-500" />
              </div>
              <span className="text-[10px] text-amber-400/80 font-mono block">Cần tiếp nhận</span>
            </div>

            {/* 3. Critical Pending */}
            <div className="bg-slate-900 border border-red-500/40 p-3.5 rounded-xl space-y-1 shadow-sm bg-red-950/20">
              <span className="text-[11px] font-semibold text-red-400 block uppercase font-mono">Nguy Kịch (Critical)</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-red-400">{criticalPendingDisplay}</span>
                <AlertTriangle size={18} className="text-red-500 animate-pulse" />
              </div>
              <span className="text-[10px] text-red-400/80 font-mono block">Ưu tiên số 1</span>
            </div>

            {/* 4. Processing Requests */}
            <div className="bg-slate-900 border border-indigo-500/30 p-3.5 rounded-xl space-y-1 shadow-sm bg-indigo-950/10">
              <span className="text-[11px] font-semibold text-indigo-300 block uppercase font-mono">Đang Điều Phối</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-indigo-300">{processingRequestsDisplay}</span>
                <Activity size={18} className="text-indigo-400" />
              </div>
              <span className="text-[10px] text-indigo-400/80 font-mono block">Xe đang chạy</span>
            </div>

            {/* 5. Completed Requests */}
            <div className="bg-slate-900 border border-emerald-500/30 p-3.5 rounded-xl space-y-1 shadow-sm bg-emerald-950/10">
              <span className="text-[11px] font-semibold text-emerald-400 block uppercase font-mono">Hoàn Tất</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{completedRequestsDisplay}</span>
                <CheckCircle2 size={18} className="text-emerald-500" />
              </div>
              <span className="text-[10px] text-emerald-400/80 font-mono block">Đã bàn giao</span>
            </div>

            {/* 6. Available Resources & Avg Dispatch Time */}
            <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] font-semibold text-blue-400 block uppercase font-mono">Xe Khả Dụng / TB</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-blue-400">{kpis.availableResources ?? 0}</span>
                <Truck size={18} className="text-blue-500" />
              </div>
              <span className="text-[10px] text-slate-400 font-mono block">
                SLA: <strong className="text-yellow-400">{formatSecondsToMinutes(kpis.averageDispatchTimeSeconds)}</strong>
              </span>
            </div>

          </div>

          {/* ── Operational Charts & Breakdowns ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* 1. Trend Over Time (Bar Chart) */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <BarChart2 className="text-red-400" size={16} />
                  Biểu Đồ Xu Hướng Ca Cấp Cứu Theo Thời Gian
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  {seriesData.length} mốc thời gian
                </span>
              </div>

              {seriesData.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-xs font-mono">
                  Chưa có dữ liệu chuỗi thời gian cho khoảng lọc này.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="h-44 flex items-end gap-1 sm:gap-2 pt-6 pb-2 border-b border-slate-800">
                    {seriesData.map((item, idx) => {
                      const count = item.requests ?? item.assigned ?? 0;
                      const completed = item.completed ?? 0;
                      const heightPercent = Math.min(100, Math.max(8, Math.round((count / maxSeries) * 100)));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className="w-full max-w-[28px] bg-gradient-to-t from-red-600 to-amber-500 hover:brightness-125 rounded-t transition-all cursor-pointer relative"
                          >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-700 px-1.5 py-0.5 rounded text-[9px] font-mono text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                              Tiếp nhận: {count} • Xong: {completed}
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-slate-500 truncate max-w-full">
                            {item.bucketStart ? item.bucketStart.slice(11, 16) || item.bucketStart.slice(5, 10) : `#${idx + 1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-6 text-xs text-slate-400 pt-2 font-mono">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm bg-gradient-to-t from-red-600 to-amber-500 inline-block" />
                      <span>Số ca tiếp nhận & phát lệnh</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Breakdowns (Urgency & Status) */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
                  <Zap className="text-amber-400" size={16} />
                  Phân Loại Mức Độ Khẩn Cấp
                </h3>

                <div className="mt-3 space-y-2 text-xs">
                  {requestUrgencyBreakdown.length === 0 ? (
                    <p className="text-slate-500 text-center py-4">Chưa có dữ liệu phân loại</p>
                  ) : (
                    requestUrgencyBreakdown.map((u, i) => (
                      <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                        <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] border ${getUrgencyBadge(u.key)}`}>
                          {u.key}
                        </span>
                        <span className="font-mono font-bold text-slate-200">{u.count} ca</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <h4 className="font-bold text-xs text-slate-300 mb-2">Trạng Thái Đội Xe</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {resourceStatusBreakdown.map((r, i) => (
                    <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-[11px]">
                      <span className="text-slate-400">{r.key}</span>
                      <strong className="text-white">{r.count}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* ── Recent Dispatched Requests Table ── */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                  <FileText className="text-red-400" size={16} />
                  Danh Sách Ca Điều Phối Gần Đây
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Dữ liệu trích xuất trực tiếp từ máy chủ SmartEMS
                </p>
              </div>

              <Link
                to="/dispatcher/dispatch-requests"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <span>Mở toàn bộ ca</span>
                <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mã Yêu Cầu</th>
                    <th className="py-3 px-4">Mức Độ</th>
                    <th className="py-3 px-4">Địa Chỉ Hiện Trường</th>
                    <th className="py-3 px-4">Xe Tiếp Nhận</th>
                    <th className="py-3 px-4">Trạng Thái</th>
                    <th className="py-3 px-4">Thời Gian Tạo</th>
                    <th className="py-3 px-4 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {requestDetails.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-500 font-sans">
                        Chưa có dữ liệu ca điều phối nào trong khoảng thời gian này.
                      </td>
                    </tr>
                  ) : (
                    requestDetails.slice(0, 10).map((req, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-indigo-400">
                          REQ-{req.requestId || req.id}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getUrgencyBadge(req.urgency || req.urgencyLevel)}`}>
                            {req.urgency || req.urgencyLevel || 'STANDARD'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-sans truncate max-w-[200px]">
                          {req.address || req.callerAddress || 'Hà Nội'}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-400">
                          {req.resourceCode || (req.resourceId ? `AMB-${req.resourceId}` : 'Chưa gán xe')}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(req.status)}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-right font-sans">
                          <Link
                            to="/dispatcher/dispatch-requests"
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <span>Chi tiết</span>
                            <ChevronRight size={12} />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default DispatcherDashboard;
