import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { authService } from '../../services/authService';

/* ─── inline styles that can't be expressed cleanly in Tailwind ─── */
const styles = {
  body: {
    backgroundColor: '#0F172A',
    overflow: 'hidden',
  },
  radarGrid: {
    position: 'fixed',
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(59,130,246,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(59,130,246,0.05) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  radarSweep: {
    position: 'fixed',
    left: 0,
    right: 0,
    height: '100vh',
    background:
      'linear-gradient(0deg, transparent 0%, rgba(59,130,246,0.08) 50%, transparent 100%)',
    animation: 'sweep 8s linear infinite',
    zIndex: 1,
    pointerEvents: 'none',
  },
  authCard: {
    boxShadow: '0 25px 50px -12px rgba(15,23,42,0.5)',
    zIndex: 10,
    position: 'relative',
  },
};

/* ─── keyframes injected once via a <style> tag ─── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

    @keyframes sweep {
      0%   { top: -100vh; }
      100% { top: 100vh;  }
    }
    @keyframes spin-slow {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }

    .font-inter   { font-family: 'Inter', sans-serif; }
    .font-mono-jb { font-family: 'JetBrains Mono', monospace; }

    .glow-button:hover {
      box-shadow: 0 0 20px rgba(59,130,246,0.4);
    }

    /* custom input focus ring colour */
    .input-field:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(59,130,246,0.4);
    }
  `}</style>
);

/* ─── Animated SVG Logo ─── */
const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" className="h-16 w-auto">
    <rect width="100" height="100" rx="20" fill="#0F172A" />
    <path d="M50 20V80M20 50H80" stroke="#3B82F6" strokeWidth="8" strokeLinecap="round" />
    <path
      d="M35 35L25 25M65 35L75 25M35 65L25 75M65 65L75 75"
      stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" opacity="0.6"
    />
    <circle
      cx="50" cy="50" r="15"
      stroke="white" strokeWidth="2" strokeDasharray="4 4"
      style={{ animation: 'spin-slow 10s linear infinite', transformOrigin: '50px 50px' }}
    />
  </svg>
);

/* ─── Reusable Input ─── */
const InputField = ({ id, label, type = 'text', placeholder, value, onChange, icon }) => (
  <div className="space-y-1.5">
    <label htmlFor={id} className="block text-xs font-bold tracking-widest uppercase text-slate-500 font-mono-jb">
      {label}
    </label>
    <div className="relative">
      {icon && (
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px] select-none">
          {icon}
        </span>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`
          input-field w-full rounded-lg border border-slate-200 bg-white
          py-3 text-sm text-slate-800 placeholder-slate-400
          transition-all duration-200
          ${icon ? 'pl-10 pr-4' : 'px-4'}
        `}
      />
    </div>
  </div>
);

/* ─── Main Login Page ─── */
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('sessionExpired') === 'true') {
      setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Please enter your credentials.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const resData = await authService.login(username, password);
      
      if (resData.code && resData.code !== 200) {
        setError(resData.message || 'Login failed.');
        setIsLoading(false);
        return;
      }

      const authData = resData.data || resData;
      const { accessToken, refreshToken, fullName, roles } = authData;

      // Extract array of role names from BE (e.g. ["DISPATCHER"], ["PROVIDER_ADMIN"], ["ADMIN"])
      const roleNames = (roles || []).map(r => (typeof r === 'object' ? (r.name || r.authority || '') : String(r)));

      // Keep exact role from BE without converting PROVIDER_ADMIN to PROVIDER
      let primaryRole = roleNames[0] || 'REPORTER';
      if (roleNames.includes('PROVIDER_ADMIN')) {
        primaryRole = 'PROVIDER_ADMIN';
      } else if (roleNames.includes('PROVIDER')) {
        primaryRole = 'PROVIDER';
      } else if (roleNames.includes('ADMIN') || roleNames.includes('ROLE_ADMIN') || roleNames.includes('SYSTEM_ADMIN')) {
        primaryRole = 'ADMIN';
      } else if (roleNames.includes('DISPATCHER')) {
        primaryRole = 'DISPATCHER';
      } else if (roleNames.includes('DRIVER')) {
        primaryRole = 'DRIVER';
      }

      login(
        { role: primaryRole, name: fullName || username, ...authData },
        accessToken,
        refreshToken
      );

      if (primaryRole === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (primaryRole === 'PROVIDER' || primaryRole === 'PROVIDER_ADMIN') {
        navigate('/provider/fleet');
      } else if (primaryRole === 'DISPATCHER') {
        navigate('/dispatcher/dispatch-requests');
      } else if (primaryRole === 'DRIVER') {
        navigate('/driver/mission');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMsg = err.response?.data?.message || 'Invalid username or password.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />

      {/* ── Background layers ── */}
      <div style={styles.radarGrid} />
      <div style={styles.radarSweep} />

      {/* ── Material Icons (CDN) ── */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />

      {/* ── Page wrapper ── */}
      <div
        className="font-inter relative flex min-h-screen items-center justify-center p-4"
        style={{ backgroundColor: '#0F172A' }}
      >
        {/* ── Auth Card ── */}
        <div
          className="w-full max-w-[480px] overflow-hidden rounded-xl bg-white transition-all duration-300"
          style={styles.authCard}
        >
          {/* ── Header ── */}
          <div className="px-8 pb-6 pt-10 text-center">
            <div className="mb-6 flex justify-center">
              <Logo />
            </div>

            <h1 className="text-[32px] font-bold leading-[40px] tracking-tight text-slate-900">
              Unified Access Portal
            </h1>
            <p className="mt-2 text-[16px] text-slate-500">
              Secure access for authorised personnel only
            </p>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleLogin} className="space-y-4 px-8 pb-4 pt-6">
            <InputField
              id="username"
              label="Username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon="person"
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon="lock"
            />

            {/* Remember / Forgot row */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-500 select-none">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600"
                />
                Remember me
              </label>
              <span onClick={() => navigate('/forgot-password')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer">
                Forgot password?
              </span>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="btn-login"
              type="submit"
              disabled={isLoading}
              className={`
                glow-button mt-2 w-full rounded-lg bg-slate-900 py-3.5
                text-sm font-bold tracking-widest uppercase text-white
                transition-all duration-200 hover:bg-slate-800
                font-mono-jb ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <span className="material-symbols-outlined mr-2 align-middle text-[16px] animate-spin">
                  sync
                </span>
              ) : (
                <span className="material-symbols-outlined mr-2 align-middle text-[16px]">
                  shield_lock
                </span>
              )}
              {isLoading ? 'Authenticating...' : 'Authenticate'}
            </button>
            <div className="mt-4 text-center">
              <span className="text-sm text-slate-500">Don't have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Register here
              </button>
            </div>
          </form>

          {/* ── Footer ── */}
          <div className="px-8 pb-8 pt-2 text-center">
            <p className="text-xs text-slate-400 font-mono-jb">
              SEMD SYSTEM &nbsp;·&nbsp; SECURE CHANNEL &nbsp;·&nbsp;{' '}
              <span className="inline-flex items-center gap-1 text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                ONLINE
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
