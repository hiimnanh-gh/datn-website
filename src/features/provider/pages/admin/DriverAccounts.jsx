import React, { useState } from 'react';
import { Shield, ToggleLeft, ToggleRight, Search, Plus } from 'lucide-react';

const INITIAL_DRIVERS = [
  { id: 'DRV-101', name: 'Nguyễn Văn Hùng', phone: '0912345678', badge: 'BADGE-9881', status: 'Active', rating: 4.9, activeMission: 'EMS-102' },
  { id: 'DRV-102', name: 'Trần Minh Tâm', phone: '0938765432', badge: 'BADGE-2761', status: 'Active', rating: 4.8, activeMission: 'None' },
  { id: 'DRV-103', name: 'Phan Hoài Nam', phone: '0987654321', badge: 'BADGE-3551', status: 'Inactive', rating: 4.5, activeMission: 'None' },
];

const DriverAccounts = () => {
  const [drivers, setDrivers] = useState(INITIAL_DRIVERS);
  const [search, setSearch] = useState('');

  const toggleStatus = (id) => {
    setDrivers(drivers.map(d => d.id === id ? { ...d, status: d.status === 'Active' ? 'Inactive' : 'Active' } : d));
  };

  const filtered = drivers.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.badge.includes(search));

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-wider text-white">DRIVER ACCOUNTS</h1>
          <p className="text-slate-400 text-xs mt-1">Manage driver credentials, access control, and live status.</p>
        </div>
        <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all font-mono">
          <Plus size={16} />
          ADD DRIVER
        </button>
      </div>

      <div className="flex items-center gap-2 bg-slate-950 border border-slate-850 p-2.5 rounded-xl mb-6">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search by driver name or badge number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-slate-200 outline-none text-sm w-full"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest font-mono">
              <th className="py-3 px-4">Driver ID</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Badge Number</th>
              <th className="py-3 px-4">Contact</th>
              <th className="py-3 px-4">Rating</th>
              <th className="py-3 px-4">Active Mission</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((drv) => (
              <tr key={drv.id} className="border-b border-slate-855 hover:bg-slate-850/30 transition-colors">
                <td className="py-4 px-4 font-mono font-bold text-blue-400">{drv.id}</td>
                <td className="py-4 px-4 font-semibold text-slate-200">{drv.name}</td>
                <td className="py-4 px-4 font-mono">{drv.badge}</td>
                <td className="py-4 px-4 text-slate-400">{drv.phone}</td>
                <td className="py-4 px-4 text-yellow-400">★ {drv.rating}</td>
                <td className="py-4 px-4">
                  {drv.activeMission !== 'None' ? (
                    <span className="bg-red-950/60 border border-red-900 text-red-400 font-mono px-2 py-0.5 rounded">
                      {drv.activeMission}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-mono">Idle</span>
                  )}
                </td>
                <td className="py-4 px-4">
                  <button onClick={() => toggleStatus(drv.id)} className="flex items-center gap-1.5 focus:outline-none">
                    {drv.status === 'Active' ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                        <ToggleRight className="text-emerald-500" size={24} />
                        Active
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center gap-1 font-semibold">
                        <ToggleLeft className="text-slate-500" size={24} />
                        Inactive
                      </span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DriverAccounts;
