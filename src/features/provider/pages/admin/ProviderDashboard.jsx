import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  History, 
  ArrowUpRight, 
  Layers, 
  Percent, 
  HelpCircle,
  X
} from 'lucide-react';
import './ProviderDashboard.css';

// Initial Mock Ledger Transactions
const INITIAL_LEDGER = [
  { date: '2026-07-15 14:02:11', missionId: 'EMS-102', fare: 1200.00, fee: 180.00, balance: 12450.00 },
  { date: '2026-07-14 10:24:55', missionId: 'EMS-098', fare: 2500.00, fee: 450.00, balance: 11430.00 },
  { date: '2026-07-13 16:48:10', missionId: 'EMS-095', fare: 1800.00, fee: 288.00, balance: 9380.00 },
  { date: '2026-07-12 09:12:30', missionId: 'EMS-091', fare: 1500.00, fee: 225.00, balance: 7868.00 },
];

const ProviderDashboard = () => {
  const [walletBalance, setWalletBalance] = useState(12450.00);
  const [totalEarned, setTotalEarned] = useState(45200.00);
  const [platformFees, setPlatformFees] = useState(7300.00);
  const [ledger, setLedger] = useState(INITIAL_LEDGER);
  
  // Checkout Modal State
  const [showCheckout, setShowCheckout] = useState(false);
  const [amount, setAmount] = useState('1000');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Wallet Top Up Action
  const handleTopUpSubmit = (e) => {
    e.preventDefault();
    const topUpAmount = parseFloat(amount);
    if (isNaN(topUpAmount) || topUpAmount <= 0) return;

    // Simulate Payment Success
    const newBalance = walletBalance + topUpAmount;
    setWalletBalance(newBalance);
    
    // Add Transaction to Ledger
    const newTxn = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      missionId: 'TOPUP-CREDIT',
      fare: topUpAmount,
      fee: 0.00,
      balance: newBalance
    };

    setLedger([newTxn, ...ledger]);
    setSuccessMsg(`Successfully topped up $${topUpAmount.toLocaleString()} via Mock Checkout Gateway!`);
    
    // Reset form
    setAmount('1000');
    setCardNumber('');
    setExpiry('');
    setCvv('');
    setCardName('');

    setTimeout(() => {
      setShowCheckout(false);
      setSuccessMsg('');
    }, 2000);
  };

  const netProfit = totalEarned - platformFees;

  return (
    <div className="provider-dashboard-v2 text-slate-100 p-6 space-y-6 font-sans">
      
      {/* ── Dashboard Header ── */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-5 text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-wider font-mono text-white uppercase flex items-center gap-2">
            <Layers className="text-emerald-500" size={24} />
            Economic & Clearing Hub
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase font-mono tracking-widest">
            B2B Ambulance Fleet Clearing Center · Live Revenue Logs
          </p>
        </div>
      </div>

      {/* ── Top Section: Wallet Card + ROI Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
        
        {/* Massive Display: Prepaid Wallet Balance */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
                My Prepaid Wallet Balance
              </span>
              <span className="bg-emerald-950/40 text-emerald-400 border border-emerald-900 text-[9px] font-bold px-2 py-0.5 rounded font-mono">
                CLEARED
              </span>
            </div>
            
            <h2 className="text-4xl font-bold font-mono text-white tracking-tight">
              ${walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Used for automated platform dispatch commissions deductions
            </p>
          </div>

          <button
            onClick={() => setShowCheckout(true)}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg active:scale-98"
          >
            <CreditCard size={15} />
            TOP-UP WALLET BALANCE
          </button>
        </div>

        {/* ROI Metrics Grid */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Metric 1: Total Earned */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Total Revenue Earned</span>
              <span className="text-[9px] font-mono text-slate-500 block mt-0.5">(Ambulance Fares)</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-white">
                ${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="p-1 rounded bg-slate-950 text-slate-400 border border-slate-850">
                <ArrowUpRight size={14} />
              </span>
            </div>
          </div>

          {/* Metric 2: Platform Fees */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Fees Deducted</span>
              <span className="text-[9px] font-mono text-slate-500 block mt-0.5">(Commission Deductions)</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-red-400">
                -${platformFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="p-1 rounded bg-slate-950 text-red-400 border border-slate-850">
                <Percent size={14} />
              </span>
            </div>
          </div>

          {/* Metric 3: Net Profit */}
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all">
            <div>
              <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest block">Net Profit Margin</span>
              <span className="text-[9px] font-mono text-slate-500 block mt-0.5">(ROI Earnings)</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                ${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs font-bold font-mono text-emerald-400 flex items-center gap-0.5">
                <TrendingUp size={12} />
                {( (netProfit / totalEarned) * 100 ).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Dispatch & Payment History Ledger ── */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl shadow-2xl text-left">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <History className="text-emerald-500" size={18} />
            <h2 className="text-sm font-bold font-mono tracking-wider text-white uppercase">Dispatch & Wallet Transaction Ledger</h2>
          </div>
          <span className="text-[9px] bg-slate-950 border border-slate-850 text-slate-500 font-mono px-2.5 py-1 rounded-full uppercase tracking-wider">
            All clearings recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono text-[10px] tracking-wider uppercase">
                <th className="py-2.5 px-3">Date / Timestamp</th>
                <th className="py-2.5 px-3">Mission ID</th>
                <th className="py-2.5 px-3">Fare Collected</th>
                <th className="py-2.5 px-3">Platform Deduction</th>
                <th className="py-2.5 px-3 text-right">Cleared Balance</th>
              </tr>
            </thead>
            <tbody>
              {ledger.map((txn, idx) => {
                const isTopUp = txn.missionId.startsWith('TOPUP');
                return (
                  <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/40 transition-colors">
                    <td className="py-3.5 px-3 font-mono text-slate-400">{txn.date}</td>
                    <td className="py-3.5 px-3 font-mono">
                      <span className={`font-bold ${isTopUp ? 'text-emerald-400' : 'text-blue-400'}`}>
                        {txn.missionId}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-200">
                      {isTopUp ? `+$${txn.fare.toLocaleString()}` : `$${txn.fare.toLocaleString()}`}
                    </td>
                    <td className="py-3.5 px-3 font-mono">
                      {isTopUp ? (
                        <span className="text-slate-600">—</span>
                      ) : (
                        <span className="text-red-400">-${txn.fee.toLocaleString()}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-mono text-right font-bold text-slate-100">
                      ${txn.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Mock Stripe Payment Gateway Modal Slide-over ── */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in text-left">
            <div className="bg-slate-950 p-4 border-b border-slate-850 flex justify-between items-center">
              <h3 className="text-sm font-bold font-mono tracking-wider text-white flex items-center gap-1.5">
                <CreditCard className="text-emerald-500 animate-pulse" size={18} />
                MOCK PAYMENTS CHECKOUT
              </h3>
              <button 
                onClick={() => setShowCheckout(false)}
                className="text-slate-400 hover:text-white transition-all focus:outline-none"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTopUpSubmit} className="p-6 space-y-4">
              
              {successMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-900 text-emerald-400 text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle size={16} />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Amount field */}
              <div>
                <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">Top-Up Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    required
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white font-mono rounded-lg pl-8 pr-4 py-2.5 outline-none focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>

              {/* Cardholder name */}
              <div>
                <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">Cardholder Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Michael Scott"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-emerald-600 transition-all font-mono"
                />
              </div>

              {/* Card Number */}
              <div>
                <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">Credit Card Number</label>
                <input
                  type="text"
                  required
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-emerald-600 transition-all font-mono"
                />
              </div>

              {/* Expiry & CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">Expiration Date</label>
                  <input
                    type="text"
                    required
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-emerald-600 transition-all font-mono text-center"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold font-mono text-slate-500 uppercase tracking-wider block mb-1">CVV Security Code</label>
                  <input
                    type="password"
                    required
                    placeholder="•••"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 outline-none focus:border-emerald-600 transition-all font-mono text-center"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-mono text-xs font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-1"
                >
                  <CheckCircle size={15} />
                  CONFIRM DEPOSIT
                </button>
              </div>

              <div className="flex items-center gap-1.5 justify-center text-[9px] text-slate-500 font-mono">
                <AlertCircle size={12} />
                <span>Simulated payment engine. Do not enter actual card details.</span>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProviderDashboard;
