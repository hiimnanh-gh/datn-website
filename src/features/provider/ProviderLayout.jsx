import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Truck,
  Megaphone,
  RadioTower,
  LogOut,
  UserCircle2,
  Ambulance
} from 'lucide-react';
import useProviderAuthStore from '../../store/useProviderAuthStore';
import './ProviderLayout.css';

const ProviderLayout = () => {
  const { user, isAuthenticated, loginAs, logout } = useProviderAuthStore();
  const navigate = useNavigate();

  // Mock login screen fallback
  if (!isAuthenticated) {
    return (
      <div className="provider-mock-login">
        <div className="login-card">
          <div className="login-header">
            <Ambulance className="login-icon" />
            <h2>Provider Portal Login</h2>
            <p>Select a role to continue</p>
          </div>
          <div className="login-actions">
            <button 
              className="btn btn-admin"
              onClick={() => {
                loginAs('PROVIDER_ADMIN');
                navigate('/provider/admin/dashboard');
              }}
            >
              Log in as Admin
            </button>
            <button 
              className="btn btn-staff"
              onClick={() => {
                loginAs('PROVIDER_STAFF');
                navigate('/provider/staff/mission-control');
              }}
            >
              Log in as Dispatch Staff
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'PROVIDER_ADMIN';

  const adminLinks = [
    { to: '/provider/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Analytics Dashboard' },
    { to: '/provider/admin/fleet', icon: <Truck size={20} />, label: 'Fleet Management' },
    { to: '/provider/admin/marketing', icon: <Megaphone size={20} />, label: 'Promotions' },
  ];

  const staffLinks = [
    { to: '/provider/staff/mission-control', icon: <RadioTower size={20} />, label: 'Mission Control' },
  ];

  const links = isAdmin ? adminLinks : staffLinks;

  const handleLogout = () => {
    logout();
    navigate('/provider');
  };

  return (
    <div className="provider-layout">
      {/* Sidebar */}
      <aside className="provider-sidebar">
        <div className="sidebar-header">
          <Ambulance className="sidebar-logo" />
          <div className="sidebar-brand">
            <span className="brand-name">{user?.providerName}</span>
            <span className="brand-role">{isAdmin ? 'Admin Portal' : 'Staff Portal'}</span>
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
              <span className="user-name">{user?.name}</span>
              <span className="user-role-badge">{user?.role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Logout</span>
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
