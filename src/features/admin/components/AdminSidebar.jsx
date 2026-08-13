import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Truck, 
  Map, 
  History, 
  LayoutDashboard, 
  Users, 
  Radio, 
  X,
  RadioTower,
  Building2,
  Layers,
  HardDrive
} from 'lucide-react';
import AppLogo from '../../../components/AppLogo';

const NAV_ITEMS = [
  { to: '/admin/dispatch-requests', icon: ShieldAlert,     label: 'Tiếp nhận & Điều phối', badge: 'SOS' },
  { to: '/admin/dispatch-resources',icon: Truck,           label: 'Tài nguyên điều phối' },
  { to: '/admin/dispatch-map',       icon: Map,             label: 'Bản đồ điều phối' },
  { to: '/admin/incidents',          icon: History,         label: 'Lịch sử điều phối' },
  { to: '/admin/dashboard',          icon: LayoutDashboard, label: 'Tổng quan vận hành' },
  { to: '/admin/users',              icon: Users,           label: 'Quản lý người dùng' },
  { to: '/admin/providers',          icon: Building2,       label: 'Quản lý Đơn vị' },
  { to: '/admin/hospitals',         icon: Building2,       label: 'Bệnh viện & TT Cấp cứu' },
  { to: '/admin/operation-zones',   icon: RadioTower,      label: 'Vùng hoạt động' },
  { to: '/admin/service-types',     icon: Layers,          label: 'Loại dịch vụ' },
  { to: '/admin/files',             icon: HardDrive,       label: 'Lưu trữ Tệp (MinIO)' },
];

const AdminSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();

  return (
    <>
      {/* Mobile Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        id="mobile-sidebar"
        className={`
          fixed left-0 top-0 h-screen w-[260px] z-50 
          bg-slate-900 border-r border-slate-800/80 shadow-2xl 
          flex flex-col py-5 px-3
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Brand Logo Header */}
        <div className="px-3 mb-6 flex items-center justify-between">
          <AppLogo size={36} showText textLight />
          <button 
            onClick={onClose} 
            className="md:hidden p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* System Active Status Pill */}
        <div className="mx-2 mb-5 px-3 py-2 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs font-sans">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px]">System Active</span>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-800/50">
            v2.4
          </span>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 space-y-1 overflow-y-auto font-sans">
          {NAV_ITEMS.map(({ to, icon: IconComponent, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/90 text-white font-semibold shadow-lg shadow-indigo-600/25 border border-indigo-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <IconComponent 
                      size={18} 
                      className={`transition-colors ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`} 
                    />
                    <span className="text-[13px] tracking-wide">{label}</span>
                  </div>

                  {badge && (
                    <span className="text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40 px-1.5 py-0.2 rounded">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom CTA Button */}
        <div className="mt-auto pt-4 border-t border-slate-800/80 px-1">
          <button
            onClick={() => {
              navigate('/admin/dispatch-requests');
              if (onClose) onClose();
            }}
            className="w-full bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-[13px] py-2.5 px-4 rounded-xl shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 transition-all active:scale-95 border border-red-500/30"
          >
            <RadioTower size={17} className="animate-pulse" />
            <span>Điều phối Khẩn cấp</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
