import { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  Percent, 
  Download,
  RefreshCw,
  Truck,
  Users,
  Activity,
  ShieldCheck,
  Filter,
  BarChart2,
  Receipt,
  Zap
} from 'lucide-react';
import { dashboardService } from '../../../../services/dashboardService';
import { dispatchResourceService } from '../../../../services/dispatchResourceService';
import useAuthStore from '../../../../store/useAuthStore';
import './ProviderDashboard.css';

const formatVND = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0 ₫';
  return Number(val).toLocaleString('vi-VN') + ' ₫';
};

const ProviderDashboard = () => {
  const { user } = useAuthStore();
  const [dashboardData, setDashboardData] = useState(null);
  const [resources, setResources] = useState([]);
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
      params.granularity = 'AUTO';
    }
    return params;
  }, [timeRange]);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = getFilterParams();

      // Parallel fetch: attempt dashboard API and fetch live resources
      const [dashResult, resList] = await Promise.allSettled([
        dashboardService.getProviderDashboard(params),
        dispatchResourceService.getAll()
      ]);

      if (dashResult.status === 'fulfilled' && dashResult.value) {
        setDashboardData(dashResult.value);
      } else {
        setDashboardData(null);
      }

      if (resList.status === 'fulfilled' && Array.isArray(resList.value)) {
        setResources(resList.value);
      } else {
        setResources([]);
      }
    } catch (err) {
      console.error('Error fetching provider dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu từ máy chủ.');
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
      const blob = await dashboardService.exportProviderDashboard(params);
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `provider-dashboard-${new Date().toISOString().slice(0, 10)}.xlsx`);
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

  // KPIs calculation with graceful aggregation
  const backendKpis = dashboardData?.kpis || {};
  
  // Real fleet stats computed from live resources
  const liveTotalAmbulances = resources.length;
  const liveAvailable = resources.filter(r => r.status === 'AVAILABLE').length;
  const liveBusy = resources.filter(r => ['BUSY', 'ON_MISSION', 'DISPATCHED', 'TRANSPORTING'].includes(r.status)).length;
  const liveMaintenance = resources.filter(r => r.status === 'MAINTENANCE').length;
  const liveOffline = resources.filter(r => r.status === 'OFFLINE' || r.status === 'OUT_OF_SERVICE').length;
  const driversList = resources.filter(r => r.currentDriverName || r.currentDriverId);
  const liveTotalDrivers = driversList.length;

  // Use backend KPIs if provided, otherwise live resources
  const totalAmbulances = backendKpis.totalAmbulances ?? liveTotalAmbulances;
  const availableAmbulances = backendKpis.availableAmbulances ?? liveAvailable;
  const busyAmbulances = backendKpis.busyAmbulances ?? liveBusy;
  const maintenanceAmbulances = backendKpis.maintenanceAmbulances ?? liveMaintenance;
  const totalDrivers = backendKpis.totalDrivers ?? liveTotalDrivers;
  const activeDrivers = backendKpis.activeDrivers ?? liveBusy;
  const completedMissions = backendKpis.completedMissions ?? 0;

  // Fleet utilization percentage
  const utilization = totalAmbulances > 0 
    ? Math.round((busyAmbulances / totalAmbulances) * 100) 
    : 0;

  // Financial Metrics from Backend
  const collectedRevenue = backendKpis.collectedRevenue ?? backendKpis.platformRevenue ?? 0;
  const platformFees = backendKpis.platformFees ?? null;
  const netRevenue = backendKpis.netRevenue ?? null;

  const seriesData = Array.isArray(dashboardData?.series) ? dashboardData.series : [];
  const maxSeries = Math.max(...seriesData.map(s => Math.max(s.missions || 0, s.completed || 0)), 1);

  return (
    <div className="provider-dashboard-v2 text-slate-100 p-3.5 sm:p-6 space-y-4 sm:space-y-6 font-sans">
      
      {/* ── Dashboard Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 border-b border-slate-800 pb-4 sm:pb-5 text-left">
        <div>
          <h1 className="text-lg sm:text-xl font-bold font-sans text-white flex items-center gap-2">
            <Layers className="text-blue-500 shrink-0" size={20} />
            <span>Tổng Quan Vận Hành Đơn Vị</span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 font-sans">
            Giám sát hiệu suất đội xe cấp cứu và đối soát tài chính thời gian thực từ Backend SmartEMS
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
            <span>{isExporting ? 'Đang xuất...' : 'Xuất Báo cáo'}</span>
          </button>

          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex-1 sm:flex-none justify-center flex items-center gap-1.5 px-3 sm:px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-blue-400' : ''} />
            <span>{isLoading ? 'Đang tải...' : 'Làm mới'}</span>
          </button>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:pb-0">
          <Filter size={14} className="text-blue-400 shrink-0" />
          <span className="text-slate-400 font-medium whitespace-nowrap text-[11px] sm:text-xs">Khoảng thời gian:</span>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            {[
              { id: 'TODAY', label: 'Hôm nay' },
              { id: 'WEEK', label: '7 ngày' },
              { id: 'MONTH', label: '30 ngày' },
              { id: 'ALL', label: 'Tất cả' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`px-2 sm:px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  timeRange === tab.id 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="truncate">Đơn vị: <strong className="text-slate-200">{user?.fullName || user?.username || 'Provider Unit'}</strong></span>
        </div>
      </div>

      {/* ── Error Banner ── */}
      {error && (
        <div className="bg-rose-950/60 border border-rose-800/80 p-4 rounded-xl text-xs text-rose-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0" />
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
          <RefreshCw size={36} className="animate-spin text-blue-400 mx-auto mb-3" />
          <p className="text-sm font-medium">Đang đồng bộ dữ liệu vận hành từ hệ thống...</p>
        </div>
      )}

      {/* ── Main Data Display ── */}
      {!isLoading && (
        <>
          {/* ── Operational Fleet & Driver Metrics (Exact KPIs) ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 text-left">
            
            {/* 1. Total Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block truncate">Tổng Đội Xe</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white">{totalAmbulances}</span>
                <Truck size={16} className="text-slate-500 sm:w-5 sm:h-5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono block truncate">
                {liveOffline} xe ngoại tuyến
              </span>
            </div>

            {/* 2. Available Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 block truncate">Xe Sẵn Sàng (Available)</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{availableAmbulances}</span>
                <ShieldCheck size={16} className="text-emerald-500 sm:w-5 sm:h-5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-emerald-400/80 font-mono block truncate">
                Sẵn sàng nhận lệnh
              </span>
            </div>

            {/* 3. Busy Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] sm:text-xs font-semibold text-amber-400 block truncate">Xe Đang Điều Động</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">{busyAmbulances}</span>
                <Activity size={16} className="text-amber-500 sm:w-5 sm:h-5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-amber-400/80 font-mono block truncate">
                Hiệu suất: {utilization}%
              </span>
            </div>

            {/* 4. Maintenance Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] sm:text-xs font-semibold text-red-400 block truncate">Xe Đang Bảo Trì</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-red-400">{maintenanceAmbulances}</span>
                <AlertCircle size={16} className="text-red-500 sm:w-5 sm:h-5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-red-400/80 font-mono block truncate">
                Tạm ngưng phục vụ
              </span>
            </div>

            {/* 5. Total Drivers */}
            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400 block truncate">Tổng Tài Xế Phụ Trách</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-white">{totalDrivers}</span>
                <Users size={16} className="text-slate-500 sm:w-5 sm:h-5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-mono block truncate">
                Gán theo phương tiện
              </span>
            </div>

            {/* 6. Active Drivers */}
            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] sm:text-xs font-semibold text-emerald-400 block truncate">Tài Xế Đang Trên Ca</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-emerald-400">{activeDrivers}</span>
                <Zap size={16} className="text-emerald-500 sm:w-5 sm:h-5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-emerald-400/80 font-mono block truncate">
                Đang trực tuyến
              </span>
            </div>

            {/* 7. Completed Missions */}
            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] sm:text-xs font-semibold text-blue-400 block truncate">Chuyến Hoàn Thành</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-blue-400">{completedMissions}</span>
                <CheckCircle size={16} className="text-blue-500 sm:w-5 sm:h-5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-blue-400/80 font-mono block truncate">
                Đã trả viện thành công
              </span>
            </div>

            {/* 8. Fleet Utilization */}
            <div className="bg-slate-900 border border-slate-800 p-3 sm:p-4 rounded-xl space-y-1 shadow-sm">
              <span className="text-[11px] sm:text-xs font-semibold text-indigo-400 block truncate">Tỷ lệ Sử dụng Xe</span>
              <div className="flex items-center justify-between">
                <span className="text-xl sm:text-2xl font-bold font-mono text-indigo-300">{utilization}%</span>
                <Percent size={16} className="text-indigo-400 sm:w-5 sm:h-5 shrink-0" />
              </div>
              <span className="text-[10px] sm:text-[11px] text-indigo-400/80 font-mono block truncate">
                Fleet Utilization
              </span>
            </div>

          </div>

          {/* ── Section: Doanh thu & Tài chính Đơn vị ── */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl shadow-xl text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Receipt size={18} className="sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>Doanh thu & Đối soát</span>
                    <span className="text-[9px] sm:text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full whitespace-nowrap">
                      FINANCE
                    </span>
                  </h3>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                    Tổng hợp cước phát sinh và công nợ thực tế đồng bộ từ Backend
                  </p>
                </div>
              </div>

              <div className="flex items-baseline justify-between sm:justify-start gap-2 bg-slate-950/60 px-3.5 py-2 rounded-xl border border-slate-800">
                <span className="text-[11px] sm:text-xs text-slate-400 font-medium">Doanh thu ghi nhận:</span>
                <span className="text-base sm:text-xl font-bold font-mono text-emerald-400">
                  {formatVND(collectedRevenue)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-1">
              {/* Collected Revenue */}
              <div className="bg-slate-950/60 border border-emerald-500/20 p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-2">
                <div className="space-y-0.5 min-w-0 pr-1">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">Tổng cước phát sinh</span>
                  <span className="text-[11px] sm:text-xs text-slate-500 truncate block">Từ các cuốc đã điều động</span>
                </div>
                <span className="text-xs sm:text-sm md:text-base font-bold font-mono text-emerald-400 bg-emerald-950/50 px-2 sm:px-2.5 py-1 rounded-lg border border-emerald-800/40 shrink-0 whitespace-nowrap">
                  {formatVND(collectedRevenue)}
                </span>
              </div>

              {/* Platform Fee */}
              <div className="bg-slate-950/60 border border-rose-500/20 p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-2">
                <div className="space-y-0.5 min-w-0 pr-1">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">Phí sàn (Commission)</span>
                  <span className="text-[11px] sm:text-xs text-slate-500 truncate block">Trích nộp cho SmartEMS</span>
                </div>
                <span className="text-xs sm:text-sm md:text-base font-bold font-mono text-rose-400 bg-rose-950/50 px-2 sm:px-2.5 py-1 rounded-lg border border-rose-800/40 shrink-0 whitespace-nowrap">
                  {platformFees !== null ? `-${formatVND(platformFees)}` : 'Chưa có dữ liệu'}
                </span>
              </div>

              {/* Net Revenue */}
              <div className="bg-slate-950/60 border border-blue-500/20 p-3 sm:p-3.5 rounded-xl flex items-center justify-between gap-2">
                <div className="space-y-0.5 min-w-0 pr-1">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider block truncate">Thực nhận đội xe (Net)</span>
                  <span className="text-[11px] sm:text-xs text-slate-500 truncate block">Doanh thu giữ lại</span>
                </div>
                <span className="text-xs sm:text-sm md:text-base font-bold font-mono text-blue-300 bg-blue-950/50 px-2 sm:px-2.5 py-1 rounded-lg border border-blue-800/40 shrink-0 whitespace-nowrap">
                  {netRevenue !== null ? formatVND(netRevenue) : 'Chưa có dữ liệu'}
                </span>
              </div>
            </div>

            {/* Series Trend Chart if available */}
            {seriesData.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium flex items-center gap-1.5">
                    <BarChart2 size={14} className="text-blue-400" />
                    Biểu đồ Hoạt động Nhiệm vụ Điều xe
                  </span>
                  <div className="flex items-center gap-3 text-[11px] font-mono">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span> Nhiệm vụ</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Hoàn tất</span>
                  </div>
                </div>

                <div className="h-24 flex items-end gap-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 overflow-x-auto">
                  {seriesData.map((item, idx) => {
                    const mHeight = Math.round(((item.missions || 0) / maxSeries) * 100);
                    const cHeight = Math.round(((item.completed || 0) / maxSeries) * 100);
                    const timeLabel = item.bucketStart ? new Date(item.bucketStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : idx;

                    return (
                      <div key={idx} className="flex-1 min-w-[28px] flex flex-col items-center gap-1 h-full justify-end group relative">
                        <div className="w-full flex items-end justify-center gap-0.5 h-full">
                          <div 
                            style={{ height: `${Math.max(mHeight, 4)}%` }} 
                            className="w-2.5 bg-blue-500 rounded-t transition-all group-hover:bg-blue-400"
                          />
                          <div 
                            style={{ height: `${Math.max(cHeight, 4)}%` }} 
                            className="w-2.5 bg-emerald-500 rounded-t transition-all group-hover:bg-emerald-400"
                          />
                        </div>
                        <span className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                          {timeLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

    </div>
  );
};

export default ProviderDashboard;
