import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import AdminSidebar from './components/AdminSidebar';
import AdminTopbar  from './components/AdminTopbar';

const AdminLayout = () => {
  const { user, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-[#f7f9fb] text-[#191c1e] overflow-hidden">
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
        <main className="flex-1 overflow-y-auto bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
