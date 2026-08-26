import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  PlusCircle, 
  FileText, 
  Calculator, 
  Search, 
  QrCode, 
  Check, 
  X, 
  Truck, 
  Clock, 
  CreditCard,
  Building2,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  DollarSign,
  Receipt,
  Eye
} from 'lucide-react';
import useFinanceStore from '../../../../store/useFinanceStore';
import useAuthStore from '../../../../store/useAuthStore';
import { paymentTransactions, providerRevenueSummary, formatVND } from '../../../../mock/paymentMockData';

const FleetFinance = () => {
  const { user } = useAuthStore();
  const { 
    driverWallets, 
    transactions, 
    settings, 
    topUpDriverWallet, 
    calculateFareEstimate 
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'wallets' | 'transactions' | 'calculator'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Payment Feature State
  const [paymentDetailModal, setPaymentDetailModal] = useState(null);
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('ALL');
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');

  // Topup Modal State
  const [topUpModal, setTopUpModal] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState(500000);
  const [topUpMethod, setTopUpMethod] = useState('BANK_TRANSFER');
  const [topUpSuccess, setTopUpSuccess] = useState(false);

  // Invoice Detail Modal State
  const [invoiceModal, setInvoiceModal] = useState(null);

  // Calculator State
  const [calcServiceType, setCalcServiceType] = useState('BLS');
  const [calcDistance, setCalcDistance] = useState(15);
  const [calcHasDoctor, setCalcHasDoctor] = useState(false);
  const [calcHasNurse, setCalcHasNurse] = useState(true);
  const [calcIsNight, setCalcIsNight] = useState(false);

  // Calculated estimates
  const fareEstimate = calculateFareEstimate({
    serviceType: calcServiceType,
    distanceKm: Number(calcDistance) || 0,
    hasDoctor: calcHasDoctor,
    hasNurse: calcHasNurse,
    isNight: calcIsNight,
  });

  // KPI Metrics
  const minThreshold = settings.minWalletBalance || 1000000;
  const totalFleetRevenue = driverWallets.reduce((acc, d) => acc + (d.totalTripRevenue || 0), 0);
  const totalCommissionPaid = driverWallets.reduce((acc, d) => acc + (d.totalCommissionPaid || 0), 0);
  const totalFleetBalance = driverWallets.reduce((acc, d) => acc + (d.balance || 0), 0);
  const lockedDriversCount = driverWallets.filter(d => d.balance < minThreshold).length;

  // Filtered Wallets
  const filteredWallets = driverWallets.filter(d => {
    const matchSearch = d.driverName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        d.resourceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        d.phone.includes(searchTerm);
    const isLocked = d.balance < minThreshold;
    if (filterStatus === 'LOCKED') return matchSearch && isLocked;
    if (filterStatus === 'ELIGIBLE') return matchSearch && !isLocked;
    return matchSearch;
  });

  // Filtered Transactions
  const filteredTransactions = transactions.filter(t => {
    return t.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           t.requestCode?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleExecuteTopUp = (e) => {
    e.preventDefault();
    if (!topUpModal || topUpAmount <= 0) return;

    const success = topUpDriverWallet(topUpModal.id, topUpAmount, topUpMethod);
    if (success) {
      setTopUpSuccess(true);
      setTimeout(() => {
        setTopUpSuccess(false);
        setTopUpModal(null);
      }, 1200);
    }
  };

  return (
    <div className="p-4 sm:p-7 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 p-5 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
            <Wallet size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">
                Tài chính & Quản lý Ví Đội xe
              </h1>
              <span className="text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                PROVIDER FLEET
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi số dư ví ký quỹ tài xế, doanh thu cuốc xe và hoa hồng chiết khấu 10% nộp về sàn SmartEMS.
            </p>
          </div>
        </div>

        {/* Global Policy Badge */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800/90 px-4 py-2.5 rounded-xl text-xs shrink-0 font-mono shadow-inner">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
          <span className="text-slate-400 text-[11px]">Ngưỡng ví tối thiểu:</span>
          <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-xs">
            {minThreshold.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* ── Alert Banner if any drivers are below threshold ── */}
      {lockedDriversCount > 0 && (
        <div className="bg-gradient-to-r from-rose-950/60 via-slate-900/90 to-slate-900/90 border border-rose-800/60 p-4.5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm text-rose-200 shadow-xl shadow-rose-950/20">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-bold text-rose-100 flex items-center gap-2">
                <span>Cảnh báo: Có {lockedDriversCount} tài xế đang bị tạm khóa nhận ca</span>
                <span className="text-[10px] font-mono bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700 font-bold">
                  SỐ DƯ &lt; 1 TRIỆU
                </span>
              </p>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Vui lòng nạp tiền vào ví để kích hoạt lại quyền nhận ca cấp cứu tự động trên Mobile App của tài xế.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('wallets');
              setFilterStatus('LOCKED');
            }}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-1.5"
          >
            <span>Xem danh sách xử lý</span>
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* ── KPI Summary Cards (Redesigned & Spacious) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        
        {/* Card 1: Tổng cước thu từ khách */}
        <div className="group bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-md border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 space-y-3.5 shadow-xl transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Tổng cước khách trả</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-black text-white font-mono tracking-tight flex items-baseline gap-1">
              {totalFleetRevenue.toLocaleString('vi-VN')}
              <span className="text-xs text-emerald-400 font-sans font-medium">VNĐ</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/70 text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium relative z-10">
            <CheckCircle2 size={13} className="shrink-0" />
            <span className="truncate">Tiền mặt / QR khách trả trực tiếp</span>
          </div>
        </div>

        {/* Card 2: Hoa hồng trích nộp sàn (10%) */}
        <div className="group bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-md border border-slate-800 hover:border-rose-500/40 rounded-2xl p-5 space-y-3.5 shadow-xl transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Hoa hồng nộp sàn (10%)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-black text-rose-400 font-mono tracking-tight flex items-baseline gap-1">
              -{totalCommissionPaid.toLocaleString('vi-VN')}
              <span className="text-xs text-rose-400/80 font-sans font-medium">VNĐ</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/70 text-[11px] text-slate-400 flex items-center gap-1.5 relative z-10">
            <Clock size={13} className="shrink-0 text-slate-500" />
            <span className="truncate">Đã trừ trực tiếp từ ví các tài xế</span>
          </div>
        </div>

        {/* Card 3: Doanh thu thực nhận đội xe */}
        <div className="group bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-md border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 space-y-3.5 shadow-xl transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Doanh thu thực nhận</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-black text-blue-300 font-mono tracking-tight flex items-baseline gap-1">
              {(totalFleetRevenue - totalCommissionPaid).toLocaleString('vi-VN')}
              <span className="text-xs text-blue-400 font-sans font-medium">VNĐ</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/70 text-[11px] text-blue-400/90 font-medium flex items-center gap-1.5 relative z-10">
            <Zap size={13} className="shrink-0" />
            <span className="truncate">90% doanh thu giữ lại cho đội xe</span>
          </div>
        </div>

        {/* Card 4: Tổng số dư quỹ ví tài xế */}
        <div className="group bg-slate-900/80 hover:bg-slate-900/95 backdrop-blur-md border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 space-y-3.5 shadow-xl transition-all duration-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex items-center justify-between relative z-10">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Tổng quỹ ví tài xế</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Wallet size={16} />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl font-black text-amber-400 font-mono tracking-tight flex items-baseline gap-1">
              {totalFleetBalance.toLocaleString('vi-VN')}
              <span className="text-xs text-amber-400/80 font-sans font-medium">VNĐ</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] relative z-10">
            <span className="text-slate-400">{driverWallets.length} tài xế trong đội</span>
            {lockedDriversCount > 0 ? (
              <span className="text-rose-400 font-bold font-mono bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-800/50">
                {lockedDriversCount} xe bị khóa
              </span>
            ) : (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> 100% Sẵn sàng
              </span>
            )}
          </div>
        </div>

      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'payments'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Receipt size={15} />
            Thanh toán & Doanh thu ({paymentTransactions.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('wallets');
              setFilterStatus('ALL');
            }}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'wallets'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Wallet size={15} />
            Ví Tài xế ({driverWallets.length})
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'transactions'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText size={15} />
            Nhật ký Khấu trừ Hoa hồng ({transactions.length})
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calculator size={15} />
            Công cụ Tính cước Cấp cứu
          </button>
        </div>
      </div>

      {/* ── TAB 0: THANH TOÁN & DOANH THU (ESTIMATED PAYMENT TRANSACTIONS) ── */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          {/* Revenue Summary Sub-cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Tổng doanh thu dự kiến</span>
                <span className="text-xl font-bold font-mono text-emerald-400 mt-1 block">
                  {formatVND(providerRevenueSummary.estimatedRevenue)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <TrendingUp size={20} />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Chờ thanh toán (Pending)</span>
                <span className="text-xl font-bold font-mono text-amber-400 mt-1 block">
                  {formatVND(providerRevenueSummary.pendingPayment)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock size={20} />
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Đã thanh toán (Paid)</span>
                <span className="text-xl font-bold font-mono text-blue-400 mt-1 block">
                  {formatVND(providerRevenueSummary.paid)}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <CheckCircle2 size={20} />
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm theo Mission ID, loại xe (ALS/BLS)..."
                value={paymentSearchTerm}
                onChange={(e) => setPaymentSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={paymentFilterStatus}
                onChange={(e) => setPaymentFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none w-full sm:w-auto cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="PENDING">Chờ thanh toán</option>
                <option value="SUCCESS">Đã thanh toán</option>
              </select>
            </div>
          </div>

          {/* Payment Transactions Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-5">Mission ID</th>
                    <th className="py-4 px-4">Loại dịch vụ</th>
                    <th className="py-4 px-4">Quãng đường</th>
                    <th className="py-4 px-4">Chi phí</th>
                    <th className="py-4 px-4">Trạng thái</th>
                    <th className="py-4 px-4">Ngày hoàn thành</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {paymentTransactions
                    .filter((p) => {
                      const matchSearch =
                        p.missionId.toLowerCase().includes(paymentSearchTerm.toLowerCase()) ||
                        p.serviceType.toLowerCase().includes(paymentSearchTerm.toLowerCase());
                      if (paymentFilterStatus === 'PENDING') return matchSearch && p.status === 'PENDING';
                      if (paymentFilterStatus === 'SUCCESS') return matchSearch && p.status === 'SUCCESS';
                      return matchSearch;
                    })
                    .map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setPaymentDetailModal(item)}
                        className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="py-3.5 px-5 font-mono font-bold text-indigo-300">
                          {item.missionId}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`font-mono font-bold text-[10px] px-2 py-0.5 rounded border ${
                              item.serviceType === 'ALS'
                                ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                                : 'bg-blue-950/80 text-blue-300 border-blue-800/60'
                            }`}
                          >
                            {item.serviceType}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-300">
                          {item.distanceKm.toFixed(1).replace('.', ',')} km
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-white">
                          {formatVND(item.amount)}
                        </td>
                        <td className="py-3.5 px-4">
                          {item.status === 'PENDING' ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                              <Clock size={11} />
                              Chờ thanh toán
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                              <CheckCircle2 size={11} />
                              Đã thanh toán
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                          {item.completedAt}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPaymentDetailModal(item);
                            }}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1"
                          >
                            <Eye size={13} />
                            <span>Xem chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    ))}

                  {paymentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 italic">
                        Chưa có giao dịch thanh toán.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 1: DRIVER WALLETS & ADVANCE DEPOSIT ── */}
      {activeTab === 'wallets' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="relative w-full sm:w-80">
              <Search size={15} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm theo tên tài xế, mã xe, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 focus:outline-none w-full sm:w-auto cursor-pointer"
              >
                <option value="ALL">Tất cả trạng thái ví</option>
                <option value="ELIGIBLE">Đủ điều kiện nhận ca (&ge; 1 triệu)</option>
                <option value="LOCKED">Bị tạm khóa (&lt; 1 triệu)</option>
              </select>
            </div>
          </div>

          {/* Wallets Table */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-5">Tài xế & Phương tiện</th>
                    <th className="py-4 px-4">Loại dịch vụ</th>
                    <th className="py-4 px-4">Số dư ví ký quỹ</th>
                    <th className="py-4 px-4">Trạng thái nhận ca</th>
                    <th className="py-4 px-4">Chuyến đã chạy</th>
                    <th className="py-4 px-4">Hoa hồng đã nộp (10%)</th>
                    <th className="py-4 px-5 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredWallets.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                        Không tìm thấy tài xế nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredWallets.map((driver) => {
                      const isLocked = driver.balance < minThreshold;
                      return (
                        <tr key={driver.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700/60 flex items-center justify-center font-bold text-slate-200 text-xs shrink-0 shadow-sm font-sans">
                                {driver.driverName.split(' ').slice(-1)[0][0]}
                              </div>
                              <div>
                                <div className="font-bold text-slate-100 font-sans text-sm">{driver.driverName}</div>
                                <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                                  <span className="text-indigo-400 font-mono font-semibold bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-800/40">{driver.resourceCode}</span>
                                  <span>•</span>
                                  <span>{driver.phone}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-sans text-slate-300">
                            <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                              {driver.serviceType}
                            </span>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className={`text-sm font-black ${isLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {driver.balance.toLocaleString('vi-VN')} đ
                            </div>
                            <div className="text-[10px] text-slate-500 font-sans mt-0.5">
                              Ngưỡng: {minThreshold.toLocaleString('vi-VN')} đ
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-sans">
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1.5 bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
                                Bị khóa (Ví &lt; 1tr)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                Đủ điều kiện nhận ca
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 font-sans">
                            <span className="font-bold text-slate-200 font-mono text-sm">{driver.totalCompletedTrips}</span> <span className="text-slate-400 text-xs">chuyến</span>
                          </td>

                          <td className="py-3.5 px-4 text-rose-400 font-mono font-bold">
                            -{driver.totalCommissionPaid.toLocaleString('vi-VN')} đ
                          </td>

                          <td className="py-3.5 px-5 text-right font-sans">
                            <button
                              onClick={() => {
                                setTopUpModal(driver);
                                setTopUpAmount(500000);
                              }}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/25 flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <PlusCircle size={14} />
                              Nạp tiền vào ví
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: TRANSACTIONS & COMMISSION DEDUCTIONS ── */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs text-slate-400 shadow-md">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-blue-400 shrink-0" />
              <span>Nhật ký toàn bộ các giao dịch cắt 10% hoa hồng nền tảng khi tài xế bấm hoàn thành cuốc xe trên Mobile App và các lượt nạp tiền ký quỹ.</span>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-4 px-5">Mã GD & Thời gian</th>
                    <th className="py-4 px-4">Loại giao dịch</th>
                    <th className="py-4 px-4">Tài xế & Phương tiện</th>
                    <th className="py-4 px-4">Giá trị cuốc xe</th>
                    <th className="py-4 px-4">Phí sàn SmartEMS (10%)</th>
                    <th className="py-4 px-4">Thực nhận tài xế</th>
                    <th className="py-4 px-4">Số dư ví sau trừ</th>
                    <th className="py-4 px-5 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredTransactions.map((txn) => {
                    const isTopup = txn.type === 'WALLET_TOPUP';
                    return (
                      <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-indigo-400">{txn.id}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{txn.timestamp}</div>
                        </td>

                        <td className="py-3.5 px-4 font-sans">
                          {isTopup ? (
                            <span className="bg-blue-950/80 text-blue-300 border border-blue-800/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              NẠP TIỀN VÍ
                            </span>
                          ) : (
                            <span className="bg-rose-950/80 text-rose-300 border border-rose-800/80 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                              TRỪ HOA HỒNG (10%)
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200 font-sans">{txn.driverName}</div>
                          <div className="text-slate-400 text-[11px] mt-0.5">{txn.resourceCode}</div>
                        </td>

                        <td className="py-3.5 px-4 text-slate-200 font-bold">
                          {isTopup ? '—' : `${txn.totalTripFare?.toLocaleString('vi-VN')} đ`}
                        </td>

                        <td className="py-3.5 px-4">
                          {isTopup ? (
                            <span className="text-blue-400 font-bold">+{txn.amount?.toLocaleString('vi-VN')} đ</span>
                          ) : (
                            <span className="text-rose-400 font-bold text-sm">-{txn.amount?.toLocaleString('vi-VN')} đ</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-emerald-400 font-bold text-sm">
                          {isTopup ? '—' : `+${txn.driverEarnings?.toLocaleString('vi-VN')} đ`}
                        </td>

                        <td className="py-3.5 px-4 font-bold text-slate-300">
                          {txn.walletBalanceAfter?.toLocaleString('vi-VN')} đ
                        </td>

                        <td className="py-3.5 px-5 text-right font-sans">
                          {!isTopup && (
                            <button
                              onClick={() => setInvoiceModal(txn)}
                              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer"
                              title="Xem hóa đơn chi tiết"
                            >
                              <FileText size={15} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 3: EMS FARE ESTIMATOR CALCULATOR ── */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Form */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2.5 border-b border-slate-800 pb-3.5">
              <Calculator className="text-blue-400" size={20} />
              Cấu hình thông số chuyến đi mô phỏng
            </h3>

            {/* Service Type Selection */}
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-2 font-medium">Loại xe cấp cứu</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCalcServiceType('BLS')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    calcServiceType === 'BLS'
                      ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-bold text-xs">Xe cơ bản (BLS)</div>
                  <div className="text-[11px] text-slate-400 mt-1">500k mở cửa + 20k/km</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCalcServiceType('ALS')}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    calcServiceType === 'ALS'
                      ? 'bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/30 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-bold text-xs">Xe hồi sức (ALS)</div>
                  <div className="text-[11px] text-slate-400 mt-1">1.2tr mở cửa + 30k/km</div>
                </button>
              </div>
            </div>

            {/* Distance Slider / Input */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-mono uppercase text-slate-400 font-medium">Quãng đường vận chuyển (GPS)</label>
                <span className="text-sm font-bold font-mono text-blue-400 bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-800/50">
                  {calcDistance} km
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="150"
                value={calcDistance}
                onChange={(e) => setCalcDistance(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-950 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1.5">
                <span>1 km (Nội thành gần)</span>
                <span>30 km (Nội thành)</span>
                <span>150 km (Liên tỉnh)</span>
              </div>
            </div>

            {/* Surcharges Checkboxes */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1 font-medium">Dịch vụ & Kíp y tế đi kèm</label>
              
              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                <span className="text-xs text-slate-200">Kíp Bác sĩ chuyên khoa (+500.000 đ)</span>
                <input
                  type="checkbox"
                  checked={calcHasDoctor}
                  onChange={(e) => setCalcHasDoctor(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                <span className="text-xs text-slate-200">Y tá / Điều dưỡng đi kèm (+300.000 đ)</span>
                <input
                  type="checkbox"
                  checked={calcHasNurse}
                  onChange={(e) => setCalcHasNurse(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/80 cursor-pointer hover:border-slate-700 transition-colors">
                <span className="text-xs text-slate-200">Phụ phí ban đêm 22h-6h (+200.000 đ)</span>
                <input
                  type="checkbox"
                  checked={calcIsNight}
                  onChange={(e) => setCalcIsNight(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Fare Breakdown Result Card */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between shadow-2xl">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2.5 border-b border-slate-800 pb-3.5">
                <FileText className="text-emerald-400" size={20} />
                Bóc tách Hóa đơn cước phí mô phỏng
              </h3>

              <div className="mt-4 space-y-3 text-xs">
                <div className="flex justify-between text-slate-300 p-2 rounded-lg bg-slate-950/40">
                  <span className="text-slate-400">Giá mở cửa (gồm 5km đầu):</span>
                  <span className="font-mono font-bold">{fareEstimate.basePrice.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="flex justify-between text-slate-300 p-2 rounded-lg bg-slate-950/40">
                  <span className="text-slate-400">Cước phụ trội ({fareEstimate.extraKm} km):</span>
                  <span className="font-mono font-bold">{fareEstimate.distanceFee.toLocaleString('vi-VN')} đ</span>
                </div>

                {fareEstimate.doctorFee > 0 && (
                  <div className="flex justify-between text-slate-300 p-2 rounded-lg bg-slate-950/40">
                    <span className="text-slate-400">Kíp Bác sĩ chuyên khoa:</span>
                    <span className="font-mono font-bold text-indigo-300">+{fareEstimate.doctorFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                {fareEstimate.nurseFee > 0 && (
                  <div className="flex justify-between text-slate-300 p-2 rounded-lg bg-slate-950/40">
                    <span className="text-slate-400">Y tá / Điều dưỡng theo xe:</span>
                    <span className="font-mono font-bold text-indigo-300">+{fareEstimate.nurseFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                {fareEstimate.nightFee > 0 && (
                  <div className="flex justify-between text-slate-300 p-2 rounded-lg bg-slate-950/40">
                    <span className="text-slate-400">Phụ phí ca đêm (22h - 6h):</span>
                    <span className="font-mono font-bold text-indigo-300">+{fareEstimate.nightFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                {/* Total Fare */}
                <div className="pt-3.5 border-t border-slate-800 flex justify-between items-center text-sm bg-gradient-to-r from-emerald-950/30 to-transparent p-3 rounded-xl border border-emerald-500/20">
                  <span className="font-bold text-white uppercase">Tổng cước khách trả:</span>
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {fareEstimate.totalFare.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                {/* Commission Split */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 mt-2">
                  <div className="flex justify-between text-xs text-rose-400 font-medium">
                    <span>Phí sàn SmartEMS trích nộp (10%):</span>
                    <span className="font-mono font-bold text-sm">-{fareEstimate.commissionAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-xs text-blue-300 font-bold pt-2 border-t border-slate-800">
                    <span>Thu nhập thực nhận của tài xế:</span>
                    <span className="font-mono text-base text-blue-400">+{fareEstimate.driverEarnings.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 italic bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 flex items-start gap-2">
              <Info size={15} className="text-slate-500 shrink-0 mt-0.5" />
              <span>* Khách hàng tự thanh toán toàn bộ cước phí cho tài xế. Khoản 10% hoa hồng ({fareEstimate.commissionAmount.toLocaleString('vi-VN')} đ) sẽ được hệ thống trừ trực tiếp vào số dư ví của tài xế khi cuốc xe kết thúc.</span>
            </div>
          </div>
        </div>
      )}

      {/* ── TOP-UP WALLET MODAL ── */}
      {topUpModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="font-bold text-base text-white flex items-center gap-2.5">
                <CreditCard className="text-blue-400" size={20} />
                Nạp tiền ký quỹ Ví Tài xế
              </h3>
              <button onClick={() => setTopUpModal(null)} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            {topUpSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40 shadow-lg shadow-emerald-500/20 animate-bounce">
                  <Check size={32} />
                </div>
                <div className="text-lg font-bold text-white">Nạp tiền thành công!</div>
                <p className="text-xs text-slate-400">
                  Đã cộng <strong>{topUpAmount.toLocaleString('vi-VN')} đ</strong> vào ví tài xế <strong>{topUpModal.driverName}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecuteTopUp} className="space-y-4">
                {/* Driver Info Header */}
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white">{topUpModal.driverName}</div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">{topUpModal.resourceCode} • {topUpModal.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Số dư hiện tại</div>
                    <div className="text-sm font-bold font-mono text-amber-400">{topUpModal.balance.toLocaleString('vi-VN')} đ</div>
                  </div>
                </div>

                {/* Amount Selection */}
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-2 font-medium">Chọn số tiền nạp</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {[500000, 1000000, 2000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-2.5 px-2 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                          topUpAmount === amt
                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {(amt / 1000).toLocaleString('vi-VN')}k đ
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mock QR code transfer preview */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-2.5">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
                    <QrCode size={16} className="text-blue-400" />
                    Quét mã QR Chuyển khoản VietQR
                  </div>
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=SMARTEMS_TOPUP_${topUpModal.id}_${topUpAmount}`}
                      alt="VietQR Demo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[11px] font-mono text-slate-400">
                    Số tiền: <strong className="text-white">{topUpAmount.toLocaleString('vi-VN')} đ</strong> • Nội dung: <span className="text-indigo-300 font-bold">NAPVI {topUpModal.id}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTopUpModal(null)}
                    className="px-4.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
                  >
                    Xác nhận Nạp ngay
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── INVOICE DETAIL MODAL ── */}
      {invoiceModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="font-bold text-base text-white flex items-center gap-2.5">
                <FileText className="text-indigo-400" size={20} />
                Chi tiết Hóa đơn & Phí sàn ({invoiceModal.requestCode})
              </h3>
              <button onClick={() => setInvoiceModal(null)} className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-sans">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã ca cấp cứu:</span>
                  <span className="font-mono font-bold text-indigo-300">{invoiceModal.requestCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tài xế thực hiện:</span>
                  <span className="font-bold text-slate-200">{invoiceModal.driverName} ({invoiceModal.resourceCode})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Thời gian hoàn thành:</span>
                  <span className="font-mono text-slate-400">{invoiceModal.timestamp}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Phương thức thanh toán:</span>
                  <span className="font-bold text-emerald-400 font-mono">{invoiceModal.paymentMethod}</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2.5">
                <div className="flex justify-between text-slate-300">
                  <span>Tổng cước thu từ khách:</span>
                  <span className="font-mono font-bold text-white text-sm">{invoiceModal.totalTripFare?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-rose-400 font-medium">
                  <span>Phí sàn SmartEMS trích nộp (10%):</span>
                  <span className="font-mono font-bold">-{invoiceModal.amount?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="pt-2.5 border-t border-slate-800 flex justify-between text-sm text-emerald-400 font-bold">
                  <span>Thu nhập thực tế tài xế nhận:</span>
                  <span className="font-mono text-base">+{invoiceModal.driverEarnings?.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setInvoiceModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PAYMENT DETAIL MODAL (FEATURE: ESTIMATED PAYMENT & REVENUE) ── */}
      {paymentDetailModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3.5">
              <h3 className="font-bold text-base text-white flex items-center gap-2.5">
                <Receipt className="text-emerald-400" size={20} />
                CHI TIẾT CHI PHÍ
              </h3>
              <button 
                onClick={() => setPaymentDetailModal(null)} 
                className="text-slate-400 hover:text-white cursor-pointer p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-sans">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Mission:</span>
                  <span className="font-mono font-bold text-indigo-300 text-sm">{paymentDetailModal.missionId}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Loại dịch vụ:</span>
                  <span className="font-mono font-bold text-slate-200 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                    {paymentDetailModal.serviceType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Quãng đường vận chuyển:</span>
                  <span className="font-mono font-bold text-slate-200">
                    {paymentDetailModal.distanceKm.toFixed(1).replace('.', ',')} km
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ngày hoàn thành:</span>
                  <span className="font-mono text-slate-400">{paymentDetailModal.completedAt}</span>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-2.5">
                <div className="flex justify-between text-slate-300">
                  <span>Phí cơ bản:</span>
                  <span className="font-mono font-semibold text-slate-200">{formatVND(paymentDetailModal.baseFare)}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Phí theo quãng đường:</span>
                  <span className="font-mono font-semibold text-slate-200">{formatVND(paymentDetailModal.distanceFare)}</span>
                </div>

                <div className="pt-2.5 border-t border-slate-800 flex justify-between items-baseline text-white font-bold">
                  <span className="uppercase text-[11px] tracking-wider text-slate-400">TỔNG CHI PHÍ</span>
                  <span className="font-mono text-lg text-emerald-400">{formatVND(paymentDetailModal.amount)}</span>
                </div>

                <div className="pt-2 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Trạng thái:</span>
                  {paymentDetailModal.status === 'PENDING' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-950/60 text-amber-300 border border-amber-800/60">
                      <Clock size={11} />
                      Chờ thanh toán
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
                      <CheckCircle2 size={11} />
                      Đã thanh toán
                    </span>
                  )}
                </div>
              </div>

              {/* Notice Banner */}
              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl flex items-start gap-2.5 text-amber-300 text-[11px]">
                <Info size={16} className="shrink-0 mt-0.5 text-amber-400" />
                <p className="leading-relaxed">
                  Đây là khoản chi phí dự kiến cần thanh toán. Hệ thống chưa thực hiện thanh toán thực tế.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setPaymentDetailModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer transition-colors"
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
