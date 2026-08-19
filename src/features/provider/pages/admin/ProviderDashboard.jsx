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
          <h1 className="text-2xl font-bold tracking-wider font-mono text-white uppercase flex items-center gap-2">
            <Layers className="text-emerald-500" size={24} />
            Tổng Quan Vận Hành Đơn Vị (Provider Dashboard)
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase font-mono tracking-widest">
            Trung tâm đối soát & giám sát hiệu suất đội xe cấp cứu thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors font-mono disabled:opacity-50"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
            {isLoading ? 'Đang tải...' : 'Làm mới'}
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors font-mono shadow-lg shadow-emerald-900/40 disabled:opacity-70"
          >
            <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
            {isExporting ? 'Đang xuất...' : 'Xuất Báo cáo Excel'}
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
          {/* ── Financial & Revenue Summary (Backend KPIs) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            
            {/* Collected Revenue */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
              <div>
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Tổng Doanh Thu</span>
                <span className="text-[10px] text-slate-500 block font-mono">collectedRevenue</span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-emerald-400 tracking-tight">
                  {formatCurrency(kpis.collectedRevenue)}
                </span>
              </div>
            </div>

            {/* Platform Fees */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
              <div>
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Phí Sàn Điều Phối</span>
                <span className="text-[10px] text-slate-500 block font-mono">platformFees</span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-amber-400 tracking-tight">
                  {formatCurrency(kpis.platformFees)}
                </span>
              </div>
            </div>

            {/* Net Revenue */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-xl" />
              <div>
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Doanh Thu Thực Nhận</span>
                <span className="text-[10px] text-slate-500 block font-mono">netRevenue</span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-blue-400 tracking-tight">
                  {formatCurrency(kpis.netRevenue)}
                </span>
              </div>
            </div>

            {/* Pending Settlement */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
              <div>
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">Chờ Quyết Toán</span>
                <span className="text-[10px] text-slate-500 block font-mono">pendingSettlement</span>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold font-mono text-indigo-300 tracking-tight">
                  {formatCurrency(kpis.pendingSettlement)}
                </span>
              </div>
            </div>

          </div>

          {/* ── Operational Fleet & Mission Metrics (Backend KPIs) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-left">
            
            {/* Total Ambulances */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Tổng Đội Xe</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold font-mono text-white">{kpis.totalAmbulances ?? 0}</span>
                <Truck size={16} className="text-slate-500" />
              </div>
              <span className="text-[9px] text-slate-500 font-mono">totalAmbulances</span>
            </div>

            {/* Available Ambulances */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold font-mono text-emerald-400 uppercase tracking-wider block">Sẵn Sàng</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold font-mono text-emerald-400">{kpis.availableAmbulances ?? 0}</span>
                <ShieldCheck size={16} className="text-emerald-500" />
              </div>
              <span className="text-[9px] text-slate-500 font-mono">availableAmbulances</span>
            </div>

            {/* Busy Ambulances */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold font-mono text-amber-400 uppercase tracking-wider block">Đang Làm Nhiệm Vụ</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold font-mono text-amber-400">{kpis.busyAmbulances ?? 0}</span>
                <Activity size={16} className="text-amber-500" />
              </div>
              <span className="text-[9px] text-slate-500 font-mono">busyAmbulances</span>
            </div>

            {/* Maintenance Ambulances */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold font-mono text-red-400 uppercase tracking-wider block">Bảo Trì / Sửa Chữa</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold font-mono text-red-400">{kpis.maintenanceAmbulances ?? 0}</span>
                <AlertCircle size={16} className="text-red-500" />
              </div>
              <span className="text-[9px] text-slate-500 font-mono">maintenanceAmbulances</span>
            </div>

            {/* Completed Missions */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold font-mono text-blue-400 uppercase tracking-wider block">Chuyến Hoàn Thành</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold font-mono text-blue-400">{kpis.completedMissions ?? 0}</span>
                <CheckCircle size={16} className="text-blue-500" />
              </div>
              <span className="text-[9px] text-slate-500 font-mono">completedMissions</span>
            </div>

            {/* Fleet Utilization */}
            <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-1">
              <span className="text-[10px] font-bold font-mono text-purple-400 uppercase tracking-wider block">Hiệu Suất Xe</span>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold font-mono text-purple-400">
                  {kpis.fleetUtilization != null ? `${Number(kpis.fleetUtilization).toFixed(1)}%` : '0%'}
                </span>
                <Percent size={16} className="text-purple-500" />
              </div>
              <span className="text-[9px] text-slate-500 font-mono">fleetUtilization</span>
            </div>

          </div>

          {/* ── Details / Operations Log Table ── */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl text-left">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-xs font-bold font-mono tracking-widest text-slate-200 uppercase flex items-center gap-2">
                  <Clock size={16} className="text-emerald-400" />
                  Nhật Ký Chuyến Xe & Đối Soát Doanh Thu
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">Dữ liệu chuyến xe thực tế từ Backend</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {details.length} bản ghi
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Thời gian</th>
                    <th className="py-3 px-4">Mã Chuyến / Xe</th>
                    <th className="py-3 px-4 text-right">Cước Phí</th>
                    <th className="py-3 px-4 text-right">Phí Sàn</th>
                    <th className="py-3 px-4 text-right">Thực Nhận</th>
                    <th className="py-3 px-4 text-center">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {details.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <FileSpreadsheet size={32} className="mx-auto mb-2 opacity-40 text-slate-400" />
                        <p className="text-xs font-sans">Chưa có giao dịch / chuyến xe nào được ghi nhận từ hệ thống.</p>
                      </td>
                    </tr>
                  ) : (
                    details.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-4 text-slate-400">
                          {item.timestamp || item.date || item.createdAt || 'N/A'}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-200">
                          {item.missionCode || item.missionId || item.resourceCode || `#${item.id || idx + 1}`}
                        </td>
                        <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                          {formatCurrency(item.collectedRevenue ?? item.fare ?? item.amount)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-amber-400">
                          {formatCurrency(item.platformFees ?? item.fee)}
                        </td>
                        <td className="py-3.5 px-4 text-right text-blue-400 font-bold">
                          {formatCurrency(item.netRevenue ?? item.netProfit ?? (item.fare - item.fee))}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800">
                            {item.status || 'COMPLETED'}
                          </span>
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

export default ProviderDashboard;
