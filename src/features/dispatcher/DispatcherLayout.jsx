import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { LogOut, Activity, Truck, Map, User } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const navItems = [
  { to: '/dispatcher/dispatch-requests', icon: <Activity size={22} />, title: 'Tiếp nhận & Điều phối' },
  { to: '/dispatcher/dispatch-resources',icon: <Truck size={22} />,    title: 'Tài nguyên điều phối' },
  { to: '/dispatcher/dispatch-map',      icon: <Map size={22} />,      title: 'Bản đồ điều phối'     },
  { to: '/dispatcher/profile',           icon: <User size={22} />,     title: 'Hồ sơ cá nhân'        },
];

const DispatcherLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { pathname } = useLocation();

  if (!isAuthenticated || (user?.role !== 'DISPATCHER' && user?.role !== 'ADMIN')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden">
      {/* Slim Dark Sidebar */}
      <aside className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 shrink-0 z-30">
        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          <Activity size={24} className="text-white" />
        </div>

        <nav className="flex-1 flex flex-col gap-3">
          {navItems.map(({ to, icon, title }) => {
            const active = pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                title={title}
                className={`p-3 rounded-xl transition-all ${
                  active
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {icon}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={logout}
          title="Đăng xuất"
          className="p-3 text-red-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all mt-auto"
        >
          <LogOut size={22} />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative bg-slate-950">
        <Outlet />
      </main>
    </div>
  );
};

export default DispatcherLayout;
