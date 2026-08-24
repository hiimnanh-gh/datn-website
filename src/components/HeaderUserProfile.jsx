import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronDown, Shield, KeyRound } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';

function useOutsideClick(ref, callback) {
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, callback]);
}

const HeaderUserProfile = ({ profilePath = '/dispatcher/profile' }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useOutsideClick(menuRef, () => setIsOpen(false));

  const fullName = user?.fullName || user?.name || user?.username || 'Người dùng';
  const roleName = (user?.role || 'DISPATCHER').toUpperCase();
  const email = user?.email || `${user?.username || 'user'}@smartems.vn`;

  const initials = fullName
    ? fullName
        .split(' ')
        .filter(Boolean)
        .map((w) => w[0])
        .slice(-2)
        .join('')
        .toUpperCase()
    : 'US';

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleNavigateProfile = () => {
    setIsOpen(false);
    navigate(profilePath);
  };

  return (
    <div ref={menuRef} className="relative font-sans">
      {/* Profile Trigger Pill */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full transition-all border cursor-pointer ${
          isOpen
            ? 'bg-slate-800 border-indigo-500/50 shadow-md ring-2 ring-indigo-500/20'
            : 'bg-slate-900/90 border-slate-800 hover:bg-slate-800 hover:border-slate-700'
        }`}
        title="Tài khoản cá nhân"
      >
        {/* Avatar Circle */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-[12px] font-bold shadow-sm shrink-0 border border-indigo-400/30">
          {initials}
        </div>

        {/* User Info (Desktop) */}
        <div className="hidden sm:block text-left">
          <p className="text-[12px] font-bold text-slate-100 leading-none truncate max-w-[130px]">
            {fullName}
          </p>
          <span className="text-[9px] font-mono font-semibold text-indigo-400 block mt-0.5 tracking-wider">
            {roleName}
          </span>
        </div>

        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-white' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Card */}
          <div className="px-4 py-3.5 border-b border-slate-800 bg-gradient-to-br from-slate-850 to-slate-900">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-[14px] shrink-0 shadow-md">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-[13px] truncate">{fullName}</p>
                <p className="text-slate-400 text-[11px] truncate font-mono">{email}</p>
                <span className="inline-block mt-1 text-[9px] font-bold px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-800/60 text-indigo-300 font-mono">
                  {roleName}
                </span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1.5 text-xs">
            <button
              onClick={handleNavigateProfile}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
            >
              <User size={15} className="text-indigo-400" />
              <span>Hồ sơ cá nhân & Đổi mật khẩu</span>
            </button>
          </div>

          {/* Logout Section */}
          <div className="border-t border-slate-800 p-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer font-medium text-xs"
            >
              <LogOut size={15} />
              <span>Đăng xuất (Sign Out)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderUserProfile;
