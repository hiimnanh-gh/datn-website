import React from 'react';
import { Outlet, NavLink, useNavigate, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  LogOut,
  UserCircle2,
  Ambulance,
} from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';
import './ProviderLayout.css';

const ProviderLayout = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!isAuthenticated || (user?.role !== 'PROVIDER' && user?.role !== 'PROVIDER_ADMIN' && user?.role !== 'ADMIN')) {
    return <Navigate to="/login" replace />;
  }

  const links = [
    { to: '/provider/fleet', icon: <Truck size={20} />, label: 'Quản lý Đội xe (Fleet)' },
    { to: '/provider/dashboard', icon: <LayoutDashboard size={20} />, label: 'Tổng quan Vận hành' },
    { to: '/provider/profile', icon: <UserCircle2 size={20} />, label: 'Hồ sơ Cá nhân' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="provider-layout">
      {/* Sidebar */}
      <aside className="provider-sidebar">
        <div className="sidebar-header">
          <Ambulance className="sidebar-logo text-blue-500" />
          <div className="sidebar-brand">
            <span className="brand-name">{user?.fullName || user?.username || 'Provider Center'}</span>
            <span className="brand-role">Provider Portal</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <UserCircle2 size={24} className="user-avatar" />
            <div className="user-details">
              <span className="user-name">{user?.fullName || user?.username}</span>
              <span className="user-role-badge">{user?.role || 'PROVIDER_ADMIN'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="provider-main">
        <div className="main-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default ProviderLayout;
