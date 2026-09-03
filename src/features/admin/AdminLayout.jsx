import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar  from './components/AdminTopbar';

const AdminLayout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userRole = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : '');
  const isAdmin = userRole === 'ADMIN' || (Array.isArray(user?.roles) && user.roles.includes('ADMIN'));

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* ── Sidebar ── */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col md:pl-[260px] h-screen overflow-hidden">
        {/* ── Topbar ── */}
        <AdminTopbar onMenuClick={() => setSidebarOpen(true)} />

        {/* ── Scrollable page content ── */}
        <main className="flex-1 overflow-y-auto bg-slate-950">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
