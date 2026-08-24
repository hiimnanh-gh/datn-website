import React, { useState, useEffect } from "react";
import { userService } from "../../../../services/userService";
import { authService } from "../../../../services/authService";
import useTopbarStore from "../../../../store/useTopbarStore";
import useAuthStore from "../../../../store/useAuthStore";
import { User, Lock, KeyRound, Shield, CheckCircle2, AlertCircle } from "lucide-react";

const Profile = () => {
  const { setSlot, clearSlot } = useTopbarStore();
  const { user: authUser } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile edit states
  const [fullNameInput, setFullNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Change Password states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const userRoleDisplay = (
    profile?.roles?.[0]?.name ||
    profile?.role ||
    authUser?.role ||
    "ADMIN"
  ).toUpperCase();

  // Header badge slot
  useEffect(() => {
    setSlot(
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-900/40 border border-indigo-800 text-indigo-300">
          {userRoleDisplay} Account
        </span>
      </div>
    );
    return () => clearSlot();
  }, [userRoleDisplay]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await userService.getMe();
      const userData = res.data || res;
      setProfile(userData);
      setFullNameInput(userData.fullName || authUser?.fullName || authUser?.name || "");
      setEmailInput(userData.email || authUser?.email || "");
      setPhoneInput(userData.phoneNumber || userData.phone || authUser?.phoneNumber || authUser?.phone || "");
    } catch (err) {
      console.error("Failed to fetch profile", err);
      if (authUser) {
        setProfile(authUser);
        setFullNameInput(authUser.fullName || authUser.name || "");
        setEmailInput(authUser.email || "");
        setPhoneInput(authUser.phoneNumber || authUser.phone || "");
      } else {
        setError("Không thể tải thông tin tài khoản từ máy chủ.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!fullNameInput.trim()) {
      setProfileError("Họ và tên không được để trống.");
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const payload = {
        id: profile?.id,
        fullName: fullNameInput.trim(),
        email: emailInput.trim(),
        phoneNumber: phoneInput.trim(),
        phone: phoneInput.trim()
      };

      const updated = await userService.updateMe(payload);
      const updatedData = updated.data || updated || payload;

      setProfile(prev => ({ ...prev, ...payload }));
      useAuthStore.getState().updateUser({
        fullName: payload.fullName,
        name: payload.fullName,
        email: payload.email,
        phoneNumber: payload.phoneNumber,
        phone: payload.phone
      });

      setProfileSuccess("Cập nhật thông tin hồ sơ thành công!");
    } catch (err) {
      console.error("Failed to update profile", err);
      const msg = err.response?.data?.message || err.message || "Cập nhật hồ sơ thất bại.";
      setProfileError(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (!newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        oldPassword: oldPassword,
        newPassword: newPassword,
      });

      setSuccess("Đổi mật khẩu thành công!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Failed to change password", err);
      const errorMsg = err.response?.data?.message || "Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu cũ.";
      setError(errorMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[36px] text-indigo-500">
            progress_activity
          </span>
          <p className="text-sm font-semibold">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  const fullName = profile?.fullName || authUser?.fullName || authUser?.name || "Người dùng";
  const username = profile?.username || authUser?.username || "";

  const initials = fullName
    ? fullName.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase()
    : "US";

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-12 space-y-6 font-sans text-slate-100">
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-bold text-white flex items-center gap-2">
          <User className="text-indigo-400" size={26} />
          Thông tin tài khoản (My Profile)
        </h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          Quản lý thông tin cá nhân và cập nhật mật khẩu bảo mật tài khoản.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1100px]">
        {/* Left Card: Avatar & Summary Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col items-center text-center h-fit">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-[32px] font-bold shadow-lg shadow-indigo-500/20">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-[12px] font-bold">
                check
              </span>
            </div>
          </div>

          <h2 className="text-[18px] font-bold text-white mt-4">{fullName}</h2>
          <p className="text-[12px] text-slate-400 font-mono mt-0.5">
            @{username}
          </p>

          <div className="inline-block mt-2 text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-900/50 text-indigo-300 font-mono">
            {userRoleDisplay}
          </div>

          <div className="w-full border-t border-slate-800 my-5 pt-4 space-y-3 text-left text-[13px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Trạng thái</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Đang hoạt động (Active)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Ngày tạo</span>
              <span className="font-semibold text-slate-300 font-mono text-xs">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "2026-07-01"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Info & Change Password Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Information Card (Editable for ADMIN, Read-only for DISPATCHER / PROVIDER) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-[15px] font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="text-indigo-400" size={18} />
              {userRoleDisplay === "ADMIN" ? "Chỉnh sửa thông tin cá nhân" : "Thông tin hồ sơ (Chỉ xem)"}
            </h3>

            {userRoleDisplay === "ADMIN" ? (
              <>
                {profileError && (
                  <div className="p-3 bg-red-950/40 border border-red-900 text-red-400 text-[12px] rounded-xl flex items-center gap-2">
                    <AlertCircle size={16} />
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-[12px] rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    {profileSuccess}
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Tên đăng nhập (Username)
                      </label>
                      <input
                        type="text"
                        value={username}
                        disabled
                        className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-xs bg-slate-950/60 text-slate-500 font-mono cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Họ và Tên *
                      </label>
                      <input
                        type="text"
                        value={fullNameInput}
                        onChange={(e) => setFullNameInput(e.target.value)}
                        required
                        placeholder="Nhập họ và tên đầy đủ"
                        className="w-full px-4 py-2.5 border border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Địa chỉ Email
                      </label>
                      <input
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="example@domain.com"
                        className="w-full px-4 py-2.5 border border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="0987654321"
                        className="w-full px-4 py-2.5 border border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600 font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                    >
                      <User size={15} />
                      {isUpdatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Tên đăng nhập</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">@{username}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Họ và Tên</span>
                  <span className="font-semibold text-slate-200 text-sm">{fullName}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Địa chỉ Email</span>
                  <span className="font-medium text-slate-300">{profile?.email || authUser?.email || "Chưa cập nhật"}</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                  <span className="text-slate-500 block text-[10px] uppercase font-mono mb-1">Số điện thoại</span>
                  <span className="font-medium text-slate-300 font-mono">{profile?.phoneNumber || profile?.phone || authUser?.phoneNumber || authUser?.phone || "Chưa cập nhật"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Form Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-[15px] font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
              <KeyRound className="text-indigo-400" size={18} />
              Đổi Mật Khẩu (Change Password)
            </h3>

            {error && (
              <div className="mb-4 p-3 bg-red-950/40 border border-red-900 text-red-400 text-[12px] rounded-xl flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-[12px] rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} />
                {success}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Mật khẩu hiện tại *
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  placeholder="Nhập mật khẩu cũ"
                  className="w-full px-4 py-2.5 border border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Mật khẩu mới (chữ số)"
                    className="w-full px-4 py-2.5 border border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Xác nhận mật khẩu mới *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Xác nhận lại mật khẩu mới"
                    className="w-full px-4 py-2.5 border border-slate-700 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  <Lock size={15} />
                  {isChangingPassword ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
