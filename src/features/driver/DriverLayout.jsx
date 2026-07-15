import React from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { LogOut, Activity, Truck } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

const DriverLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated || user?.role !== 'DRIVER') {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start p-0 font-sans text-slate-100">
      {/* Container simulating a mobile device width */}
      <div className="w-full max-w-md min-h-screen bg-slate-900 border-x border-slate-800 flex flex-col shadow-2xl relative">
        {/* Mobile Header */}
        <header className="bg-slate-950 border-b border-slate-850 h-16 flex items-center justify-between px-4 shrink-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center shadow-lg">
              <Truck size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-wider font-mono text-white">DRIVER PORTAL</h1>
              <span className="text-[9px] text-amber-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                GPS TRANSMITTING
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            title="Logout" 
            className="p-2 text-red-500 hover:bg-slate-850 rounded-lg transition-all"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 flex flex-col overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
