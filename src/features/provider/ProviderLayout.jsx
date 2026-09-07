import React from 'react';
import { Outlet, NavLink, Navigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Building2,
  Wallet,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import HeaderUserProfile from '../../components/HeaderUserProfile';
import AppLogo from '../../components/AppLogo';

const NAV_ITEMS = [
  { to: '/provider/dashboard', icon: LayoutDashboard, label: 'Tổng quan Vận hành (Dashboard)' },
  { to: '/provider/fleet',     icon: Truck,           label: 'Quản lý Đội xe (Fleet)' },
  { to: '/provider/finance',   icon: Wallet,          label: 'Tài chính & Ví tài xế' },
];

const ProviderLayout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const location = useLocation();

  const userRole = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : '');
  const userRoles = Array.isArray(user?.roles) ? user.roles : [userRole];
  const isProvider = userRoles.some(r => ['PROVIDER', 'PROVIDER_ADMIN', 'ADMIN'].includes(r?.toUpperCase()));

  if (!isAuthenticated || !isProvider) {
    return <Navigate to="/login" replace />;
  }

  const getPageTitle = () => {
    if (location.pathname.includes('/provider/fleet')) return 'Quản lý Đội xe';
    if (location.pathname.includes('/provider/finance')) return 'Tài chính & Ví Đội xe';
    if (location.pathname.includes('/provider/dashboard')) return 'Tổng quan Vận hành';
    if (location.pathname.includes('/provider/profile')) return 'Thông tin Đơn vị';
    return 'Cổng Đơn vị Cấp cứu';
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Desktop Sidebar (hidden on mobile, bottom nav is used on mobile) */}
      <aside className="hidden md:flex flex-col w-[260px] bg-slate-900 border-r border-slate-800/80 shadow-2xl py-5 px-3 shrink-0 h-screen">
        {/* Brand Logo Header */}
        <div className="px-3 mb-6 flex items-center justify-between">
          <AppLogo size={34} showText textLight />
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
        <header className="h-14 sm:h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <Building2 size={18} />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-sm sm:text-base text-slate-100 truncate">{getPageTitle()}</h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono truncate hidden sm:block">Provider Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <HeaderUserProfile profilePath="/provider/profile" />
          </div>
        </header>

        {/* Scrollable Main Area (with bottom padding on mobile to clear bottom navigation) */}
        <div className="main-content-wrapper flex-1 overflow-y-auto pb-16 md:pb-0">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation Bar (md:hidden) for rapid thumb-friendly switching */}
        <nav 
          className="fixed bottom-0 left-0 right-0 h-14 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/90 flex items-center justify-around z-30 px-2 py-1 md:hidden select-none"
          aria-label="Mobile Bottom Navigation"
        >
          {NAV_ITEMS.map(({ to, icon: IconComponent, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-blue-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <IconComponent size={18} className={isActive ? 'text-blue-400 scale-110 transition-transform' : ''} />
                  <span className="truncate max-w-[85px] mt-0.5">
                    {to.includes('dashboard') ? 'Tổng quan' : to.includes('fleet') ? 'Đội xe' : 'Tài chính'}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </main>
    </div>
  );
};

export default ProviderLayout;
