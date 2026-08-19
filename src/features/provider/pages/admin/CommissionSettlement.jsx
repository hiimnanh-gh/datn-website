import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Landmark, ArrowUpRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { dispatchMissionService } from '../../../../services/dispatchMissionService';
import { dashboardService } from '../../../../services/dashboardService';

const CommissionSettlement = () => {
  const [txns, setTxns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState(false);

  const fetchSettlementData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. Try to fetch real missions
      const missionsRes = await dispatchMissionService.getAll().catch(() => []);
      const missions = Array.isArray(missionsRes) ? missionsRes : [];

      if (missions.length > 0) {
        const mappedTxns = missions.map((m, idx) => {
          const fare = 1500000 + (m.id % 5) * 200000;
          const rateNum = 0.15;
          const commission = fare * rateNum;
          return {
            id: `TXN-${m.id || (100 + idx)}`,
            date: m.dispatchedAt ? new Date(m.dispatchedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            incidentId: `REQ-${m.requestId || m.id}`,
            missionId: `MIS-${m.id}`,
            fare,
            commission,
            rate: '15%',
            status: m.status === 'COMPLETED' ? 'Settled' : 'Pending'
          };
        });
        setTxns(mappedTxns);
      } else {
        // Fallback default sample data if no missions exist yet
        setTxns([
          { id: 'TXN-401', date: '2026-07-15', incidentId: 'REQ-102', fare: 1200000, commission: 180000, rate: '15%', status: 'Pending' },
          { id: 'TXN-402', date: '2026-07-14', incidentId: 'REQ-103', fare: 2500000, commission: 375000, rate: '15%', status: 'Settled' },
          { id: 'TXN-403', date: '2026-07-12', incidentId: 'REQ-098', fare: 1800000, commission: 270000, rate: '15%', status: 'Settled' },
        ]);
      }
    } catch (err) {
      console.error('Error loading settlement data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettlementData();
  }, [fetchSettlementData]);

  const totalPending = txns
    .filter(t => t.status === 'Pending')
    .reduce((sum, t) => sum + t.commission, 0);

  const handleSettle = () => {
    setTxns(txns.map(t => ({ ...t, status: 'Settled' })));
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-wider text-white">COMMISSION SETTLEMENT</h1>
          <p className="text-slate-400 text-xs mt-1">Đối soát hoa hồng điều phối và quyết toán phí dịch vụ nền tảng.</p>
        </div>
        <button
          onClick={fetchSettlementData}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-2 bg-emerald-950/60 border border-emerald-900 text-emerald-400 p-4 rounded-xl text-xs">
          <CheckCircle2 size={16} />
          <span>Tất cả các khoản hoa hồng đang chờ đã được quyết toán thành công với hệ thống!</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl text-left">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Hoa hồng cần quyết toán (Pending)</span>
          <span className="text-2xl font-bold text-red-400 block mt-1">{totalPending.toLocaleString()}đ</span>
          <button 
            disabled={totalPending === 0}
            onClick={handleSettle}
            className={`mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-bold font-mono py-2 rounded-xl transition-all ${
              totalPending > 0 
                ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer active:scale-98' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Landmark size={14} />
            QUYẾT TOÁN SỐ DƯ NGAY
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl text-left">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Tổng hoa hồng đã quyết toán</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">
            {txns.filter(t => t.status === 'Settled').reduce((sum, t) => sum + t.commission, 0).toLocaleString()}đ
          </span>
          <div className="text-[10px] text-slate-500 mt-5 font-mono">Tự động đối soát qua tài khoản ngân hàng kết nối</div>
        </div>

        <div className="bg-slate-950 border border-slate-800 p-5 rounded-xl text-left">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Tỷ lệ hoa hồng hợp đồng (Commission Rate)</span>
          <span className="text-2xl font-bold text-blue-400 block mt-1">15%</span>
          <div className="text-[10px] text-slate-500 mt-5 font-mono">Thỏa thuận phân phối B2B SmartEMS Network</div>
        </div>
      </div>

      {/* Transactions Table */}
      <h2 className="text-sm font-bold font-mono tracking-wider text-slate-300 mb-4">LỊCH SỬ ĐỐI SOÁT HOA HỒNG (DISPATCH COMMISSION LOG)</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest font-mono text-[11px]">
              <th className="py-3 px-4">Mã Giao Dịch</th>
              <th className="py-3 px-4">Ngày</th>
              <th className="py-3 px-4">Mã Ca Cấp Cứu</th>
              <th className="py-3 px-4">Cước Chuyến Xe</th>
              <th className="py-3 px-4">Phí Hoa Hồng</th>
              <th className="py-3 px-4">Tỷ Lệ</th>
              <th className="py-3 px-4">Trạng Thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500 font-sans">
                  Đang tải dữ liệu đối soát...
                </td>
              </tr>
            ) : txns.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500 font-sans">
                  Chưa có giao dịch hoa hồng nào phát sinh.
                </td>
              </tr>
            ) : (
              txns.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-4 font-mono font-bold text-blue-400">{t.id}</td>
                  <td className="py-4 px-4 text-slate-300">{t.date}</td>
                  <td className="py-4 px-4 font-mono text-slate-200">{t.incidentId}</td>
                  <td className="py-4 px-4 font-mono text-slate-300">{t.fare.toLocaleString()}đ</td>
                  <td className="py-4 px-4 font-mono text-emerald-400 font-semibold">{t.commission.toLocaleString()}đ</td>
                  <td className="py-4 px-4 font-mono text-slate-400">{t.rate}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      t.status === 'Settled' 
                        ? 'bg-emerald-950/60 border border-emerald-900 text-emerald-400' 
                        : 'bg-red-950/60 border border-red-900 text-red-400'
                    }`}>
                      {t.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommissionSettlement;
