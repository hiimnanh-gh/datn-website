import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/useAuthStore';
import useTopbarStore from '../../../store/useTopbarStore';

/* ── Route → Page title mapping ─────────────────────────── */
const PAGE_META = {
  '/admin/dashboard': { title: 'Dashboard',     icon: 'dashboard',    desc: 'System overview & real-time metrics' },
  '/admin/dispatch':  { title: 'Live Dispatch',  icon: 'emergency',    desc: 'Real-time incident management' },
  '/admin/tracking':  { title: 'Unit Tracking',  icon: 'location_on',  desc: 'Live GPS monitoring' },
  '/admin/incidents': { title: 'Incident Logs',  icon: 'assignment',   desc: 'Historical incident records' },
  '/admin/personnel': { title: 'Personnel',      icon: 'groups',       desc: 'Staff management' },
  '/admin/analytics': { title: 'Analytics',      icon: 'monitoring',   desc: 'Performance insights' },
  '/admin/settings':  { title: 'Settings',       icon: 'settings',     desc: 'System configuration' },
  '/admin/support':   { title: 'Help & Support', icon: 'help',         desc: 'Documentation & tickets' },
  '/admin/profile':   { title: 'My Profile',     icon: 'person',       desc: 'View & manage your profile' },
};

/* ── Search index (navigable shortcuts) ─────────────────── */
const SEARCH_INDEX = [
  { label: 'Dashboard',     desc: 'System overview',          icon: 'dashboard',    to: '/admin/dashboard' },
  { label: 'Live Dispatch', desc: 'Manage active incidents',  icon: 'emergency',    to: '/admin/dispatch' },
  { label: 'Unit Tracking', desc: 'GPS fleet map',            icon: 'location_on',  to: '/admin/tracking' },
  { label: 'Incident Logs', desc: 'View past incidents',      icon: 'assignment',   to: '/admin/incidents' },
  { label: 'Personnel',     desc: 'Staff list & profiles',    icon: 'groups',       to: '/admin/personnel' },
  { label: 'Analytics',     desc: 'Charts & reports',         icon: 'monitoring',   to: '/admin/analytics' },
  { label: 'Settings',      desc: 'System configuration',     icon: 'settings',     to: '/admin/settings' },
  { label: 'Support',       desc: 'Help & tickets',           icon: 'help',         to: '/admin/support' },
  { label: 'My Profile',    desc: 'Admin profile info',       icon: 'person',       to: '/admin/profile' },
  { label: 'Add Personnel', desc: 'Create a new staff member',icon: 'person_add',   to: '/admin/personnel' },
  { label: 'Export Report', desc: 'Download incident report', icon: 'download',     to: '/admin/incidents' },
];

/* ── Mock notifications ─────────────────────────────────── */
const INITIAL_NOTIFS = [
  { id: 1, type: 'CRITICAL', icon: 'warning',           color: 'text-red-400 bg-red-900/30',    title: 'Critical incident — Q.1', body: 'Cardiac arrest · AMB-07 dispatched', time: '2 min ago', read: false },
  { id: 2, type: 'DISPATCH', icon: 'local_shipping',     color: 'text-indigo-400 bg-indigo-900/30',  title: 'AMB-12 arrived on scene', body: 'Incident EMS-1103 · Q.1',           time: '8 min ago', read: false },
  { id: 3, type: 'SYSTEM',   icon: 'check_circle',       color: 'text-emerald-400 bg-emerald-900/30',title: 'DB Backup completed',     body: '1.4 GB archived successfully',       time: '15 min ago', read: false },
  { id: 4, type: 'ALERT',    icon: 'speed',              color: 'text-amber-400 bg-amber-900/30',title: 'High latency detected',   body: 'Node-Alpha: 118 ms — auto-scaling',  time: '32 min ago', read: true },
  { id: 5, type: 'INFO',     icon: 'person',             color: 'text-purple-400 bg-purple-900/30', title: 'New staff onboarded', body: 'Nguyễn Thị Bích — Role: Driver',    time: '1h ago', read: true },
];

/* ── Utility hook: close on outside click ───────────────── */
function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) callback(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
}

/* ── Search Dropdown ────────────────────────────────────── */
const SearchDropdown = ({ query, onNavigate }) => {
  const results = query.length > 0
    ? SEARCH_INDEX.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
      )
    : SEARCH_INDEX.slice(0, 5);

  if (results.length === 0) return (
    <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 z-50 p-4 text-center">
      <span className="material-symbols-outlined text-slate-600 text-[36px] block mb-1">search_off</span>
      <p className="text-[13px] text-slate-500">No results for "<span className="font-semibold text-white">{query}</span>"</p>
    </div>
  );

  return (
    <div className="absolute top-full left-0 mt-2 w-80 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 z-50 overflow-hidden">
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider px-4 pt-3 pb-1">
        {query ? `Results for "${query}"` : 'Quick Navigation'}
      </p>
      <div className="pb-2">
        {results.map(r => (
          <button key={r.to + r.label} onClick={() => onNavigate(r.to)}
            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left">
            <div className="w-8 h-8 rounded-lg bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-indigo-400 text-[16px]">{r.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-white">{r.label}</p>
              <p className="text-[11px] text-slate-500 truncate">{r.desc}</p>
            </div>
            <span className="material-symbols-outlined text-slate-600 text-[16px] ml-auto flex-shrink-0">arrow_forward</span>
          </button>
        ))}
      </div>
    </div>
  );
};

/* ── Notifications Dropdown ─────────────────────────────── */
const NotificationsDropdown = ({ notifs, onMarkAllRead, onMarkRead }) => (
  <div className="absolute right-0 top-full mt-2 w-96 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 z-50 overflow-hidden">
    {/* Header */}
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
      <div className="flex items-center gap-2">
        <h4 className="font-bold text-white text-[14px]">Notifications</h4>
        {notifs.filter(n => !n.read).length > 0 && (
          <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {notifs.filter(n => !n.read).length}
          </span>
        )}
      </div>
      <button onClick={onMarkAllRead}
        className="text-[11px] text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
        Mark all read
      </button>
    </div>
    {/* List */}
    <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
      {notifs.map(n => (
        <button key={n.id} onClick={() => onMarkRead(n.id)}
          className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-slate-800 ${!n.read ? 'bg-indigo-900/20' : ''}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${n.color}`}>
            <span className="material-symbols-outlined text-[17px]" style={{ fontVariationSettings: "'FILL' 1" }}>{n.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`text-[13px] font-semibold truncate ${!n.read ? 'text-white' : 'text-slate-400'}`}>{n.title}</p>
              {!n.read && <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />}
            </div>
            <p className="text-[11px] text-slate-500 truncate">{n.body}</p>
            <p className="text-[10px] text-slate-600 mt-0.5">{n.time}</p>
          </div>
        </button>
      ))}
    </div>
    {/* Footer */}
    <div className="px-5 py-3 border-t border-slate-800 bg-slate-900/50">
      <button className="w-full text-center text-[12px] text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
        View All Notifications →
      </button>
    </div>
  </div>
);

/* ── User Menu Dropdown ──────────────────────────────────── */
const UserMenuDropdown = ({ user, onLogout, onClose }) => {
  const navigate = useNavigate();
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : 'AD';

  const items = [
    { icon: 'person', label: 'My Profile', action: () => { navigate('/admin/profile'); onClose(); } },
    { icon: 'settings', label: 'Settings', action: () => { navigate('/admin/settings'); onClose(); } },
    { icon: 'help', label: 'Help & Support', action: () => { navigate('/admin/support'); onClose(); } },
  ];

  return (
    <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 rounded-2xl shadow-xl border border-slate-800 z-50 overflow-hidden">
      {/* Profile header */}
      <div className="px-5 py-4 border-b border-slate-800 bg-gradient-to-br from-slate-800 to-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-[16px] flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-white font-bold text-[14px] truncate">{user?.name || 'Admin'}</p>
            <p className="text-slate-400 text-[11px] truncate">{user?.email || 'admin@ems.vn'}</p>
            <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-900/30 text-indigo-300">
              {user?.role || 'ADMIN'}
            </span>
          </div>
        </div>
      </div>
      {/* Menu items */}
      <div className="py-2">
        {items.map(item => (
          <button key={item.label} onClick={item.action}
            className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-500 text-[18px]">{item.icon}</span>
            <span className="text-[13px] text-slate-300 font-medium">{item.label}</span>
          </button>
        ))}
      </div>
      {/* Divider + Logout */}
      <div className="border-t border-slate-800 py-2">
        <button onClick={onLogout}
          className="w-full flex items-center gap-3 px-5 py-2.5 text-left hover:bg-red-900/20 transition-colors group">
          <span className="material-symbols-outlined text-slate-500 group-hover:text-red-400 text-[18px] transition-colors">logout</span>
          <span className="text-[13px] text-slate-300 group-hover:text-red-400 font-medium transition-colors">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

/* ── Main AdminTopbar ────────────────────────────────────── */
const AdminTopbar = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  /* State */
  const [searchVal, setSearchVal]         = useState('');
  const [searchOpen, setSearchOpen]       = useState(false);
  const [notifOpen, setNotifOpen]         = useState(false);
  const [userMenuOpen, setUserMenuOpen]   = useState(false);
  const [notifs, setNotifs]               = useState(INITIAL_NOTIFS);

  /* Refs for outside-click */
  const searchRef  = useRef(null);
  const notifRef   = useRef(null);
  const userRef    = useRef(null);

  useOutsideClick(searchRef,  () => setSearchOpen(false));
  useOutsideClick(notifRef,   () => setNotifOpen(false));
  useOutsideClick(userRef,    () => setUserMenuOpen(false));

  /* Close dropdowns on route change */
  useEffect(() => {
    setSearchOpen(false);
    setNotifOpen(false);
    setUserMenuOpen(false);
    setSearchVal('');
  }, [location.pathname]);

  /* Derived */
  const pageMeta   = PAGE_META[location.pathname] || { title: 'Admin', icon: 'admin_panel_settings', desc: '' };
  const unreadCount = notifs.filter(n => !n.read).length;
  const slot        = useTopbarStore((s) => s.slot);
  const initials    = user?.name
    ? user.name.split(' ').map(w => w[0]).slice(-2).join('').toUpperCase()
    : 'AD';

  /* Handlers */
  const handleMarkAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const handleMarkRead    = (id) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const handleSearchNav = (to) => {
    navigate(to);
    setSearchVal('');
    setSearchOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-sm flex justify-between items-center px-4 sm:px-6 w-full flex-shrink-0">

      {/* ── LEFT ── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button onClick={onMenuClick}
          className="md:hidden text-slate-300 hover:bg-slate-800 p-2 rounded-full transition-colors flex-shrink-0">
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Page title (dynamic) */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="hidden sm:flex w-8 h-8 rounded-lg bg-indigo-900/30 items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-indigo-400 text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}>
              {pageMeta.icon}
            </span>
          </div>
          <div className="min-w-0">
            <h2 className="text-[17px] font-bold text-white leading-tight truncate">{pageMeta.title}</h2>
            {pageMeta.desc && (
              <p className="text-[10px] text-slate-500 hidden lg:block truncate">{pageMeta.desc}</p>
            )}
          </div>
        </div>

        {/* Per-page contextual slot */}
        {slot && (
          <div className="hidden md:flex items-center gap-2 ml-5 pl-5 border-l border-slate-800 h-full">
            {slot}
          </div>
        )}
      </div>

      {/* ── RIGHT ── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Search */}
        <div ref={searchRef} className="relative hidden sm:block">
          <div
            className={`flex items-center gap-2 bg-slate-800 rounded-full px-3.5 py-2 transition-all duration-200 cursor-text
              ${searchOpen ? 'ring-2 ring-indigo-500 bg-slate-900 w-64' : 'w-44 hover:bg-slate-700'}`}
            onClick={() => setSearchOpen(true)}>
            <span className="material-symbols-outlined text-slate-500 text-[17px] flex-shrink-0">search</span>
            <input
              type="text"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              placeholder={searchOpen ? 'Search pages, actions…' : 'Search…'}
              className="bg-transparent border-none outline-none text-[13px] text-white placeholder-slate-500 w-full focus:ring-0 p-0"
            />
            {searchVal && (
              <button onClick={(e) => { e.stopPropagation(); setSearchVal(''); }}
                className="text-slate-500 hover:text-slate-300 flex-shrink-0">
                <span className="material-symbols-outlined text-[15px]">close</span>
              </button>
            )}
          </div>
          {searchOpen && (
            <SearchDropdown query={searchVal} onNavigate={handleSearchNav} />
          )}
        </div>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="relative p-2 text-slate-400 hover:bg-slate-800 rounded-full transition-colors">
            <span className="material-symbols-outlined text-[22px]"
              style={notifOpen ? { fontVariationSettings: "'FILL' 1" } : {}}>
              notifications
            </span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 border-2 border-slate-900">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <NotificationsDropdown
              notifs={notifs}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
            />
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-800 mx-1 hidden sm:block" />

        {/* User avatar + menu */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className={`flex items-center gap-2.5 pl-1 pr-3 py-1.5 rounded-full transition-all hover:bg-slate-800
              ${userMenuOpen ? 'bg-slate-800' : ''}`}>
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0 shadow-sm">
              {initials}
            </div>
            {/* Name (desktop) */}
            <div className="hidden lg:block text-left">
              <p className="text-[13px] font-semibold text-white leading-none">{user?.name || 'Admin'}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{user?.role || 'ADMIN'}</p>
            </div>
            <span className={`material-symbols-outlined text-slate-500 text-[18px] hidden lg:block transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          {userMenuOpen && (
            <UserMenuDropdown
              user={user}
              onLogout={handleLogout}
              onClose={() => setUserMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
