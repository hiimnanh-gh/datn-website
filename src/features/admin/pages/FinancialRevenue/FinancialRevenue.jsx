import React, { useState, useEffect, useCallback } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  Building2, 
  RefreshCw, 
  Search, 
  Clock, 
  CheckCircle2, 
  ShieldCheck,
  Receipt,
  Filter,
  X,
  Truck
} from 'lucide-react';
import { dashboardService } from '../../../../services/dashboardService';
import { providerService } from '../../../../services/providerService';

const formatVND = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

const getPaymentStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'SUCCESS':
    case 'COMPLETED':
    case 'PAID':
      return {
        bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80',
        label: 'Đã thanh toán',
        icon: CheckCircle2
      };
    case 'PENDING':
    default:
      return {
        bg: 'bg-amber-950/60 text-amber-400 border-amber-800/80',
        label: 'Chờ thanh toán / đối soát',
        icon: Clock
      };
  }
};

const FinancialRevenue = () => {
  const [dashData, setDashData] = useState(null);
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'transactions'
  
  // Filters
  const [selectedProviderId, setSelectedProviderId] = useState('');
  const [timeRange, setTimeRange] = useState('TODAY'); // 'TODAY' | 'WEEK' | 'MONTH' | 'ALL'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'SUCCESS'
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Detail Modal
  const [selectedDetail, setSelectedDetail] = useState(null);

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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = getFilterParams();
      const [dashRes, provRes] = await Promise.all([
        dashboardService.getAdminDashboard(params).catch(() => null),
        providerService.getAll().catch(() => [])
      ]);

      setDashData(dashRes);
      setProviders(Array.isArray(provRes) ? provRes : []);
    } catch (err) {
      console.error('Error fetching financial dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, [getFilterParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract real metrics
  const kpis = dashData?.kpis || {};
  const platformRevenue = kpis.platformRevenue ?? 0;
  const totalMissions = kpis.totalMissions ?? 0;
  const missionSuccessRate = kpis.missionSuccessRate ?? 0;
  
  const providerPerformance = dashData?.details?.providerPerformance || [];
  const rawMissionDetails = dashData?.details?.missionDetails || [];
  const rawRevenueLedger = dashData?.details?.revenueLedger || [];

  // Map real financial transactions from Backend revenueLedger (NOT from mission details)
  const transactions = rawRevenueLedger.map((tx) => {
    const mission = rawMissionDetails.find(m => m.missionId === tx.missionId);
    return {
      id: tx.transactionId ?? null,
      transactionId: tx.transactionId ?? null,
      missionId: tx.missionId,
      amount: tx.amount != null ? tx.amount : null,
      commission: tx.commission != null ? tx.commission : null,
      paymentStatus: tx.status || 'PENDING',
      paidAt: tx.paidAt || null,
      paymentMethod: tx.paymentMethod || null,
      resourceCode: mission?.resourceCode || 'N/A',
      driver: mission?.driver || 'Chưa gán',
      destination: mission?.destination || 'Hiện trường',
      urgency: mission?.urgency || 'NORMAL',
      missionStatus: mission?.status || 'N/A',
      dispatchedAt: mission?.dispatchedAt || null,
      completedAt: mission?.completedAt || null,
      providerName: providers.find(p => p.id === Number(selectedProviderId))?.providerName || 'Đơn vị liên kết'
    };
  });

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = searchTerm
      ? (t.missionId ? `MIS-${t.missionId}` : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.transactionId ? `TX-${t.transactionId}` : '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.resourceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.driver.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesStatus = statusFilter === 'ALL' || t.paymentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Counters strictly calculated from Backend paymentStatus
  const pendingTransactionsCount = transactions.filter(t => t.paymentStatus === 'PENDING').length;
  const successTransactionsCount = transactions.filter(t => t.paymentStatus === 'SUCCESS' || t.paymentStatus === 'PAID').length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <DollarSign className="text-emerald-400" size={26} />
            Quản trị Tài chính & Doanh thu Sàn (Financial & Revenue)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dữ liệu đối soát tài chính thực tế đồng bộ từ máy chủ SmartEMS Backend.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>
        </div>
      </div>

      {/* ── Filters Toolbar ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={14} className="text-indigo-400 shrink-0" />
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
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Provider Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Building2 size={14} className="text-slate-500" />
          <select
            value={selectedProviderId}
            onChange={(e) => setSelectedProviderId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
          >
            <option value="">Tất cả Đơn vị Provider</option>
            {providers.map(p => (
              <option key={p.id} value={p.id}>
                {p.providerName || p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Platform Revenue Card */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4.5 space-y-2 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">Doanh thu Nền tảng (Platform)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            {isLoading ? '...' : formatVND(platformRevenue)}
          </div>
          <p className="text-[11px] text-slate-400">
            Tổng doanh thu thực nhận ghi nhận từ Backend
          </p>
        </div>

        {/* Total Missions Monitored */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Nhiệm vụ Điều xe</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Truck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {isLoading ? '...' : totalMissions} <span className="text-xs text-slate-400 font-normal">chuyến</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Tỷ lệ hoàn tất: <strong className="text-emerald-400">{missionSuccessRate}%</strong>
          </p>
        </div>

        {/* Chờ thanh toán / đối soát */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 font-mono uppercase">Chờ thanh toán (Pending)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {isLoading ? '...' : pendingTransactionsCount} <span className="text-xs text-slate-400 font-normal">ca</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Các ca đang vận hành hoặc chờ đối soát
          </p>
        </div>

        {/* Đã thanh toán / hoàn tất */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-blue-400 font-mono uppercase">Đã thanh toán (Success)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-400 font-mono">
            {isLoading ? '...' : successTransactionsCount} <span className="text-xs text-slate-400 font-normal">ca</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Các ca đã hoàn thành nhiệm vụ cấp cứu
          </p>
        </div>

      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building2 size={15} />
          Hiệu suất Đơn vị Provider ({providerPerformance.length})
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Receipt size={15} />
          Danh sách Nhiệm vụ & Đối soát ({transactions.length})
        </button>
      </div>

      {/* ── TAB 1: PROVIDER PERFORMANCE ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Hiệu suất vận hành theo Đơn vị Provider</h3>
                <p className="text-xs text-slate-400">Thống kê số lượng chuyến và tiến độ hoàn thành</p>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/50">
                {providerPerformance.length} Đơn vị ghi nhận
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Mã / Đơn vị Provider</th>
                    <th className="py-3.5 px-4 text-center">Tổng ca điều phối</th>
                    <th className="py-3.5 px-4 text-center text-emerald-400">Ca hoàn tất</th>
                    <th className="py-3.5 px-4 text-right">Tỷ lệ hoàn thành</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {providerPerformance.length > 0 ? (
                    providerPerformance.map((p, idx) => {
                      const rate = p.missions > 0 ? Math.round((p.completed / p.missions) * 100) : 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-100 font-sans text-sm">{p.providerName}</div>
                            <div className="text-slate-500 text-[11px]">ID: {p.providerId}</div>
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-200 text-sm font-bold">{p.missions}</td>
                          <td className="py-3.5 px-4 text-center text-emerald-400 text-sm font-bold">{p.completed}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                              {rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-500 text-xs">
                        Chưa có dữ liệu hiệu suất của Provider nào trong mốc thời gian đã chọn.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TRANSACTIONS & SETTLEMENTS ── */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Table Search & Status Filter Toolbar */}
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã MIS, Xe, Tài xế..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-medium">Trạng thái:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ thanh toán / đối soát</option>
                  <option value="SUCCESS">Đã thanh toán</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mã GD / Ca</th>
                    <th className="py-3 px-4">Tài xế / Xe</th>
                    <th className="py-3 px-4 text-right">Tổng tiền</th>
                    <th className="py-3 px-4 text-right">Hoa hồng sàn</th>
                    <th className="py-3 px-4">Thời gian thanh toán</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx, idx) => {
                      const badge = getPaymentStatusBadge(tx.paymentStatus);
                      const BadgeIcon = badge.icon;

                      return (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <div className="text-emerald-400 font-bold text-xs">{tx.transactionId ? `TX-${tx.transactionId}` : 'N/A'}</div>
                            {tx.missionId && <div className="text-slate-500 text-[10px]">MIS-{tx.missionId}</div>}
                          </td>

                          <td className="py-3 px-4 font-sans">
                            <span className="font-semibold text-slate-100 block">{tx.resourceCode}</span>
                            <span className="text-slate-400 text-[11px]">{tx.driver}</span>
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-slate-100">
                            {tx.amount != null ? formatVND(tx.amount) : <span className="text-slate-500 font-normal">Chưa có dữ liệu</span>}
                          </td>

                          <td className="py-3 px-4 text-right font-bold text-emerald-400">
                            {tx.commission != null ? formatVND(tx.commission) : <span className="text-slate-500 font-normal">Chưa có dữ liệu</span>}
                          </td>

                          <td className="py-3 px-4 text-slate-300 text-[11px]">
                            {tx.paidAt ? (
                              <span className="text-emerald-400">{new Date(tx.paidAt).toLocaleString([], { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                            ) : (
                              <span className="text-slate-500 italic">Chưa thanh toán</span>
                            )}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                              <BadgeIcon size={11} />
                              {badge.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedDetail(tx)}
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
                      <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                        Chưa có giao dịch đối soát nào ghi nhận từ hệ thống.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Transaction Detail Modal ── */}
      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 font-mono">
                <Receipt size={16} className="text-emerald-400" />
                Chi tiết giao dịch {selectedDetail.transactionId ? `TX-${selectedDetail.transactionId}` : 'N/A'}
              </h3>
              <button
                onClick={() => setSelectedDetail(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã Giao dịch:</span>
                  <span className="text-emerald-400 font-bold">{selectedDetail.transactionId ? `TX-${selectedDetail.transactionId}` : 'N/A'}</span>
                </div>
                {selectedDetail.missionId && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mã Nhiệm vụ:</span>
                    <span className="text-red-400 font-bold">MIS-{selectedDetail.missionId}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã Xe cứu thương:</span>
                  <span className="text-slate-200 font-bold">{selectedDetail.resourceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài xế tiếp nhận:</span>
                  <span className="text-slate-200">{selectedDetail.driver}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Điểm đến / Bệnh viện:</span>
                  <span className="text-indigo-300 truncate max-w-[200px]">{selectedDetail.destination}</span>
                </div>
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Tổng tiền giao dịch:</span>
                  <span className="text-white font-bold text-sm">
                    {selectedDetail.amount != null ? formatVND(selectedDetail.amount) : 'Chưa có dữ liệu'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Hoa hồng sàn:</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedDetail.commission != null ? formatVND(selectedDetail.commission) : 'Chưa có dữ liệu'}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Trạng thái thanh toán:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPaymentStatusBadge(selectedDetail.paymentStatus).bg}`}>
                    {getPaymentStatusBadge(selectedDetail.paymentStatus).label}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Thời gian thanh toán (paidAt):</span>
                  <span className={selectedDetail.paidAt ? 'text-emerald-400' : 'text-slate-500 italic'}>
                    {selectedDetail.paidAt ? new Date(selectedDetail.paidAt).toLocaleString() : 'Chưa thanh toán'}
                  </span>
                </div>

                {selectedDetail.dispatchedAt && (
                  <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400">Thời gian phát lệnh điều xe:</span>
                    <span className="text-slate-300">{new Date(selectedDetail.dispatchedAt).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <p className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  Xác thực hệ thống
                </p>
                Dữ liệu giao dịch được xác thực trực tiếp từ hệ thống Backend SmartEMS. Không can thiệp số dư trên giao diện máy khách.
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedDetail(null)}
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

export default FinancialRevenue;
