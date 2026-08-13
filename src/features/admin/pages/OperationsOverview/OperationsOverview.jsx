import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, ShieldAlert, Truck, CheckCircle2, Clock, AlertTriangle, RefreshCw, BarChart2, Download
} from 'lucide-react';
import { dispatchRequestService } from '../../../../services/dispatchRequestService';
import { dispatchResourceService } from '../../../../services/dispatchResourceService';
import { dashboardService } from '../../../../services/dashboardService';

const OperationsOverview = () => {
  const [requests, setRequests] = useState([]);
  const [resources, setResources] = useState([]);
  const [dashStats, setDashStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const fetchOverviewData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqData, resData, adminDash] = await Promise.all([
        dispatchRequestService.getAll().catch(() => []),
        dispatchResourceService.getAll().catch(() => []),
        dashboardService.getAdminDashboard().catch(() => null),
      ]);

      setRequests(Array.isArray(reqData) ? reqData : []);
      setResources(Array.isArray(resData) ? resData : []);
      setDashStats(adminDash);
    } catch (err) {
      console.error('Error fetching overview statistics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverviewData();
  }, [fetchOverviewData]);

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const blob = await dashboardService.exportAdminDashboard();
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

  // Request KPI calculations
  const totalRequests = dashStats?.totalRequests ?? requests.length;
  const criticalReqs = requests.filter(r => r.urgencyLevel === 'CRITICAL').length;
  const highReqs = requests.filter(r => r.urgencyLevel === 'HIGH').length;
  const pendingReqs = requests.filter(r => r.status === 'PENDING').length;
  const dispatchedReqs = requests.filter(r => r.status === 'DISPATCHED').length;
  const completedReqs = requests.filter(r => r.status === 'COMPLETED').length;

  // Resource KPI calculations
  const totalResources = dashStats?.totalResources ?? resources.length;
  const availableRes = resources.filter(r => r.status === 'AVAILABLE').length;
  const busyRes = resources.filter(r => r.status === 'BUSY').length;
  const offlineRes = resources.filter(r => r.status === 'OFFLINE').length;
  const maintenanceRes = resources.filter(r => r.status === 'MAINTENANCE').length;

  return (
    <div className="p-6 bg-slate-950 min-h-full text-slate-100 font-sans space-y-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Activity className="text-indigo-400" size={24} />
            Tổng quan vận hành (Operations Overview)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Báo cáo thống kê thời gian thực từ dữ liệu điều phối và tài nguyên hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-semibold transition-all active:scale-95"
          >
            <Download size={14} className={isExporting ? 'animate-bounce' : ''} />
            {isExporting ? 'Đang xuất Excel...' : 'Xuất Báo cáo Excel'}
          </button>

          <button
            onClick={fetchOverviewData}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Cập nhật Dữ liệu
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Total Requests Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Tổng Dispatch Requests</span>
            <ShieldAlert size={18} className="text-red-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {isLoading ? '...' : totalRequests}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-2 font-mono">
            <span className="text-red-400">{criticalReqs} CRITICAL</span>
            <span>•</span>
            <span className="text-amber-400">{highReqs} HIGH</span>
          </div>
        </div>

        {/* Pending Requests Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Yêu cầu đang chờ (PENDING)</span>
            <Clock size={18} className="text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400 font-mono">
            {isLoading ? '...' : pendingReqs}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Đã phát lệnh: <strong className="text-indigo-400">{dispatchedReqs}</strong>
          </div>
        </div>

        {/* Available Resources Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Xe có sẵn (AVAILABLE)</span>
            <Truck size={18} className="text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">
            {isLoading ? '...' : availableRes} / {totalResources}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            Sẵn sàng nhận nhiệm vụ
          </div>
        </div>

        {/* Busy / Offline Resources Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Xe Bận / Tắt máy</span>
            <AlertTriangle size={18} className="text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-200 font-mono">
            {isLoading ? '...' : busyRes + offlineRes + maintenanceRes}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {busyRes} BUSY • {offlineRes} OFFLINE • {maintenanceRes} MAINTENANCE
          </div>
        </div>

      </div>

      {/* Breakdown Tables / Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Request Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <BarChart2 size={16} className="text-red-400" />
            Phân loại Yêu cầu Cấp cứu (Requests Breakdown)
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-red-400 font-bold">Mức độ Cực kỳ Khẩn cấp (CRITICAL)</span>
              <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/30">
                {criticalReqs}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-amber-400 font-bold">Mức độ Khẩn cấp Cao (HIGH)</span>
              <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                {highReqs}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-yellow-400">Mức độ Trung bình (MEDIUM)</span>
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                {requests.filter(r => r.urgencyLevel === 'MEDIUM').length}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Mức độ Thấp (LOW)</span>
              <span className="bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded">
                {requests.filter(r => r.urgencyLevel === 'LOW').length}
              </span>
            </div>
          </div>
        </div>

        {/* Resource Status Breakdown */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Truck size={16} className="text-indigo-400" />
            Trạng thái Tài nguyên Xe (Resource Status Breakdown)
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-emerald-400 font-bold">AVAILABLE (Sẵn sàng)</span>
              <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                {availableRes}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-amber-400 font-bold">BUSY (Đang bận nhiệm vụ)</span>
              <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30">
                {busyRes}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">OFFLINE (Tắt máy / Tạm nghỉ)</span>
              <span className="bg-slate-500/20 text-slate-400 px-2 py-0.5 rounded">
                {offlineRes}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded border border-slate-800">
              <span className="text-rose-400">MAINTENANCE (Bảo trì kỹ thuật)</span>
              <span className="bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30">
                {maintenanceRes}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default OperationsOverview;
