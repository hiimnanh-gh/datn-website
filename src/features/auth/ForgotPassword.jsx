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
  const [otpCode, setOtpCode] = useState('123456'); // Mock OTP
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!identity.trim()) {
      setError('Please enter your username, email, or phone number.');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await authService.forgotPassword(identity);
      // We successfully requested an OTP
      setSuccessMsg(res.message || 'OTP has been sent to your registered phone number.');
      setStep(2);
    } catch (err) {
      console.error('Forgot password error:', err);
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your information.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await authService.resetPassword({
        identity,
        otpCode,
        newPassword
      });
      
      setSuccessMsg('Password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      console.error('Reset password error:', err);
      setError(err.response?.data?.message || 'Failed to reset password. Invalid OTP or request.');
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

            <h1 className="text-[32px] font-bold leading-[40px] tracking-tight text-slate-900">
              Reset Password
            </h1>
            <p className="mt-2 text-[16px] text-slate-500">
              {step === 1 ? 'Enter your details to receive an OTP' : 'Enter the OTP and your new password'}
            </p>
          </div>

          {/* ── Forms ── */}
          {step === 1 ? (
            <form onSubmit={handleSendOTP} className="space-y-4 px-8 pb-4">
              <InputField
                id="identity"
                label="Username / Email / Phone"
                placeholder="Enter your registered information"
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
                  'Send OTP'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4 px-8 pb-4">
              <InputField
                id="otpCode"
                label="OTP Code (Mock: 123456)"
                placeholder="Enter the 6-digit OTP"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                icon="pin"
                required
              />

              <InputField
                id="newPassword"
                label="New Password"
                type="password"
                placeholder="••••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon="lock"
                required
              />

              <InputField
                id="confirmPassword"
                label="Confirm New Password"
                type="password"
                placeholder="••••••••••"
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

              {successMsg && (
                <div className="rounded-lg bg-green-50 p-3 text-sm text-green-600">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    {successMsg}
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
                  'Reset Password'
                )}
              </button>
            </form>
          )}

          {/* Footer Action */}
          <div className="bg-slate-50 px-8 py-5 text-center border-t border-slate-100">
            <span className="text-sm text-slate-500">Remember your password? </span>
            <button
              onClick={() => navigate('/login')}
              type="button"
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
