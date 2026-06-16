import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  Bed,
  ClipboardList,
  LayoutDashboard,
  Building2,
  Users,
  LogOut,
  UserCircle2
} from 'lucide-react';
import useHospitalAuthStore from '../../store/useHospitalAuthStore';
import './HospitalLayout.css';

const HospitalLayout = () => {
  const { user, isAuthenticated, loginAs, logout } = useHospitalAuthStore();
  const navigate = useNavigate();

  // If not authenticated, we'll show a mock login screen right here
  // In a real app, you'd probably redirect to a /hospital/login route
  if (!isAuthenticated) {
    return (
      <div className="hospital-mock-login">
        <div className="login-card">
          <div className="login-header">
            <Building2 className="login-icon" />
            <h2>Hospital Portal Login</h2>
            <p>Select a role to continue</p>
          </div>
          <div className="login-actions">
            <button 
              className="btn btn-admin"
              onClick={() => {
                loginAs('HOSPITAL_ADMIN');
                navigate('/hospital/admin/dashboard');
              }}
            >
              Log in as Admin
            </button>
            <button 
              className="btn btn-staff"
              onClick={() => {
                loginAs('HOSPITAL_STAFF');
                navigate('/hospital/staff/radar');
              }}
            >
              Log in as Staff
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'HOSPITAL_ADMIN';

  const adminLinks = [
    { to: '/hospital/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Admin Dashboard' },
    { to: '/hospital/admin/profile', icon: <Building2 size={20} />, label: 'Hospital Profile' },
    { to: '/hospital/admin/staff', icon: <Users size={20} />, label: 'Staff Management' },
  ];

  const staffLinks = [
    { to: '/hospital/staff/radar', icon: <Activity size={20} />, label: 'Live ER Radar' },
    { to: '/hospital/staff/beds', icon: <Bed size={20} />, label: 'Bed Controller' },
    { to: '/hospital/staff/handover', icon: <ClipboardList size={20} />, label: 'Handover Logs' },
  ];

  const links = isAdmin ? adminLinks : staffLinks;

  const handleLogout = () => {
    logout();
    navigate('/hospital');
  };

  return (
    <div className="hospital-layout">
      {/* Sidebar */}
      <aside className="hospital-sidebar">
        <div className="sidebar-header">
          <Building2 className="sidebar-logo" />
          <div className="sidebar-brand">
            <span className="brand-name">{user?.hospitalName}</span>
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
      <main className="hospital-main">
        <div className="main-content-wrapper">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default HospitalLayout;
