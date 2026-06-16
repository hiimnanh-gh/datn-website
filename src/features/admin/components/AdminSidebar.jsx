import { NavLink, useNavigate } from 'react-router-dom';
import AppLogo from '../../../components/AppLogo';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: 'dashboard',    label: 'Dashboard',    fillActive: true },
  { to: '/admin/dispatch',  icon: 'emergency',    label: 'Live Dispatch'  },
  { to: '/admin/tracking',  icon: 'location_on',  label: 'Unit Tracking'  },
  { to: '/admin/incidents', icon: 'assignment',   label: 'Incident Logs'  },
  { to: '/admin/personnel', icon: 'groups',       label: 'Personnel'      },
  { to: '/admin/analytics', icon: 'monitoring',   label: 'Analytics'      },
];

const BOTTOM_LINKS = [
  { to: '/admin/settings', icon: 'settings', label: 'Settings' },
  { to: '/admin/support',  icon: 'help',     label: 'Support'  },
];

const AdminSidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const handleDispatchNow = () => navigate('/admin/dispatch');

  return (
    <>
      {/* ── Mobile Backdrop ── */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* ── Sidebar Panel ── */}
      <aside
        id="mobile-sidebar"
        className={`
          fixed left-0 top-0 h-screen w-[260px] z-50 
          bg-[#131b2e] shadow-xl 
          flex flex-col py-6
          transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* ── Brand header ── */}
        <div className="px-5 mb-8 flex items-center justify-between">
          <AppLogo size={40} showText textLight />
          <button
            onClick={onClose}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon, label, fillActive }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-3 px-4 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium shadow-sm transition-transform active:scale-95'
                  : 'flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200 rounded-lg font-medium active:scale-95'
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined text-[20px]"
                    style={isActive && fillActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {icon}
                  </span>
                  <span className="text-[14px]">
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* ── Bottom actions ── */}
        <div className="px-4 mt-auto pt-6 border-t border-white/10">
          <button
            onClick={handleDispatchNow}
            className="w-full bg-[#ba1a1a] text-white font-medium text-[14px] py-2.5 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 mb-6 shadow-md flex items-center justify-center gap-2 active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            Dispatch Now
          </button>
          
          <div className="space-y-1">
            {BOTTOM_LINKS.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  isActive
                    ? 'flex items-center gap-3 px-4 py-2.5 bg-[#2563eb] text-white rounded-lg font-medium'
                    : 'flex items-center gap-3 px-4 py-2.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors duration-200 rounded-lg font-medium'
                }
              >
                {({ isActive }) => (
                  <>
                    <span className="material-symbols-outlined text-[20px]">{icon}</span>
                    <span className="text-[14px]">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
