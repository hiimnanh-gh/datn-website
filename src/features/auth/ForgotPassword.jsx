import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

// ── Components ─────────────────────────────────────────────────────────────
const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
      <span className="material-symbols-outlined text-3xl">emergency</span>
    </div>
    <span className="text-2xl font-bold tracking-tight text-slate-900">
      SEMD<span className="text-blue-600">.</span>
    </span>
  </div>
);

const InputField = ({ id, label, icon, ...props }) => (
  <div className="space-y-1">
    <label htmlFor={id} className="block text-sm font-medium text-slate-700">
      {label}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <span className="material-symbols-outlined text-[20px] text-slate-400">
          {icon}
        </span>
      </div>
      <input
        id={id}
        className="block w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        {...props}
      />
    </div>
  </div>
);

export default function ForgotPassword() {
  const navigate = useNavigate();
  
  // State
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form fields
  const [identity, setIdentity] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!identity.trim()) {
      setError('Vui lòng nhập Email hoặc Số điện thoại đã đăng ký.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await authService.forgotPassword(identity.trim());
      const otpReceived = res?.data || res?.message;
      setSuccessMsg(
        otpReceived && typeof otpReceived === 'string' && otpReceived.length === 6
          ? `Mã OTP xác thực của bạn: ${otpReceived}`
          : (res?.message || 'Mã OTP đã được gửi đến Email/Số điện thoại của bạn.')
      );
      if (otpReceived && typeof otpReceived === 'string' && otpReceived.length === 6) {
        setOtpCode(otpReceived);
      }
      setStep(2);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Không thể gửi mã OTP. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Vui lòng nhập mã OTP.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    if (newPassword.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await authService.resetPassword({
        identity: identity.trim(),
        otpCode: otpCode.trim(),
        newPassword
      });
      
      setSuccessMsg('Đặt lại mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Đặt lại mật khẩu thất bại. Mã OTP không đúng hoặc đã hết hạn.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
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
        >
          {/* ── Header ── */}
          <div className="px-8 pb-6 pt-10 text-center">
            <div className="mb-6 flex justify-center">
              <Logo />
            </div>

            <h1 className="text-[28px] font-bold leading-[36px] tracking-tight text-slate-900">
              Quên Mật Khẩu
            </h1>
            <p className="mt-2 text-[14px] text-slate-500">
              {step === 1 ? 'Bước 1/2: Nhập thông tin tài khoản để nhận mã OTP' : 'Bước 2/2: Nhập mã OTP và mật khẩu mới'}
            </p>
          </div>

          {/* ── Forms ── */}
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4 px-8 pb-4">
              <InputField
                id="identity"
                label="Email hoặc Số Điện Thoại *"
                placeholder="Ví dụ: reporter01@gmail.com hoặc 0987654321"
                value={identity}
                onChange={(e) => setIdentity(e.target.value)}
                icon="badge"
                required
              />

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  'Gửi mã xác thực OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 px-8 pb-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 font-mono flex items-center justify-between">
                <span>Tài khoản: <strong className="text-slate-900">{identity}</strong></span>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Đổi
                </button>
              </div>

              {successMsg && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {successMsg}
                  </div>
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
                id="newPassword"
                label="Mật Khẩu Mới (Chữ số, ví dụ 654321) *"
                type="password"
                placeholder="654321"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon="lock"
                required
              />

              <InputField
                id="confirmPassword"
                label="Xác Nhận Mật Khẩu Mới *"
                type="password"
                placeholder="654321"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon="lock_reset"
                required
              />

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">error</span>
                    {error}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 flex w-full items-center justify-center rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
              >
                {isLoading ? (
                  <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>
            </form>
          )}

          {/* Footer Action */}
          <div className="bg-slate-50 px-8 py-5 text-center border-t border-slate-100">
            <span className="text-sm text-slate-500">Đã nhớ mật khẩu? </span>
            <button
              onClick={() => navigate('/login')}
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Quay lại Đăng nhập
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
