import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
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
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { dashboardService } from '../../../../services/dashboardService';
import './ProviderDashboard.css';

const ProviderDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardService.getProviderDashboard();
      setDashboardData(data || null);
    } catch (err) {
      console.error('Error fetching provider dashboard data:', err);
      setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu Dashboard từ máy chủ.');
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const blob = await dashboardService.exportProviderDashboard();
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

  // Format currency helper (VND or formatted number)
  const formatCurrency = (val) => {
    if (val === null || val === undefined) return '0 ₫';
    return Number(val).toLocaleString('vi-VN') + ' ₫';
  };

  const kpis = dashboardData?.kpis || {};
  const series = dashboardData?.series || [];
  const details = Array.isArray(dashboardData?.details) 
    ? dashboardData.details 
    : (dashboardData?.details?.missions || dashboardData?.details?.transactions || []);

  return (
    <div className="provider-dashboard-v2 text-slate-100 p-6 space-y-6 font-sans">
      
      {/* ── Dashboard Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-5 text-left">
        <div>
          <h1 className="text-xl font-bold font-sans text-white flex items-center gap-2">
            <Layers className="text-emerald-500" size={22} />
            Tổng Quan Vận Hành Đơn Vị (Provider Dashboard)
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Giám sát hiệu suất và tình trạng đội xe cấp cứu thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
            {isLoading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {isLoading && (
        <div className="py-16 text-center text-slate-400 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <RefreshCw size={36} className="animate-spin text-emerald-400 mx-auto mb-3" />
          <p className="text-sm font-medium">Đang tải dữ liệu vận hành từ hệ thống...</p>
        </div>
      )}

      {/* ── Error State ── */}
      {!isLoading && error && (
        <div className="p-6 bg-red-950/40 border border-red-800/60 rounded-2xl text-left flex items-start gap-4 shadow-xl">
          <AlertCircle size={24} className="text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <h3 className="text-sm font-bold text-red-300">Không thể tải dữ liệu Dashboard</h3>
            <p className="text-xs text-red-200/80 font-mono">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-2 px-3 py-1.5 bg-red-900/80 hover:bg-red-800 text-red-100 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              Thử lại
            </button>
          </div>
        </div>
      )}

      {/* ── Data Display ── */}
      {!isLoading && !error && (
        <>
          {/* ── Operational Fleet & Driver Metrics (Exact 8 Backend KPIs) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            
            {/* 1. Total Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Tổng Đội Xe</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white">{kpis.totalAmbulances ?? 0}</span>
                <Truck size={18} className="text-slate-500" />
              </div>
            </div>

            {/* 2. Available Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-emerald-400 block">Xe Sẵn Sàng</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{kpis.availableAmbulances ?? 0}</span>
                <ShieldCheck size={18} className="text-emerald-500" />
              </div>
            </div>

            {/* 3. Busy Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-amber-400 block">Xe Đang Điều Động</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-amber-400">{kpis.busyAmbulances ?? 0}</span>
                <Activity size={18} className="text-amber-500" />
              </div>
            </div>

            {/* 4. Maintenance Ambulances */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-red-400 block">Xe Đang Bảo Trì</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-red-400">{kpis.maintenanceAmbulances ?? 0}</span>
                <AlertCircle size={18} className="text-red-500" />
              </div>
            </div>

            {/* 5. Total Drivers */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-slate-400 block">Tổng Tài Xế</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-white">{kpis.totalDrivers ?? 0}</span>
                <Users size={18} className="text-slate-500" />
              </div>
            </div>

            {/* 6. Active Drivers */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-emerald-400 block">Tài Xế Đang Trực</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-emerald-400">{kpis.activeDrivers ?? kpis.totalDrivers ?? 0}</span>
                <Users size={18} className="text-emerald-500" />
              </div>
            </div>

            {/* 7. Completed Missions */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-blue-400 block">Chuyến Hoàn Thành</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-blue-400">{kpis.completedMissions ?? 0}</span>
                <CheckCircle size={18} className="text-blue-500" />
              </div>
            </div>

            {/* 8. Fleet Utilization */}
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-sm">
              <span className="text-xs font-semibold text-indigo-400 block">Hiệu Suất Đội Xe</span>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold font-mono text-indigo-300">
                  {kpis.fleetUtilization != null ? `${Number(kpis.fleetUtilization).toFixed(1)}%` : '0%'}
                </span>
                <Percent size={18} className="text-indigo-400" />
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default ProviderDashboard;
