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

  // Time filter
  const [timeRange, setTimeRange] = useState('TODAY'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'

  const getFilterParams = useCallback(() => {
    const params = {};
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
    <div className="provider-dashboard-v2 text-slate-100 p-6 space-y-6 font-sans">
      
      {/* ── Dashboard Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-5 text-left">
        <div>
          <h1 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <Layers className="text-blue-500" size={22} />
            Tổng Quan Vận Hành Đơn Vị (Provider Dashboard)
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Giám sát hiệu suất đội xe cấp cứu và đối soát tài chính thời gian thực từ Backend SmartEMS
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-xl text-xs font-semibold transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
            {isExporting ? 'Đang xuất...' : 'Xuất Báo cáo Excel'}
          </button>

          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-blue-400' : ''} />
            {isLoading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-blue-400 shrink-0" />
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
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Đơn vị: <strong className="text-slate-200">{user?.fullName || user?.username || 'Provider Unit'}</strong></span>
        </div>
      </div>

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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            
            {/* 1. Total Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Tổng Đội Xe</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white">{totalAmbulances}</span>
                <Truck size={18} className="text-slate-500" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono block">
                {liveOffline} xe ngoại tuyến
              </span>
            </div>

            {/* 2. Available Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-emerald-400 block">Xe Sẵn Sàng (Available)</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{availableAmbulances}</span>
                <ShieldCheck size={18} className="text-emerald-500" />
              </div>
              <span className="text-[11px] text-emerald-400/80 font-mono block">
                Sẵn sàng nhận lệnh
              </span>
            </div>

            {/* 3. Busy Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-amber-400 block">Xe Đang Điều Động (Busy)</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-amber-400">{busyAmbulances}</span>
                <Activity size={18} className="text-amber-500" />
              </div>
              <span className="text-[11px] text-amber-400/80 font-mono block">
                Hiệu suất: {utilization}%
              </span>
            </div>

            {/* 4. Maintenance Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-red-400 block">Xe Đang Bảo Trì</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-red-400">{maintenanceAmbulances}</span>
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <span className="text-[11px] text-red-400/80 font-mono block">
                Tạm ngưng phục vụ
              </span>
            </div>

            {/* 5. Total Drivers */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Tổng Tài Xế Phụ Trách</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white">{totalDrivers}</span>
                <Users size={18} className="text-slate-500" />
              </div>
              <span className="text-[11px] text-slate-400 font-mono block">
                Gán theo phương tiện
              </span>
            </div>

            {/* 6. Active Drivers */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-emerald-400 block">Tài Xế Đang Trên Ca</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{activeDrivers}</span>
                <Zap size={18} className="text-emerald-500" />
              </div>
              <span className="text-[11px] text-emerald-400/80 font-mono block">
                Đang trực tuyến
              </span>
            </div>

            {/* 7. Completed Missions */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-blue-400 block">Chuyến Hoàn Thành</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-blue-400">{completedMissions}</span>
                <CheckCircle size={18} className="text-blue-500" />
              </div>
              <span className="text-[11px] text-blue-400/80 font-mono block">
                Đã trả viện thành công
              </span>
            </div>

            {/* 8. Fleet Utilization */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-indigo-400 block">Tỷ lệ Sử dụng Đội xe</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-indigo-300">{utilization}%</span>
                <Percent size={18} className="text-indigo-400" />
              </div>
              <span className="text-[11px] text-indigo-400/80 font-mono block">
                Fleet Utilization
              </span>
            </div>

          </div>

          {/* ── Section: Doanh thu & Tài chính Đơn vị ── */}
          <div className="bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl text-left space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    Doanh thu & Đối soát Đơn vị
                    <span className="text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full">
                      FINANCE SETTLEMENT
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tổng hợp cước phát sinh và công nợ thực tế đồng bộ từ Backend
                  </p>
                </div>
              </div>

              <div className="flex items-baseline gap-2 bg-slate-950/60 px-4 py-2 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium">Doanh thu ghi nhận:</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {formatVND(collectedRevenue)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Collected Revenue */}
              <div className="bg-slate-950/60 border border-emerald-500/20 p-3.5 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Tổng cước phát sinh (Gross)</span>
                  <span className="text-xs text-slate-500">Cước từ các cuốc xe đã điều động</span>
                </div>
                <span className="text-base font-bold font-mono text-emerald-400 bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-800/40">
                  {formatVND(collectedRevenue)}
                </span>
              </div>

              {/* Platform Fee */}
              <div className="bg-slate-950/60 border border-rose-500/20 p-3.5 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Phí nền tảng sàn (Commission)</span>
                  <span className="text-xs text-slate-500">Chiết khấu trích nộp cho SmartEMS</span>
                </div>
                <span className="text-base font-bold font-mono text-rose-400 bg-rose-950/50 px-2.5 py-1 rounded-lg border border-rose-800/40">
                  {platformFees !== null ? `-${formatVND(platformFees)}` : 'Chưa có dữ liệu'}
                </span>
              </div>

              {/* Net Revenue */}
              <div className="bg-slate-950/60 border border-blue-500/20 p-3.5 rounded-xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Thực nhận đội xe (Net)</span>
                  <span className="text-xs text-slate-500">Doanh thu giữ lại cho đơn vị</span>
                </div>
                <span className="text-base font-bold font-mono text-blue-300 bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-800/40">
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
