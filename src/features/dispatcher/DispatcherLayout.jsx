import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { ShieldAlert, Truck, Map, X } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import AppLogo from '../../components/AppLogo';

const NAV_ITEMS = [
  { to: '/dispatcher/dispatch-requests', icon: ShieldAlert, label: 'Tiếp nhận & Điều phối', badge: 'SOS' },
  { to: '/dispatcher/dispatch-resources',icon: Truck,       label: 'Tài nguyên xe & Tài xế' },
  { to: '/dispatcher/dispatch-map',      icon: Map,         label: 'Bản đồ điều phối Live' },
];

const DispatcherLayout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated || (user?.role !== 'DISPATCHER' && user?.role !== 'ADMIN')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Unified Full Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 h-screen w-[260px] z-50 
          bg-slate-900 border-r border-slate-800/80 shadow-2xl 
          flex flex-col py-5 px-3 shrink-0
          transition-transform duration-300 ease-in-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
        `}
      >
        {/* Brand Logo Header */}
        <div className="px-3 mb-6 flex items-center justify-between">
          <AppLogo size={36} showText textLight />
          <button 
            onClick={() => setMobileOpen(false)} 
            className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* System Active Status Pill */}
        <div className="mx-2 mb-5 px-3 py-2 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px]">Dispatcher Live</span>
          </div>
          <span className="text-[10px] font-mono text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-800/50 font-bold">
            SOS
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto font-sans">
          {NAV_ITEMS.map(({ to, icon: IconComponent, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold shadow-lg shadow-red-600/25 border border-red-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <IconComponent 
                      size={18} 
                      className={`transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`} 
                    />
                    <span className="text-[13px] tracking-wide">{label}</span>
                  </div>

                  {badge && (
                    <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.2 rounded">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-slate-950 min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DispatcherLayout;
