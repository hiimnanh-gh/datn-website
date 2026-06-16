import { Outlet, Navigate, Link } from 'react-router-dom';
import { LogOut, LayoutDashboard, Truck } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

const AdminLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Light Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-slate-200 font-bold text-xl text-blue-600">
          SmartDispatch Admin
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link to="/admin/fleet" className="flex items-center gap-3 px-4 py-2 text-slate-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors">
            <Truck size={20} />
            Fleet Management
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <button onClick={logout} className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 rounded-md transition-colors">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold text-slate-800">Enterprise Control</h1>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
              {user.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
