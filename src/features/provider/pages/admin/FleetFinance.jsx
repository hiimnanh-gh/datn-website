import React, { useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  PlusCircle, 
  FileText, 
  Calculator, 
  Search, 
  Filter, 
  QrCode, 
  Check, 
  X, 
  Truck, 
  Clock, 
  HelpCircle,
  Sparkles,
  CreditCard,
  Building2
} from 'lucide-react';
import useFinanceStore from '../../../../store/useFinanceStore';
import useAuthStore from '../../../../store/useAuthStore';

const FleetFinance = () => {
  const { user } = useAuthStore();
  const { 
    driverWallets, 
    transactions, 
    settings, 
    topUpDriverWallet, 
    calculateFareEstimate 
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState('wallets'); // 'wallets' | 'transactions' | 'calculator'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Topup Modal State
  const [topUpModal, setTopUpModal] = useState(null); // { driver } or null
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

  // Calculate Provider Fleet KPI Metrics
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
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <Wallet className="text-blue-400" size={26} />
            Tài chính & Quản lý Ví Đội xe (Fleet Finance)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi số dư ví ký quỹ tài xế, doanh thu cuốc xe và hoa hồng chiết khấu 10% nộp về sàn SmartEMS.
          </p>
        </div>

        {/* Global Policy Badge */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl text-xs shrink-0 font-mono">
          <span className="text-slate-400">Ngưỡng ví tối thiểu:</span>
          <span className="font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded">
            {minThreshold.toLocaleString('vi-VN')} đ
          </span>
        </div>
      </div>

      {/* ── Alert Banner if any drivers are below threshold ── */}
      {lockedDriversCount > 0 && (
        <div className="bg-rose-950/40 border border-rose-800/60 p-4 rounded-2xl flex items-center justify-between gap-3 text-xs sm:text-sm text-rose-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-900/60 rounded-xl text-rose-300 shrink-0">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-bold text-rose-100">
                Có {lockedDriversCount} tài xế đang bị tạm khóa nhận ca do số dư ví &lt; {minThreshold.toLocaleString('vi-VN')} đ!
              </p>
              <p className="text-xs text-rose-300/80 mt-0.5">
                Vui lòng nạp tiền vào ví tài xế để kích hoạt lại quyền nhận ca cấp cứu tự động trên Mobile App.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setActiveTab('wallets');
              setFilterStatus('LOCKED');
            }}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer shadow-lg shadow-rose-600/30"
          >
            Xử lý ngay
          </button>
        </div>
      )}

      {/* ── KPI Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Tổng cước thu từ khách */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Tổng cước thu từ khách</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">
            {totalFleetRevenue.toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-sans font-normal">đ</span>
          </div>
          <p className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 size={12} /> Tiền mặt / QR khách thanh toán
          </p>
        </div>

        {/* Card 2: Hoa hồng trích nộp sàn (10%) */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Hoa hồng nộp sàn (10%)</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">
            -{totalCommissionPaid.toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-sans font-normal">đ</span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1">
            Đã trừ trực tiếp từ ví các tài xế
          </p>
        </div>

        {/* Card 3: Doanh thu thực nhận đội xe */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Doanh thu thực nhận</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-blue-300 font-mono">
            {(totalFleetRevenue - totalCommissionPaid).toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-sans font-normal">đ</span>
          </div>
          <p className="text-[11px] text-blue-400/90 font-medium">
            90% doanh thu giữ lại cho đội xe
          </p>
        </div>

        {/* Card 4: Tổng số dư quỹ ví tài xế */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Tổng quỹ ví tài xế</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">
            {totalFleetBalance.toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-sans font-normal">đ</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{driverWallets.length} tài xế</span>
            {lockedDriversCount > 0 ? (
              <span className="text-rose-400 font-bold font-mono">{lockedDriversCount} xe bị khóa</span>
            ) : (
              <span className="text-emerald-400 font-bold">100% Sẵn sàng</span>
            )}
          </div>
        </div>

      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('wallets');
              setFilterStatus('ALL');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
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

      {/* ── TAB 1: DRIVER WALLETS MANAGEMENT ── */}
      {activeTab === 'wallets' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                placeholder="Tìm theo tên tài xế, mã xe, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none w-full sm:w-auto"
              >
                <option value="ALL">Tất cả trạng thái ví</option>
                <option value="ELIGIBLE">Đủ điều kiện nhận ca (&ge; 1 triệu)</option>
                <option value="LOCKED">Bị tạm khóa (&lt; 1 triệu)</option>
              </select>
            </div>
          </div>

          {/* Wallets Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Tài xế & Mã xe</th>
                    <th className="py-3.5 px-4">Loại phương tiện</th>
                    <th className="py-3.5 px-4">Số dư ví ký quỹ</th>
                    <th className="py-3.5 px-4">Trạng thái nhận ca</th>
                    <th className="py-3.5 px-4">Số chuyến chạy</th>
                    <th className="py-3.5 px-4">Tổng hoa hồng đã nộp</th>
                    <th className="py-3.5 px-4 text-right">Hành động</th>
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
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-100 font-sans text-sm">{driver.driverName}</div>
                            <div className="text-slate-400 text-[11px] flex items-center gap-1.5 mt-0.5">
                              <span className="text-indigo-400 font-mono font-semibold">{driver.resourceCode}</span>
                              <span>•</span>
                              <span>{driver.phone}</span>
                            </div>
                          </td>

                          <td className="py-3 px-4 font-sans text-slate-300">
                            {driver.serviceType}
                          </td>

                          <td className="py-3 px-4">
                            <div className={`text-sm font-black ${isLocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {driver.balance.toLocaleString('vi-VN')} đ
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Ngưỡng: {minThreshold.toLocaleString('vi-VN')} đ
                            </div>
                          </td>

                          <td className="py-3 px-4 font-sans">
                            {isLocked ? (
                              <span className="inline-flex items-center gap-1.5 bg-rose-950/70 text-rose-300 border border-rose-800/80 px-2.5 py-1 rounded-full text-[11px] font-bold">
                                <AlertTriangle size={12} className="text-rose-400" />
                                Bị khóa (Ví &lt; 1tr)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-950/70 text-emerald-300 border border-emerald-800/80 px-2.5 py-1 rounded-full text-[11px] font-bold">
                                <CheckCircle2 size={12} className="text-emerald-400" />
                                Đủ điều kiện nhận ca
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 font-sans">
                            <span className="font-bold text-slate-200 font-mono">{driver.totalCompletedTrips}</span> ca
                          </td>

                          <td className="py-3 px-4 text-rose-400 font-mono font-bold">
                            -{driver.totalCommissionPaid.toLocaleString('vi-VN')} đ
                          </td>

                          <td className="py-3 px-4 text-right font-sans">
                            <button
                              onClick={() => {
                                setTopUpModal(driver);
                                setTopUpAmount(500000);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-blue-600/25 flex items-center gap-1.5 ml-auto cursor-pointer"
                            >
                              <PlusCircle size={13} />
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
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
            <p className="text-xs text-slate-400">
              Nhật ký toàn bộ các giao dịch cắt 10% hoa hồng nền tảng khi tài xế bấm hoàn thành cuốc xe trên Mobile App và các lượt nạp tiền ký quỹ.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Mã GD & Thời gian</th>
                    <th className="py-3.5 px-4">Loại giao dịch</th>
                    <th className="py-3.5 px-4">Tài xế & Mã xe</th>
                    <th className="py-3.5 px-4">Giá trị cuốc xe</th>
                    <th className="py-3.5 px-4">Phí sàn SmartEMS (10%)</th>
                    <th className="py-3.5 px-4">Thực nhận tài xế</th>
                    <th className="py-3.5 px-4">Số dư ví sau trừ</th>
                    <th className="py-3.5 px-4 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredTransactions.map((txn) => {
                    const isTopup = txn.type === 'WALLET_TOPUP';
                    return (
                      <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-indigo-400">{txn.id}</div>
                          <div className="text-[10px] text-slate-500">{txn.timestamp}</div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          {isTopup ? (
                            <span className="bg-blue-950/80 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              NẠP TIỀN VÍ
                            </span>
                          ) : (
                            <span className="bg-rose-950/80 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              TRỪ HOA HỒNG (10%)
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-200 font-sans">{txn.driverName}</div>
                          <div className="text-slate-400 text-[11px]">{txn.resourceCode}</div>
                        </td>

                        <td className="py-3 px-4 text-slate-200">
                          {isTopup ? '—' : `${txn.totalTripFare?.toLocaleString('vi-VN')} đ`}
                        </td>

                        <td className="py-3 px-4">
                          {isTopup ? (
                            <span className="text-blue-400 font-bold">+{txn.amount?.toLocaleString('vi-VN')} đ</span>
                          ) : (
                            <span className="text-rose-400 font-bold">-{txn.amount?.toLocaleString('vi-VN')} đ</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-emerald-400 font-bold">
                          {isTopup ? '—' : `+${txn.driverEarnings?.toLocaleString('vi-VN')} đ`}
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-300">
                          {txn.walletBalanceAfter?.toLocaleString('vi-VN')} đ
                        </td>

                        <td className="py-3 px-4 text-right font-sans">
                          {!isTopup && (
                            <button
                              onClick={() => setInvoiceModal(txn)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                              title="Xem hóa đơn chi tiết"
                            >
                              <FileText size={14} />
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
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Calculator className="text-blue-400" size={18} />
              Cấu hình thông số chuyến đi mô phỏng
            </h3>

            {/* Service Type Selection */}
            <div>
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1.5">Loại xe cấp cứu</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setCalcServiceType('BLS')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    calcServiceType === 'BLS'
                      ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-bold text-xs">Xe cơ bản (BLS)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">500k mở cửa + 20k/km</div>
                </button>

                <button
                  type="button"
                  onClick={() => setCalcServiceType('ALS')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    calcServiceType === 'ALS'
                      ? 'bg-blue-950/60 border-blue-500 ring-1 ring-blue-500/50 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-bold text-xs">Xe hồi sức (ALS)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">1.2tr mở cửa + 30k/km</div>
                </button>
              </div>
            </div>

            {/* Distance Slider / Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-mono uppercase text-slate-400">Quãng đường vận chuyển (GPS)</label>
                <span className="text-sm font-bold font-mono text-blue-400">{calcDistance} km</span>
              </div>
              <input
                type="range"
                min="1"
                max="150"
                value={calcDistance}
                onChange={(e) => setCalcDistance(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>1 km (Nội thành gần)</span>
                <span>30 km (Nội thành)</span>
                <span>150 km (Liên tỉnh)</span>
              </div>
            </div>

            {/* Surcharges Checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <label className="text-xs font-mono uppercase text-slate-400 block mb-1">Dịch vụ & Kíp y tế đi kèm</label>
              
              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs text-slate-200">Kíp Bác sĩ chuyên khoa (+500.000 đ)</span>
                <input
                  type="checkbox"
                  checked={calcHasDoctor}
                  onChange={(e) => setCalcHasDoctor(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs text-slate-200">Y tá / Điều dưỡng đi kèm (+300.000 đ)</span>
                <input
                  type="checkbox"
                  checked={calcHasNurse}
                  onChange={(e) => setCalcHasNurse(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0 w-4 h-4 accent-blue-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer hover:border-slate-700">
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
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="text-emerald-400" size={18} />
                Bóc tách Hóa đơn cước phí mô phỏng
              </h3>

              <div className="mt-3 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Giá mở cửa (gồm 5km đầu):</span>
                  <span className="font-mono font-bold">{fareEstimate.basePrice.toLocaleString('vi-VN')} đ</span>
                </div>

                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-400">Cước phụ trội ({fareEstimate.extraKm} km):</span>
                  <span className="font-mono font-bold">{fareEstimate.distanceFee.toLocaleString('vi-VN')} đ</span>
                </div>

                {fareEstimate.doctorFee > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Kíp Bác sĩ chuyên khoa:</span>
                    <span className="font-mono font-bold">+{fareEstimate.doctorFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                {fareEstimate.nurseFee > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Y tá / Điều dưỡng theo xe:</span>
                    <span className="font-mono font-bold">+{fareEstimate.nurseFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                {fareEstimate.nightFee > 0 && (
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-400">Phụ phí ca đêm (22h - 6h):</span>
                    <span className="font-mono font-bold">+{fareEstimate.nightFee.toLocaleString('vi-VN')} đ</span>
                  </div>
                )}

                {/* Total Fare */}
                <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-sm">
                  <span className="font-bold text-white uppercase">Tổng cước khách trả:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    {fareEstimate.totalFare.toLocaleString('vi-VN')} đ
                  </span>
                </div>

                {/* Commission Split */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2 mt-2">
                  <div className="flex justify-between text-xs text-rose-400 font-medium">
                    <span>Phí sàn SmartEMS trích nộp (10%):</span>
                    <span className="font-mono font-bold">-{fareEstimate.commissionAmount.toLocaleString('vi-VN')} đ</span>
                  </div>
                  <div className="flex justify-between text-xs text-blue-300 font-bold pt-1 border-t border-slate-800">
                    <span>Thu nhập thực nhận của tài xế:</span>
                    <span className="font-mono text-sm">+{fareEstimate.driverEarnings.toLocaleString('vi-VN')} đ</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 italic bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50">
              * Khách hàng tự thanh toán toàn bộ cước phí cho tài xế. Khoản 10% hoa hồng ({fareEstimate.commissionAmount.toLocaleString('vi-VN')} đ) sẽ được hệ thống trừ trực tiếp vào số dư ví của tài xế khi cuốc xe kết thúc.
            </div>
          </div>
        </div>
      )}

      {/* ── TOP-UP WALLET MODAL ── */}
      {topUpModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CreditCard className="text-blue-400" size={18} />
                Nạp tiền ký quỹ Ví Tài xế
              </h3>
              <button onClick={() => setTopUpModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {topUpSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
                  <Check size={28} />
                </div>
                <div className="text-base font-bold text-white">Nạp tiền thành công!</div>
                <p className="text-xs text-slate-400">
                  Đã cộng <strong>{topUpAmount.toLocaleString('vi-VN')} đ</strong> vào ví tài xế <strong>{topUpModal.driverName}</strong>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExecuteTopUp} className="space-y-4">
                {/* Driver Info Header */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm text-white">{topUpModal.driverName}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{topUpModal.resourceCode} • {topUpModal.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-500 font-mono uppercase">Số dư hiện tại</div>
                    <div className="text-sm font-bold font-mono text-amber-400">{topUpModal.balance.toLocaleString('vi-VN')} đ</div>
                  </div>
                </div>

                {/* Amount Selection */}
                <div>
                  <label className="text-xs font-mono uppercase text-slate-400 block mb-2">Chọn số tiền nạp</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[500000, 1000000, 2000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTopUpAmount(amt)}
                        className={`py-2 px-1 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                          topUpAmount === amt
                            ? 'bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/30'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {(amt / 1000).toLocaleString('vi-VN')}k đ
                      </button>
                    ))}
                  </div>
                </div>

                {/* Mock QR code transfer preview */}
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center space-y-2">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium">
                    <QrCode size={15} className="text-blue-400" />
                    Quét mã QR Chuyển khoản VietQR
                  </div>
                  <div className="w-28 h-28 mx-auto bg-white p-1.5 rounded-lg flex items-center justify-center">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=SMARTEMS_TOPUP_${topUpModal.id}_${topUpAmount}`}
                      alt="VietQR Demo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Số tiền: <strong className="text-white">{topUpAmount.toLocaleString('vi-VN')} đ</strong> • Nội dung: <span className="text-indigo-300">NAPVI {topUpModal.id}</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setTopUpModal(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
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
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <FileText className="text-indigo-400" size={18} />
                Chi tiết Hóa đơn & Phí sàn ({invoiceModal.requestCode})
              </h3>
              <button onClick={() => setInvoiceModal(null)} className="text-slate-400 hover:text-white cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
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

              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Tổng cước thu từ khách:</span>
                  <span className="font-mono font-bold text-white">{invoiceModal.totalTripFare?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="flex justify-between text-rose-400 font-medium">
                  <span>Phí sàn SmartEMS trích nộp (10%):</span>
                  <span className="font-mono font-bold">-{invoiceModal.amount?.toLocaleString('vi-VN')} đ</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between text-sm text-emerald-400 font-bold">
                  <span>Thu nhập thực tế tài xế nhận:</span>
                  <span className="font-mono">+{invoiceModal.driverEarnings?.toLocaleString('vi-VN')} đ</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setInvoiceModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium cursor-pointer"
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
