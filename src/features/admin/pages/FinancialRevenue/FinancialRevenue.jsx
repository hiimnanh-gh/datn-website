import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowDownLeft, 
  Wallet, 
  Building2, 
  FileText, 
  Sliders, 
  Save, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  Percent, 
  Clock, 
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import useFinanceStore from '../../../../store/useFinanceStore';

const FinancialRevenue = () => {
  const { 
    driverWallets, 
    transactions, 
    settings, 
    updateSettings 
  } = useFinanceStore();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'providers' | 'ledger' | 'settings'
  const [searchTerm, setSearchTerm] = useState('');

  // Policy Settings Form State
  const [minBalanceInput, setMinBalanceInput] = useState(settings.minWalletBalance || 1000000);
  const [commissionRateInput, setCommissionRateInput] = useState(Math.round((settings.commissionRate || 0.10) * 100));
  const [blsBaseInput, setBlsBaseInput] = useState(settings.blsBasePrice || 500000);
  const [blsPerKmInput, setBlsPerKmInput] = useState(settings.blsPerKmPrice || 20000);
  const [alsBaseInput, setAlsBaseInput] = useState(settings.alsBasePrice || 1200000);
  const [alsPerKmInput, setAlsPerKmInput] = useState(settings.alsPerKmPrice || 30000);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Platform Metrics
  const minThreshold = settings.minWalletBalance || 1000000;
  const totalPlatformTripVolume = driverWallets.reduce((acc, d) => acc + (d.totalTripRevenue || 0), 0);
  const totalCommissionRevenue = transactions
    .filter(t => t.type === 'COMMISSION_DEDUCT')
    .reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalDriverEscrowBalance = driverWallets.reduce((acc, d) => acc + (d.balance || 0), 0);
  const lockedDriversCount = driverWallets.filter(d => d.balance < minThreshold).length;

  // Group revenue by Provider
  const providerStats = [
    {
      id: 1,
      name: 'Trung tâm Cấp cứu 115 Hoàn Kiếm',
      code: 'PROV-HK-01',
      totalDrivers: 2,
      completedTrips: 26,
      grossTripVolume: 60000000,
      commissionPaid: 6000000,
      escrowBalance: 1950000,
      status: 'ACTIVE',
    },
    {
      id: 2,
      name: 'Trung tâm Cấp cứu 115 Hai Bà Trưng',
      code: 'PROV-HBT-02',
      totalDrivers: 1,
      completedTrips: 12,
      grossTripVolume: 28000000,
      commissionPaid: 2800000,
      escrowBalance: 850000, // < 1tr
      status: 'WARNING',
    },
    {
      id: 3,
      name: 'Trung tâm Cấp cứu 115 Cầu Giấy',
      code: 'PROV-CG-03',
      totalDrivers: 1,
      completedTrips: 24,
      grossTripVolume: 75000000,
      commissionPaid: 7500000,
      escrowBalance: 2800000,
      status: 'ACTIVE',
    },
    {
      id: 4,
      name: 'Trung tâm Cấp cứu 115 Thanh Xuân',
      code: 'PROV-TX-04',
      totalDrivers: 1,
      completedTrips: 15,
      grossTripVolume: 48000000,
      commissionPaid: 4800000,
      escrowBalance: 1950000,
      status: 'ACTIVE',
    },
  ];

  const handleSavePolicySettings = (e) => {
    e.preventDefault();
    updateSettings({
      minWalletBalance: Number(minBalanceInput),
      commissionRate: Number(commissionRateInput) / 100,
      blsBasePrice: Number(blsBaseInput),
      blsPerKmPrice: Number(blsPerKmInput),
      alsBasePrice: Number(alsBaseInput),
      alsPerKmPrice: Number(alsPerKmInput),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-200">
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <DollarSign className="text-emerald-400" size={26} />
            Quản trị Doanh thu & Hoa hồng Sàn (Platform Revenue & Commissions)
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Theo dõi dòng tiền chiết khấu 10% thu từ các cuốc xe cấp cứu và cấu hình chính sách ký quỹ toàn hệ thống SmartEMS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs font-mono text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Chiết khấu sàn: <strong className="text-emerald-400">{(settings.commissionRate * 100).toFixed(0)}%</strong></span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Doanh thu hoa hồng đã thu */}
        <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-4.5 space-y-2 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">Doanh thu Hoa hồng Sàn (10%)</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-300 font-mono">
            {totalCommissionRevenue.toLocaleString('vi-VN')} <span className="text-xs text-emerald-400/80 font-normal">đ</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Doanh thu thực thu về sàn SmartEMS
          </p>
        </div>

        {/* Card 2: Tổng giá trị cuốc xe toàn hệ thống */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Tổng cước phát sinh toàn sàn</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {totalPlatformTripVolume.toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-normal">đ</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Khách hàng thanh toán cho tài xế
          </p>
        </div>

        {/* Card 3: Tiền ký quỹ đang quản lý */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Tổng quỹ ký quỹ tài xế</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {totalDriverEscrowBalance.toLocaleString('vi-VN')} <span className="text-xs text-slate-400 font-normal">đ</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Tiền nạp giữ chỗ của các đội xe
          </p>
        </div>

        {/* Card 4: Tình trạng tài xế */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-2 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 font-mono uppercase">Tài xế sẵn sàng nhận ca</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-indigo-300 font-mono">
            {driverWallets.length - lockedDriversCount} / {driverWallets.length} <span className="text-xs text-slate-400 font-normal">tài xế</span>
          </div>
          <div className="text-[11px] flex items-center gap-1.5">
            {lockedDriversCount > 0 ? (
              <span className="text-rose-400 font-bold font-mono">⚠️ {lockedDriversCount} tài xế ví &lt; 1 triệu</span>
            ) : (
              <span className="text-emerald-400 font-bold">100% ví đủ điều kiện</span>
            )}
          </div>
        </div>

      </div>

      {/* ── Navigation Tabs ── */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Building2 size={15} />
          Doanh thu theo Đơn vị (Provider)
        </button>

        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'ledger'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText size={15} />
          Nhật ký Hoa hồng Thời gian thực ({transactions.length})
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Sliders size={15} />
          Cấu hình Ký quỹ & Bảng giá Sàn
        </button>
      </div>

      {/* ── TAB 1: REVENUE BY PROVIDER ── */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Đơn vị / Provider</th>
                    <th className="py-3.5 px-4">Số lượng xe</th>
                    <th className="py-3.5 px-4">Số chuyến hoàn thành</th>
                    <th className="py-3.5 px-4">Tổng cước phát sinh</th>
                    <th className="py-3.5 px-4">Hoa hồng sàn thu (10%)</th>
                    <th className="py-3.5 px-4">Quỹ ký quỹ hiện tại</th>
                    <th className="py-3.5 px-4">Trạng thái đội xe</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {providerStats.map((prov) => (
                    <tr key={prov.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-100 font-sans text-sm">{prov.name}</div>
                        <div className="text-slate-500 text-[11px]">{prov.code}</div>
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-300">
                        {prov.totalDrivers} xe cứu thương
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-200">{prov.completedTrips}</span> chuyến
                      </td>

                      <td className="py-3 px-4 text-slate-200 font-bold">
                        {prov.grossTripVolume.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="py-3 px-4 text-emerald-400 font-bold text-sm">
                        +{prov.commissionPaid.toLocaleString('vi-VN')} đ
                      </td>

                      <td className="py-3 px-4">
                        <div className={`font-bold ${prov.escrowBalance < minThreshold ? 'text-rose-400' : 'text-amber-400'}`}>
                          {prov.escrowBalance.toLocaleString('vi-VN')} đ
                        </div>
                      </td>

                      <td className="py-3 px-4 font-sans">
                        {prov.status === 'ACTIVE' ? (
                          <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            HOẠT ĐỘNG TỐT
                          </span>
                        ) : (
                          <span className="bg-rose-950/70 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">
                            CẦN NẠP THÊM VÍ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: COMMISSION TRANSACTION LEDGER ── */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Mã GD & Thời gian</th>
                    <th className="py-3.5 px-4">Loại giao dịch</th>
                    <th className="py-3.5 px-4">Ca cấp cứu</th>
                    <th className="py-3.5 px-4">Tài xế & Đơn vị</th>
                    <th className="py-3.5 px-4">Cước cuốc xe</th>
                    <th className="py-3.5 px-4">Hoa hồng sàn nhận (+10%)</th>
                    <th className="py-3.5 px-4">Ghi chú giao dịch</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {transactions.map((txn) => {
                    const isCommission = txn.type === 'COMMISSION_DEDUCT';
                    return (
                      <tr key={txn.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-indigo-400">{txn.id}</div>
                          <div className="text-[10px] text-slate-500">{txn.timestamp}</div>
                        </td>

                        <td className="py-3 px-4 font-sans">
                          {isCommission ? (
                            <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              THU HOA HỒNG (10%)
                            </span>
                          ) : (
                            <span className="bg-blue-950/80 text-blue-300 border border-blue-800 px-2 py-0.5 rounded text-[10px] font-bold">
                              NẠP KÝ QUỸ
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-bold text-amber-400">
                          {txn.requestCode || '—'}
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-200 font-sans">{txn.driverName}</div>
                          <div className="text-slate-400 text-[11px]">{txn.providerName}</div>
                        </td>

                        <td className="py-3 px-4 text-slate-300">
                          {isCommission ? `${txn.totalTripFare?.toLocaleString('vi-VN')} đ` : '—'}
                        </td>

                        <td className="py-3 px-4 font-black text-sm">
                          {isCommission ? (
                            <span className="text-emerald-400">+{txn.amount?.toLocaleString('vi-VN')} đ</span>
                          ) : (
                            <span className="text-blue-400">+{txn.amount?.toLocaleString('vi-VN')} đ (Ký quỹ)</span>
                          )}
                        </td>

                        <td className="py-3 px-4 font-sans text-slate-400 text-[11px] max-w-xs truncate">
                          {txn.note}
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

      {/* ── TAB 3: SYSTEM FINANCIAL POLICY SETTINGS ── */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSavePolicySettings} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sliders className="text-emerald-400" size={18} />
                Cấu hình Chính sách Ký quỹ & Tỷ lệ Chiết khấu Sàn
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Các quy định tài chính này áp dụng tự động cho toàn bộ hệ thống Dispatcher và Mobile App của Tài xế.
              </p>
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              Lưu chính sách
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 size={16} />
              Đã cập nhật chính sách tài chính hệ thống thành công!
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Min Wallet Balance Threshold */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-mono uppercase text-slate-300 font-bold block">
                Mức ví ký quỹ tối thiểu để nhận ca (VND)
              </label>
              <p className="text-[11px] text-slate-400">
                Nếu ví tài xế thấp hơn mức này, tài xế sẽ bị khóa nhận cuốc tự động trên Mobile App.
              </p>
              <div className="relative mt-2">
                <input
                  type="number"
                  step="100000"
                  value={minBalanceInput}
                  onChange={(e) => setMinBalanceInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">VNĐ</span>
              </div>
            </div>

            {/* Commission Rate */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-mono uppercase text-slate-300 font-bold block">
                Tỷ lệ chiết khấu hoa hồng sàn (%)
              </label>
              <p className="text-[11px] text-slate-400">
                Tỷ lệ % cước phí chuyến đi được tự động trừ từ ví tài xế khi hoàn thành ca.
              </p>
              <div className="relative mt-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={commissionRateInput}
                  onChange={(e) => setCommissionRateInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 font-mono text-sm text-white font-bold focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-500 font-mono">%</span>
              </div>
            </div>

            {/* BLS Pricing */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="font-bold text-xs text-indigo-300 font-mono uppercase">
                Bảng giá: Xe Cấp cứu Cơ bản (BLS)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Giá mở cửa (5km đầu)</label>
                  <input
                    type="number"
                    step="50000"
                    value={blsBaseInput}
                    onChange={(e) => setBlsBaseInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Đơn giá / km sau 5km</label>
                  <input
                    type="number"
                    step="5000"
                    value={blsPerKmInput}
                    onChange={(e) => setBlsPerKmInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                  />
                </div>
              </div>
            </div>

            {/* ALS Pricing */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="font-bold text-xs text-amber-300 font-mono uppercase">
                Bảng giá: Xe Hồi sức Nâng cao (ALS)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Giá mở cửa (5km đầu)</label>
                  <input
                    type="number"
                    step="50000"
                    value={alsBaseInput}
                    onChange={(e) => setAlsBaseInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Đơn giá / km sau 5km</label>
                  <input
                    type="number"
                    step="5000"
                    value={alsPerKmInput}
                    onChange={(e) => setAlsPerKmInput(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 font-mono text-xs text-white"
                  />
                </div>
              </div>
            </div>

          </div>
        </form>
      )}

    </div>
  );
};

export default FinancialRevenue;
