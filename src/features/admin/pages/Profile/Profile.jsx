import React, { useState, useEffect } from "react";
import { userService } from "../../../../services/userService";
import useTopbarStore from "../../../../store/useTopbarStore";
import useAuthStore from "../../../../store/useAuthStore";

const Profile = () => {
  const { setSlot, clearSlot } = useTopbarStore();
  const { user: authUser, login } = useAuthStore();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Edit states
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const userRoleDisplay = (
    profile?.roles?.[0]?.name ||
    profile?.role ||
    authUser?.role ||
    "DISPATCHER"
  ).toUpperCase();

  const isAdmin = userRoleDisplay === "ADMIN";

  // Breadcrumbs/header slot
  useEffect(() => {
    setSlot(
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-900/40 border border-indigo-800 text-indigo-300">
          {userRoleDisplay} Account
        </span>
      </div>,
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
      setFullName(userData.fullName || authUser?.fullName || authUser?.name || "");
      setEmail(userData.email || authUser?.email || "");
      setPhone(userData.phoneNumber || userData.phone || authUser?.phoneNumber || authUser?.phone || "");
    } catch (err) {
      console.error("Failed to fetch profile", err);
      if (authUser) {
        setProfile(authUser);
        setFullName(authUser.fullName || authUser.name || "");
        setEmail(authUser.email || "");
        setPhone(authUser.phoneNumber || authUser.phone || "");
      } else {
        setError("Failed to load profile data from server.");
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
    setError("");
    setSuccess("");

    if (!profile?.id && !authUser?.userId && !authUser?.id) return;
    const targetUserId = profile?.id || authUser?.userId || authUser?.id;

    if (password && password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    const rawRoles = profile?.roles || authUser?.roles || [userRoleDisplay];
    const stringRoles = Array.isArray(rawRoles)
      ? rawRoles.map(r => typeof r === 'string' ? r : (r.name || r.authority || userRoleDisplay))
      : [userRoleDisplay];

    try {
      const updateData = {
        username: profile?.username || authUser?.username,
        fullName: fullName.trim(),
        email: email.trim(),
        phoneNumber: effectivePhone,
        roles: stringRoles,
        isActive: profile?.isActive !== undefined ? profile.isActive : true
      };

      if (password) {
        updateData.password = password;
      }

      const res = await userService.updateUser(targetUserId, updateData);
      const updatedUser = res.data || res;

      setProfile(updatedUser);
      setSuccess("Cập nhật thông tin tài khoản thành công!");
      setPassword("");
      setConfirmPassword("");

      if (authUser) {
        login(
          { ...authUser, fullName: fullName.trim(), phoneNumber: effectivePhone, phone: effectivePhone },
          useAuthStore.getState().token,
          useAuthStore.getState().refreshToken
        );
      }
    } catch (err) {
      console.error("Failed to update profile", err);
      if (err.response?.status === 403) {
        setError("Phân quyền Backend (Spring Security): Chỉ tài khoản ADMIN mới có quyền chỉnh sửa thông tin người dùng qua API PUT /api/v1/users/{id}.");
      } else {
        const errorMsg = err.response?.data?.message || "Lỗi khi cập nhật thông tin.";
        setError(errorMsg);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-[36px] text-indigo-500">
            progress_activity
          </span>
          <p className="text-sm font-semibold">Loading profile...</p>
        </div>
      </div>
    );
  }

  const initials = fullName
    ? fullName.split(" ").map((w) => w[0]).slice(-2).join("").toUpperCase()
    : "US";

  return (
    <div className="min-h-screen bg-slate-950 p-6 pb-12 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-bold text-white flex items-center gap-2">
          <span
            className="material-symbols-outlined text-indigo-400 text-[28px]"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            person
          </span>
          My Profile
        </h1>
        <p className="text-[13px] text-slate-400 mt-0.5">
          View and manage your account details and password
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-[1200px]">
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
            @{profile?.username || authUser?.username}
          </p>

          <div className="inline-block mt-2 text-[10px] font-bold px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-900/50 text-indigo-300">
            {userRoleDisplay}
          </div>

          <div className="w-full border-t border-slate-800 my-5 pt-4 space-y-3 text-left text-[13px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Status</span>
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active Account
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Registered</span>
              <span className="font-semibold text-slate-300 font-mono">
                {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "2026-07-01"}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Form Edit */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[16px] font-bold text-white">
              Account Settings
            </h3>
            {!isAdmin && (
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300">
                View Only (Admin Permission Required)
              </span>
            )}
          </div>

          {!isAdmin && (
            <div className="mb-4 p-3 bg-amber-950/30 border border-amber-900/50 text-amber-300 text-[12px] rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                info
              </span>
              Tài khoản của bạn thuộc vai trò {userRoleDisplay}. Phân quyền Backend (Spring Security) chỉ cho phép tài khoản ADMIN thực thi API cập nhật thông tin người dùng (`PUT /api/v1/users/{'{id}'}`).
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-950/40 border border-red-900 text-red-400 text-[13px] rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900 text-emerald-400 text-[13px] rounded-xl flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                check_circle
              </span>
              {success}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            {/* Username (Read-Only) */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Username
              </label>
              <input
                value={profile?.username || authUser?.username || ""}
                disabled
                className="w-full px-4 py-2.5 border border-slate-800 rounded-xl text-[14px] outline-none bg-slate-950 text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Full Name
                </label>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={!isAdmin}
                  required
                  placeholder="Enter full name"
                  className={`w-full px-4 py-2.5 border border-slate-700 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600 ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Email Address
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!isAdmin}
                  type="email"
                  placeholder="Enter email address"
                  className={`w-full px-4 py-2.5 border border-slate-700 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600 ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!isAdmin}
                placeholder="Enter phone number"
                className={`w-full px-4 py-2.5 border border-slate-700 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600 ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>

            {/* Password Section */}
            <div className="border-t border-slate-800 pt-5 mt-5">
              <h4 className="text-[14px] font-bold text-white mb-3">
                Change Password
              </h4>
              <p className="text-[12px] text-slate-500 mb-4">
                Leave blank if you do not want to change your password.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    New Password
                  </label>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!isAdmin}
                    type="password"
                    placeholder="Min 6 characters"
                    className={`w-full px-4 py-2.5 border border-slate-700 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600 ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!isAdmin}
                    type="password"
                    placeholder="Verify new password"
                    className={`w-full px-4 py-2.5 border border-slate-700 rounded-xl text-[14px] outline-none focus:ring-2 focus:ring-indigo-500/50 bg-slate-950 text-white placeholder-slate-600 ${!isAdmin ? 'opacity-70 cursor-not-allowed' : ''}`}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={!isAdmin}
                className={`px-5 py-2.5 rounded-xl text-[13px] font-bold transition-all flex items-center gap-2 ${
                  isAdmin
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  save
                </span>
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
