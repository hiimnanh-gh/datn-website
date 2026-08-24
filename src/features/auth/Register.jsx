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
  // Steps: 1 (Send OTP to Phone), 2 (Enter OTP + Account info to Register)
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Vui lòng nhập số điện thoại.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const res = await authService.sendOtp(phoneNumber.trim());
      const otpReceived = res?.data || res?.message;
      setSuccess(
        otpReceived && typeof otpReceived === 'string' && otpReceived.length === 6
          ? `Mã OTP của bạn là: ${otpReceived}`
          : (res?.message || 'Mã OTP đã được gửi đến số điện thoại của bạn.')
      );
      if (otpReceived && typeof otpReceived === 'string' && otpReceived.length === 6) {
        setOtpCode(otpReceived);
      }
      setStep(2);
    } catch (err) {
      console.error('Send OTP error:', err);
      setError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại số điện thoại.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Register with OTP and Profile info
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP.');
      return;
    }
    if (!formData.username.trim() || !formData.password || !formData.fullName.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const payload = {
        username: formData.username.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        otpCode: otpCode.trim()
      };

      const resData = await authService.register(payload);
      
      if (resData.code && resData.code !== 200) {
        setError(resData.message || 'Đăng ký tài khoản thất bại.');
        setIsLoading(false);
        return;
      }
      
      setSuccess('Đăng ký tài khoản thành công! Đang chuyển hướng về trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      const errorMsg = err.response?.data?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại mã OTP hoặc thông tin đã nhập.';
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
          className="w-full max-w-[480px] overflow-hidden rounded-xl bg-white transition-all duration-300 shadow-2xl"
          style={styles.authCard}
        >
          {/* ── Header ── */}
          <div className="px-8 pb-4 pt-8 text-center">
            <div className="mb-4 flex justify-center">
              <Logo />
            </div>

            <h1 className="text-[28px] font-bold leading-[36px] tracking-tight text-slate-900">
              Đăng Ký Tài Khoản
            </h1>
            <p className="mt-2 text-[14px] text-slate-500">
              {step === 1 && 'Bước 1/2: Nhập số điện thoại để nhận mã OTP'}
              {step === 2 && 'Bước 2/2: Nhập mã OTP và thông tin tài khoản'}
            </p>
          </div>

          {/* Step 1: Send OTP Form */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} className="space-y-4 px-8 pb-4 pt-2">
              <InputField
                id="phoneNumber"
                label="Số Điện Thoại *"
                placeholder="Ví dụ: 0987654321"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                icon="call"
                required
              />

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="glow-button mt-4 w-full rounded-lg bg-slate-900 py-3.5 text-sm font-bold tracking-widest uppercase text-white transition-all duration-200 hover:bg-slate-800 font-mono-jb disabled:opacity-70"
              >
                {isLoading ? 'Đang gửi mã...' : 'Gửi mã xác thực OTP'}
              </button>
            </form>
          )}

          {/* Step 2: Enter OTP and Complete Registration Form */}
          {step === 2 && (
            <form onSubmit={handleRegister} className="space-y-4 px-8 pb-4 pt-2">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 font-mono flex items-center justify-between">
                <span>Số điện thoại: <strong className="text-slate-900">{phoneNumber}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Đổi số
                </button>
              </div>

              {success && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  {success}
                </div>
              )}

              <InputField
                id="otpCode"
                label="Mã OTP Xác Thực *"
                placeholder="Nhập mã 6 chữ số (Ví dụ: 123456)"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                icon="pin"
                required
              />

              <InputField
                id="fullName"
                label="Họ và Tên *"
                placeholder="Ví dụ: Nguyễn Văn A"
                value={formData.fullName}
                onChange={handleChange}
                icon="badge"
                required
              />
              
              <InputField
                id="username"
                label="Tên Đăng Nhập *"
                placeholder="Ví dụ: nguyenvana"
                value={formData.username}
                onChange={handleChange}
                icon="person"
                required
              />

              <InputField
                id="password"
                label="Mật Khẩu (Chữ số, ví dụ 123456) *"
                type="password"
                placeholder="123456"
                value={formData.password}
                onChange={handleChange}
                icon="lock"
                required
              />

              <InputField
                id="confirmPassword"
                label="Xác Nhận Mật Khẩu *"
                type="password"
                placeholder="123456"
                value={formData.confirmPassword}
                onChange={handleChange}
                icon="lock_reset"
                required
              />

              <InputField
                id="email"
                label="Email (Tùy chọn)"
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

              <button
                type="submit"
                disabled={isLoading}
                className="glow-button mt-4 w-full rounded-lg bg-blue-600 py-3.5 text-sm font-bold tracking-widest uppercase text-white transition-all duration-200 hover:bg-blue-700 font-mono-jb disabled:opacity-70"
              >
                {isLoading ? 'Đang tạo tài khoản...' : 'Hoàn tất Đăng ký'}
              </button>
            </form>
          )}

          {/* ── Footer ── */}
          <div className="mt-4 text-center pb-6 border-t border-slate-100 pt-4">
            <span className="text-sm text-slate-500">Đã có tài khoản? </span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Đăng nhập ngay
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
