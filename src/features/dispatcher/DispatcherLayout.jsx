import React from 'react';
import { Outlet, Navigate, NavLink } from 'react-router-dom';
import { ShieldAlert, Truck, Map } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import AppLogo from '../../components/AppLogo';

const NAV_ITEMS = [
  { to: '/dispatcher/dispatch-requests', icon: ShieldAlert, label: 'Tiếp nhận & Điều phối (SOS)', hasBadge: true },
  { to: '/dispatcher/dispatch-resources',icon: Truck,       label: 'Tài nguyên xe & Tài xế' },
  { to: '/dispatcher/dispatch-map',      icon: Map,         label: 'Bản đồ điều phối Live' },
];

const DispatcherLayout = () => {
  const { user, isAuthenticated } = useAuthStore();

  const userRole = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : '');
  const userRoles = Array.isArray(user?.roles) ? user.roles : [userRole];
  const isDispatcher = userRoles.some(r => ['DISPATCHER', 'ADMIN'].includes(r?.toUpperCase()));

  if (!isAuthenticated || !isDispatcher) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Compact Slim Icon-Only Sidebar */}
      <aside
        className="w-16 h-screen bg-slate-900 border-r border-slate-800/80 shadow-2xl flex flex-col items-center py-4 px-2 shrink-0 z-50 select-none"
      >
        {/* Brand Logo Header (Icon only) */}
        <div className="mb-4 flex flex-col items-center" title="SmartEMS Dispatch Center">
          <AppLogo size={32} showText={false} textLight />
        </div>

        {/* Live Indicator Dot */}
        <div className="mb-5 flex items-center justify-center" title="Dispatcher Live System">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
        </div>

        {/* Navigation Icons */}
        <nav className="flex-1 flex flex-col gap-3 w-full items-center font-sans">
          {NAV_ITEMS.map(({ to, icon: IconComponent, label, hasBadge }) => (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={({ isActive }) =>
                `group relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-red-600 text-white font-semibold shadow-lg shadow-red-600/30 border border-red-500/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <IconComponent 
                    size={20} 
                    className={`transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`} 
                  />

                  {/* Red badge dot indicator */}
                  {hasBadge && (
                    <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500 ring-2 ring-slate-900"></span>
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
