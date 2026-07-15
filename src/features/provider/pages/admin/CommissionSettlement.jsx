import React, { useState } from 'react';
import { DollarSign, Landmark, ArrowUpRight, CheckCircle2 } from 'lucide-react';

const MOCK_TRANSACTIONS = [
  { id: 'TXN-401', date: '2026-07-15', incidentId: 'EMS-102', fare: 1200000, commission: 180000, rate: '15%', status: 'Pending' },
  { id: 'TXN-402', date: '2026-07-14', incidentId: 'EMS-103', fare: 2500000, commission: 450000, rate: '18%', status: 'Settled' },
  { id: 'TXN-403', date: '2026-07-12', incidentId: 'EMS-098', fare: 1800000, commission: 288000, rate: '16%', status: 'Settled' },
];

const CommissionSettlement = () => {
  const [txns, setTxns] = useState(MOCK_TRANSACTIONS);
  const [successMsg, setSuccessMsg] = useState(false);

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
          <p className="text-slate-400 text-xs mt-1">Settle dispatch commissions and platform fees.</p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-2 bg-emerald-950/60 border border-emerald-900 text-emerald-400 p-4 rounded-xl text-xs">
          <CheckCircle2 size={16} />
          <span>All pending commissions have been successfully settled with the platform!</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl text-left">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Total Commission Owed</span>
          <span className="text-2xl font-bold text-red-400 block mt-1">{totalPending.toLocaleString()}đ</span>
          <button 
            disabled={totalPending === 0}
            onClick={handleSettle}
            className={`mt-4 w-full flex items-center justify-center gap-1.5 text-xs font-bold font-mono py-2 rounded-xl transition-all ${
              totalPending > 0 
                ? 'bg-red-600 hover:bg-red-750 text-white cursor-pointer active:scale-98' 
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Landmark size={14} />
            SETTLE BALANCE NOW
          </button>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl text-left">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Total Settled</span>
          <span className="text-2xl font-bold text-emerald-400 block mt-1">
            {txns.filter(t => t.status === 'Settled').reduce((sum, t) => sum + t.commission, 0).toLocaleString()}đ
          </span>
          <div className="text-[10px] text-slate-500 mt-5 font-mono">Auto-payout connected to Bank Account</div>
        </div>

        <div className="bg-slate-950 border border-slate-850 p-5 rounded-xl text-left">
          <span className="text-slate-400 text-[10px] font-mono uppercase block">Platform Contract Rate</span>
          <span className="text-2xl font-bold text-blue-400 block mt-1">15% - 20%</span>
          <div className="text-[10px] text-slate-500 mt-5 font-mono">B2B dispatcher network agreements</div>
        </div>
      </div>

      {/* Transactions Table */}
      <h2 className="text-sm font-bold font-mono tracking-wider text-slate-300 mb-4">DISPATCH COMMISSION LOG</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest font-mono">
              <th className="py-3 px-4">Transaction ID</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Incident ID</th>
              <th className="py-3 px-4">Ambulance Fare</th>
              <th className="py-3 px-4">Commission Fee</th>
              <th className="py-3 px-4">Rate</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {txns.map((t) => (
              <tr key={t.id} className="border-b border-slate-850 hover:bg-slate-850/30 transition-colors">
                <td className="py-4 px-4 font-mono font-bold text-blue-400">{t.id}</td>
                <td className="py-4 px-4 text-slate-350">{t.date}</td>
                <td className="py-4 px-4 font-mono text-slate-200">{t.incidentId}</td>
                <td className="py-4 px-4 font-mono text-slate-300">{t.fare.toLocaleString()}đ</td>
                <td className="py-4 px-4 font-mono text-emerald-450 font-semibold">{t.commission.toLocaleString()}đ</td>
                <td className="py-4 px-4 font-mono text-slate-400">{t.rate}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    t.status === 'Settled' 
                      ? 'bg-emerald-950/60 border border-emerald-900 text-emerald-455' 
                      : 'bg-red-950/60 border border-red-900 text-red-400'
                  }`}>
                    {t.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommissionSettlement;
