import React, { useState } from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Building2,
  Wallet,
  X,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import HeaderUserProfile from '../../components/HeaderUserProfile';
import AppLogo from '../../components/AppLogo';

const NAV_ITEMS = [
  { to: '/provider/fleet',     icon: Truck,           label: 'Quản lý Đội xe (Fleet)' },
  { to: '/provider/finance',   icon: Wallet,          label: 'Tài chính & Ví tài xế' },
  { to: '/provider/dashboard', icon: LayoutDashboard, label: 'Tổng quan Vận hành' },
];

const ProviderLayout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!isAuthenticated || (user?.role !== 'PROVIDER' && user?.role !== 'PROVIDER_ADMIN' && user?.role !== 'ADMIN')) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = () => {
    if (location.pathname.includes('/provider/fleet')) return 'Quản lý Đội xe Cấp cứu';
    if (location.pathname.includes('/provider/finance')) return 'Tài chính & Quản lý Ví Đội xe';
    if (location.pathname.includes('/provider/dashboard')) return 'Tổng quan Vận hành Đơn vị';
    if (location.pathname.includes('/provider/profile')) return 'Thông tin Đơn vị & Tài khoản';
    return 'Cổng Thông tin Đơn vị Cấp cứu';
  };

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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px]">Provider Unit</span>
          </div>
          <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/50 font-bold">
            FLEET
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto font-sans">
          {NAV_ITEMS.map(({ to, icon: IconComponent, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/25 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <div className="flex items-center gap-3">
                  <IconComponent 
                    size={18} 
                    className={`transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`} 
                  />
                  <span className="text-[13px] tracking-wide">{label}</span>
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content with Top Header Bar */}
      <main className="provider-main flex flex-col flex-1 bg-slate-950 overflow-hidden">
        {/* Topbar Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 size={18} />
            </div>
            <div>
              <h1 className="font-bold text-base text-slate-100">{getPageTitle()}</h1>
              <p className="text-[11px] text-slate-400 font-mono">Provider Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <HeaderUserProfile profilePath="/provider/profile" />
          </div>
        </header>

        <div className="main-content-wrapper flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProviderLayout;
