import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, ShieldAlert, Truck, CheckCircle2, Clock, AlertTriangle, RefreshCw, BarChart2, Download, DollarSign, Receipt, ChevronRight, Users, Building2, Calendar, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { dispatchRequestService } from '../../../../services/dispatchRequestService';
import { dispatchResourceService } from '../../../../services/dispatchResourceService';
import { dashboardService } from '../../../../services/dashboardService';
import { providerService } from '../../../../services/providerService';

const formatVND = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const OperationsOverview = () => {
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [providers, setProviders] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [timeRange, setTimeRange] = useState('TODAY'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'

  const getFilterParams = useCallback(() => {
    const params = {};
    if (selectedProviderId) {
      params.providerId = Number(selectedProviderId);
    }
    const now = new Date();
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
    }
    return params;
  }, [selectedProviderId, timeRange]);

  const fetchOverviewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = getFilterParams();
      const [reqData, resData, provData, adminDash] = await Promise.all([
        dispatchRequestService.getAll().catch(() => []),
        dispatchResourceService.getAll().catch(() => []),
        providerService.getAll().catch(() => []),
        dashboardService.getAdminDashboard(params).catch(() => null),
      ]);

      setRequests(Array.isArray(reqData) ? reqData : []);
      setResources(Array.isArray(resData) ? resData : []);
      setProviders(Array.isArray(provData) ? provData : []);
      setDashStats(adminDash);
    } catch (err) {
      console.error('Error fetching overview statistics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getFilterParams]);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const params = getFilterParams();
      const blob = await dashboardService.exportAdminDashboard(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Admin_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting dashboard:', err);
      alert('Xuất báo cáo Excel thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsExporting(false);
    }
  };

  // KPIs extracted from Backend
  const kpis = dashStats?.kpis || {};
  const totalRequests = kpis.totalDispatchRequests ?? requests.length;
  const totalMissions = kpis.totalMissions ?? 0;
  const totalProviders = kpis.totalProviders ?? providers.length;
  const totalUsers = kpis.totalUsers ?? 0;
  const platformRevenue = kpis.platformRevenue ?? 0;

  // Breakdown counts
  const criticalReqs = requests.filter(r => r.urgencyLevel === 'CRITICAL').length;
  const highReqs = requests.filter(r => r.urgencyLevel === 'HIGH').length;
  const pendingReqs = requests.filter(r => r.status === 'PENDING').length;
  const dispatchedReqs = requests.filter(r => r.status === 'DISPATCHED').length;
  const completedReqs = requests.filter(r => r.status === 'COMPLETED').length;

  const totalResources = kpis.availableResources !== undefined && kpis.busyResources !== undefined 
    ? (kpis.availableResources + kpis.busyResources) 
    : resources.length;
  const availableRes = kpis.availableResources ?? resources.filter(r => r.status === 'AVAILABLE').length;
  const busyRes = kpis.busyResources ?? resources.filter(r => r.status === 'BUSY').length;

  const seriesData = Array.isArray(dashStats?.series) ? dashStats.series : [];
  const maxSeriesCount = Math.max(...seriesData.map(s => Math.max(s.requests || 0, s.missions || 0, s.completed || 0)), 1);

  const missionDetails = dashStats?.details?.missionDetails || [];
  const providerPerformance = dashStats?.details?.providerPerformance || [];

  return (
    <div className="p-6 bg-slate-950 min-h-full text-slate-100 font-sans space-y-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-indigo-400" size={24} />
            Tổng quan vận hành (Operations Overview)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Báo cáo thống kê thời gian thực từ dữ liệu điều phối và tài nguyên hệ thống SmartEMS.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
            {isExporting ? 'Đang xuất Excel...' : 'Xuất Báo cáo Excel'}
          </button>

          <button
            onClick={fetchOverviewData}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-indigo-400 shrink-0" />
          <span className="text-slate-400 font-medium">Bộ lọc:</span>

          {/* Time range pills */}
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
                    ? 'bg-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building2 size={14} className="text-slate-500" />
          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 w-full sm:w-64"
          >
            <option value="">Tất cả Đơn vị Vận chuyển (Providers)</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>
                {p.providerName || p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Requests Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Tổng Yêu cầu Điều phối</span>
            <ShieldAlert size={18} className="text-red-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {isLoading ? '...' : totalRequests}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <span className="text-red-400">{criticalReqs} CRITICAL</span>
            <span>•</span>
            <span className="text-amber-400">{pendingReqs} PENDING</span>
          </div>
        </div>

        {/* Total Missions Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Nhiệm vụ Điều xe (Missions)</span>
            <Clock size={18} className="text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-400 font-mono">
            {isLoading ? '...' : totalMissions}
          </div>
          <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
            <span className="text-emerald-400">{completedReqs} Hoàn tất</span>
            <span>•</span>
            <span className="text-blue-400">{dispatchedReqs} Đang chạy</span>
          </div>
        </div>

        {/* Available Resources Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Xe Cứu thương Khả dụng</span>
            <Truck size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {isLoading ? '...' : availableRes} / {totalResources}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {busyRes} xe đang bận / trên ca
          </div>
        </div>

        {/* Total Providers & Users Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Đơn vị & Tài khoản</span>
            <Users size={18} className="text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400 font-mono">
            {isLoading ? '...' : totalProviders} <span className="text-xs text-slate-400 font-normal">đơn vị</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {totalUsers} người dùng hệ thống
          </div>
        </div>

      </div>

      {/* Platform Real Revenue Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Receipt size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Doanh thu Nền tảng SmartEMS
                <span className="text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                  REAL-TIME REVENUE
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Tổng hợp doanh thu hệ thống ghi nhận từ Backend API
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 font-medium">Doanh thu sàn:</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                {formatVND(platformRevenue)}
              </span>
            </div>
            <Link
              to="/admin/finance"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Xem chi tiết tài chính</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Real Series Trend / Activity Chart */}
        {seriesData.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-medium flex items-center gap-1.5">
                <BarChart2 size={14} className="text-indigo-400" />
                Biểu đồ Diễn biến Yêu cầu & Nhiệm vụ theo mốc thời gian
              </span>
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span> Yêu cầu</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Hoàn tất</span>
              </div>
            </div>

            <div className="h-28 flex items-end gap-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 overflow-x-auto">
              {seriesData.map((item, idx) => {
                const reqHeight = Math.round(((item.requests || 0) / maxSeriesCount) * 100);
                const compHeight = Math.round(((item.completed || 0) / maxSeriesCount) * 100);
                const timeLabel = item.bucketStart ? new Date(item.bucketStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : idx;

                return (
                  <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 h-full justify-end group relative">
                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div 
                        style={{ height: `${Math.max(reqHeight, 4)}%` }} 
                        className="w-2.5 bg-indigo-500 rounded-t transition-all group-hover:bg-indigo-400"
                      />
                      <div 
                        style={{ height: `${Math.max(compHeight, 4)}%` }} 
                        className="w-2.5 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-400"
                      />
                    </div>
                    <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                      {timeLabel}
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full mb-1 hidden group-hover:block z-10 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[10px] whitespace-nowrap shadow-lg">
                      <div>{item.bucketStart ? new Date(item.bucketStart).toLocaleString() : ''}</div>
                      <div className="text-indigo-400">Yêu cầu: {item.requests || 0}</div>
                      <div className="text-emerald-400">Hoàn tất: {item.completed || 0}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Operational Details Section: Provider Performance & Active Mission Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Provider Performance Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Building2 size={16} className="text-emerald-400" />
              Hiệu suất Đơn vị Vận chuyển (Provider Performance)
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {providerPerformance.length} Đơn vị
            </span>
          </div>

          {providerPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Đơn vị</th>
                    <th className="py-2.5 px-3 text-center">Tổng ca</th>
                    <th className="py-2.5 px-3 text-center text-emerald-400">Hoàn thành</th>
                    <th className="py-2.5 px-3 text-right">Tỷ lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {providerPerformance.map((p, idx) => {
                    const rate = p.missions > 0 ? Math.round((p.completed / p.missions) * 100) : 0;
                    return (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-2.5 px-3 font-sans font-medium text-slate-200">{p.providerName}</td>
                        <td className="py-2.5 px-3 text-center">{p.missions}</td>
                        <td className="py-2.5 px-3 text-center text-emerald-400">{p.completed}</td>
                        <td className="py-2.5 px-3 text-right text-indigo-300">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Chưa có dữ liệu ca điều xe nào từ các đơn vị trong khoảng thời gian đã chọn.
            </div>
          )}
        </div>

        {/* Mission Details Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <Truck size={16} className="text-indigo-400" />
              Nhiệm vụ Điều xe Gần nhất (Recent Missions)
            </h2>
            <Link to="/admin/incidents" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5">
              <span>Xem tất cả</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          {missionDetails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Mã ca</th>
                    <th className="py-2.5 px-3">Xe / Tài xế</th>
                    <th className="py-2.5 px-3">Điểm đến</th>
                    <th className="py-2.5 px-3 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {missionDetails.slice(0, 5).map((m, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2.5 px-3 text-red-400 font-bold">MIS-{m.missionId}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="text-slate-200 block font-medium">{m.resourceCode || 'N/A'}</span>
                        <span className="text-slate-400 text-[10px]">{m.driver || 'Chưa gán'}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300 font-sans truncate max-w-[140px]" title={m.destination}>
                        {m.destination || 'Hiện trường'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono border bg-slate-800 text-slate-300 border-slate-700">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-xs">
              Chưa có dữ liệu nhiệm vụ nào được ghi nhận.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default OperationsOverview;
