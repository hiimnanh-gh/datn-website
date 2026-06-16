import { Outlet, Navigate, Link } from 'react-router-dom';
import { LogOut, Activity, Map } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const DispatcherLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated || user?.role !== 'DISPATCHER') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-mono">
      {/* Slim Dark Sidebar */}
      <aside className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          <Activity size={24} className="text-white" />
        </div>
        
        <nav className="flex-1 flex flex-col gap-6">
          <Link to="/dispatcher/hub" className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all" title="Dispatch Hub">
            <Activity size={24} />
          </Link>
          <Link to="/dispatcher/radar" className="p-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all" title="Live Radar">
            <Map size={24} />
          </Link>
        </nav>

        <button onClick={logout} className="p-3 text-red-500 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all mt-auto" title="Logout">
          <LogOut size={24} />
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

export default DispatcherLayout;
