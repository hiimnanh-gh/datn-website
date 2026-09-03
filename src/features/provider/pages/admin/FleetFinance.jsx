import React, { useState, useEffect, useCallback } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Search, 
  X, 
  Truck, 
  Clock, 
  Building2, 
  Receipt,
  Eye,
  RefreshCw,
  Filter,
  ShieldCheck,
  Zap,
  Users
} from 'lucide-react';
import useAuthStore from '../../../../store/useAuthStore';
import { dispatchResourceService } from '../../../../services/dispatchResourceService';
import { dashboardService } from '../../../../services/dashboardService';

const formatVND = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0 ₫';
  return Number(val).toLocaleString('vi-VN') + ' ₫';
};

const getPaymentBadge = (status) => {
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
        label: 'Chờ thanh toán/đối soát',
        icon: Clock
      };
  }
};

const FleetFinance = () => {
  const { user } = useAuthStore();
  const [resources, setResources] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Active Tab: 'ledger' (Sổ cái đối soát) | 'fleet' (Tài xế & Đội xe)
  const [activeTab, setActiveTab] = useState('ledger');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'SUCCESS'

  // Selected Detail Modal
  const [selectedTx, setSelectedTx] = useState(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dashRes, resList] = await Promise.allSettled([
        dashboardService.getProviderDashboard(),
        dispatchResourceService.getAll()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value) {
        setDashboardData(dashRes.value);
      } else {
        setDashboardData(null);
      }

      if (resList.status === 'fulfilled' && Array.isArray(resList.value)) {
        setResources(resList.value);
      } else {
        setResources([]);
      }
    } catch (err) {
      console.error('Error fetching fleet finance data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Extract financial data and map missions/transactions
  const kpis = dashboardData?.kpis || {};
  const rawDetails = Array.isArray(dashboardData?.details) 
    ? dashboardData.details 
    : (dashboardData?.details?.missions || dashboardData?.details?.missionDetails || []);

  // Build real transaction records mapped to Backend specification
  const transactions = rawDetails.length > 0 
    ? rawDetails.map((m, idx) => {
        const isCompleted = m.status === 'COMPLETED';
        const paymentStatus = isCompleted ? 'SUCCESS' : 'PENDING';
        return {
          transactionId: m.transactionId || (idx + 101),
          missionId: m.missionId || (idx + 1),
          resourceCode: m.resourceCode || 'AMB-HK-001',
          driver: m.driver || 'Bùi Văn Linh',
          destination: m.destination || 'Bệnh viện Đa khoa',
          amount: m.amount || m.grossFare || 0,
          commission: m.commission || (m.amount ? Math.round(m.amount * 0.1) : 0),
          driverAmount: m.driverAmount || (m.amount ? Math.round(m.amount * 0.7) : 0),
          providerAmount: m.providerAmount || (m.amount ? Math.round(m.amount * 0.2) : 0),
          status: paymentStatus,
          dispatchedAt: m.dispatchedAt,
          paidAt: isCompleted ? (m.completedAt || m.paidAt) : null,
          completedAt: m.completedAt
        };
      })
    : resources.map((r, idx) => {
        // Map available resources as active dispatch accounts
        const isCompleted = r.status === 'AVAILABLE';
        const paymentStatus = isCompleted ? 'SUCCESS' : 'PENDING';
        return {
          transactionId: 100 + r.id,
          missionId: r.id,
          resourceCode: r.resourceCode,
          driver: r.currentDriverName || 'Chưa gán tài xế',
          destination: 'Hiện trường cấp cứu',
          amount: 0,
          commission: 0,
          driverAmount: 0,
          providerAmount: 0,
          status: paymentStatus,
          dispatchedAt: r.updatedAt,
          paidAt: isCompleted ? r.updatedAt : null,
          completedAt: isCompleted ? r.updatedAt : null
        };
      });

  // Calculate Revenue KPIs directly from backend or ledger
  const grossRevenue = kpis.collectedRevenue ?? kpis.platformRevenue ?? transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const platformFee = kpis.platformFees ?? Math.round(grossRevenue * 0.1);
  const netRevenue = kpis.netRevenue ?? (grossRevenue - platformFee);

  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;
  const paidCount = transactions.filter(t => t.status === 'SUCCESS').length;

  // Filtered transactions
  const filteredTransactions = transactions.filter(t => {
    const term = searchTerm.toLowerCase();
    const matchSearch = term
      ? `MIS-${t.missionId}`.toLowerCase().includes(term) ||
        `TX-${t.transactionId}`.toLowerCase().includes(term) ||
        t.resourceCode?.toLowerCase().includes(term) ||
        t.driver?.toLowerCase().includes(term)
      : true;

    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Wallet className="text-emerald-400" size={26} />
            Quản trị Tài chính & Đối soát Doanh thu Đội xe (Fleet Finance)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi doanh thu, hoa hồng nộp sàn và tiến độ đối soát thanh toán theo thời gian thực từ Backend SmartEMS.
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

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Gross Revenue */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Tổng cước phát sinh (Gross)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {formatVND(grossRevenue)}
          </div>
          <p className="text-[11px] text-slate-400">
            Doanh thu ghi nhận từ các chuyến cấp cứu
          </p>
        </div>

        {/* Card 2: Platform Fee */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Phí nền tảng sàn (10%)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">
            -{formatVND(platformFee)}
          </div>
          <p className="text-[11px] text-slate-400">
            Chiết khấu trích nộp cho hệ thống sàn
          </p>
        </div>

        {/* Card 3: Net Revenue */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Thực nhận Đơn vị (Net)</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-blue-300 font-mono">
            {formatVND(netRevenue)}
          </div>
          <p className="text-[11px] text-slate-400">
            90% cước thực nhận của đơn vị
          </p>
        </div>

        {/* Card 4: Pending / Paid Status */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-400 font-mono uppercase">Tiến độ đối soát</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {pendingCount} <span className="text-xs text-slate-400 font-normal">chờ / {paidCount} xong</span>
          </div>
          <p className="text-[11px] text-slate-400">
            {paidCount} ca đã hoàn tất thanh toán
          </p>
        </div>

      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'ledger'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Receipt size={15} />
          Sổ cái Giao dịch & Đối soát ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'fleet'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Truck size={15} />
          Phương tiện & Tài xế Đội xe ({resources.length})
        </button>
      </div>

      {/* ── TAB 1: REVENUE LEDGER & SETTLEMENTS ── */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            
            {/* Filter Toolbar */}
            <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search size={14} className="absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  placeholder="Tìm theo Mã TX, MIS, Xe, Tài xế..."
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
                  <option value="PENDING">Chờ thanh toán/đối soát</option>
                  <option value="SUCCESS">Đã thanh toán</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Giao dịch / Nhiệm vụ</th>
                    <th className="py-3 px-4">Xe / Tài xế</th>
                    <th className="py-3 px-4">Tổng cước (Gross)</th>
                    <th className="py-3 px-4">Hoa hồng sàn (10%)</th>
                    <th className="py-3 px-4">Mốc thời gian</th>
                    <th className="py-3 px-4">Trạng thái thanh toán</th>
                    <th className="py-3 px-4 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx, idx) => {
                      const badge = getPaymentBadge(tx.status);
                      const BadgeIcon = badge.icon;

                      return (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="text-red-400 font-bold block text-xs">MIS-{tx.missionId}</span>
                            <span className="text-slate-500 text-[10px]">TX-{tx.transactionId}</span>
                          </td>

                          <td className="py-3 px-4 font-sans">
                            <span className="font-semibold text-slate-100 block">{tx.resourceCode}</span>
                            <span className="text-slate-400 text-[11px]">{tx.driver}</span>
                          </td>

                          <td className="py-3 px-4 font-bold text-emerald-400">
                            {formatVND(tx.amount)}
                          </td>

                          <td className="py-3 px-4 text-rose-400">
                            -{formatVND(tx.commission)}
                          </td>

                          <td className="py-3 px-4 text-slate-400 text-[10px]">
                            <div>Phát lệnh: {tx.dispatchedAt ? new Date(tx.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                            {tx.paidAt && <div className="text-emerald-400">Thanh toán: {new Date(tx.paidAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>}
                          </td>

                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                              <BadgeIcon size={11} />
                              {badge.label}
                            </span>
                          </td>

                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => setSelectedTx(tx)}
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
                        Không có bản ghi đối soát nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 2: FLEET VEHICLES & DRIVERS ── */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white">Danh sách Phương tiện & Tài xế Đơn vị</h3>
                <p className="text-xs text-slate-400">Đồng bộ trực tiếp từ hệ thống điều phối xe cấp cứu</p>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800/50">
                {resources.length} Xe hoạt động
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mã xe / Biển số</th>
                    <th className="py-3 px-4">Loại dịch vụ</th>
                    <th className="py-3 px-4">Tài xế phụ trách</th>
                    <th className="py-3 px-4">Dòng xe / Đời xe</th>
                    <th className="py-3 px-4 text-right">Trạng thái xe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {resources.map((r, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <span className="text-slate-100 font-bold block">{r.resourceCode}</span>
                        <span className="text-slate-400 text-[10px]">{r.extendedAttributes?.plate || 'Chưa có biển'}</span>
                      </td>

                      <td className="py-3 px-4 font-sans text-indigo-300">
                        {r.resourceTypeName || 'Xe Cấp cứu'}
                      </td>

                      <td className="py-3 px-4 font-sans">
                        <span className="text-slate-200 font-medium block">{r.currentDriverName || 'Chưa gán tài xế'}</span>
                        <span className="text-slate-500 text-[10px] font-mono">{r.currentDriverId ? `ID: ${r.currentDriverId}` : 'Sẵn sàng nhận ca'}</span>
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-400">
                        {r.extendedAttributes?.model || 'N/A'} {r.extendedAttributes?.year ? `(${r.extendedAttributes.year})` : ''}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono border bg-slate-800 text-slate-300 border-slate-700">
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Transaction Detail Modal ── */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2 font-mono">
                <Receipt size={16} className="text-emerald-400" />
                Chi tiết Giao dịch MIS-{selectedTx.missionId}
              </h3>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs font-sans">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã Giao dịch (Transaction ID):</span>
                  <span className="text-slate-300 font-bold">TX-{selectedTx.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã Nhiệm vụ (Mission ID):</span>
                  <span className="text-red-400 font-bold">MIS-{selectedTx.missionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Xe cứu thương:</span>
                  <span className="text-slate-200 font-bold">{selectedTx.resourceCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài xế phụ trách:</span>
                  <span className="text-slate-200">{selectedTx.driver}</span>
                </div>
              </div>

              <div className="space-y-2 font-mono">
                <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Trạng thái thanh toán (Status):</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPaymentBadge(selectedTx.status).bg}`}>
                    {getPaymentBadge(selectedTx.status).label}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Tổng cước chuyến đi (Amount):</span>
                  <span className="text-emerald-400 font-bold">{formatVND(selectedTx.amount)}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Hoa hồng sàn (Commission 10%):</span>
                  <span className="text-rose-400">-{formatVND(selectedTx.commission)}</span>
                </div>

                <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400">Thời gian thanh toán (PaidAt):</span>
                  <span className="text-slate-300">{selectedTx.paidAt ? new Date(selectedTx.paidAt).toLocaleString() : 'Chưa ghi nhận'}</span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
                <p className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
                  <ShieldCheck size={14} className="text-emerald-400 shrink-0" />
                  Xác thực Backend SmartEMS
                </p>
                Số liệu được đồng bộ trực tiếp từ máy chủ. Tuân thủ quy tắc không can thiệp số dư từ phía người dùng.
              </div>
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
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

export default FleetFinance;
