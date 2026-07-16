import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    otpCode: '123456' // mock OTP pre-filled for easy testing
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.username || !formData.password || !formData.fullName || !formData.phoneNumber) {
      setError('Please fill in all required fields.');
      return;
    }
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const resData = await authService.register(formData);
      
      if (resData.code && resData.code !== 200) {
        setError(resData.message || 'Registration failed.');
        setIsLoading(false);
        return;
      }
      
      setSuccess('Account registered successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <GlobalStyles />
      <div style={styles.radarGrid} />
      <div style={styles.radarSweep} />

      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
      />

      <div
        className="font-inter relative flex min-h-screen items-center justify-center p-4"
        style={{ backgroundColor: '#0F172A' }}
      >
        <div
          className="w-full max-w-[480px] overflow-hidden rounded-xl bg-white transition-all duration-300"
          style={styles.authCard}
        >
          <div className="px-8 pb-4 pt-8 text-center">
            <div className="mb-4 flex justify-center">
              <Logo />
            </div>

            <h1 className="text-[28px] font-bold leading-[36px] tracking-tight text-slate-900">
              Register Account
            </h1>
            <p className="mt-2 text-[14px] text-slate-500">
              Join the Unified Access Portal
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4 px-8 pb-4 pt-2">
            <InputField
              id="fullName"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              icon="badge"
            />
            
            <InputField
              id="username"
              label="Username"
              placeholder="Choose a username"
              value={formData.username}
              onChange={handleChange}
              icon="person"
            />

            <InputField
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••••"
              value={formData.password}
              onChange={handleChange}
              icon="lock"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <InputField
                id="phoneNumber"
                label="Phone Number"
                placeholder="Ex: 0987654321"
                value={formData.phoneNumber}
                onChange={handleChange}
                icon="call"
              />
              <InputField
                id="otpCode"
                label="OTP Code"
                placeholder="123456"
                value={formData.otpCode}
                onChange={handleChange}
                icon="pin"
              />
            </div>
            
            <InputField
              id="email"
              label="Email (Optional)"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              icon="mail"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {success}
              </div>
            )}

            <button
              id="btn-register"
              type="submit"
              disabled={isLoading || success}
              className={`
                glow-button mt-4 w-full rounded-lg bg-slate-900 py-3.5
                text-sm font-bold tracking-widest uppercase text-white
                transition-all duration-200 hover:bg-slate-800
                font-mono-jb ${(isLoading || success) ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <span className="material-symbols-outlined mr-2 align-middle text-[16px] animate-spin">
                  sync
                </span>
              ) : (
                <span className="material-symbols-outlined mr-2 align-middle text-[16px]">
                  person_add
                </span>
              )}
              {isLoading ? 'Registering...' : 'Register'}
            </button>
            
            <div className="mt-4 text-center pb-2">
              <span className="text-sm text-slate-500">Already have an account? </span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Register;
