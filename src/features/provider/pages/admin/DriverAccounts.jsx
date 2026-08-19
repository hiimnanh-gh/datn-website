import React, { useState, useEffect, useCallback } from 'react';
import { Shield, ToggleLeft, ToggleRight, Search, Plus, RefreshCw, X, UserCircle2, Phone, Mail } from 'lucide-react';
import { userService } from '../../../../services/userService';

const DriverAccounts = () => {
  const [drivers, setDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    roles: ['DRIVER'],
    isActive: true
  });

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await userService.getUsers();
      const usersList = Array.isArray(res) ? res : (res?.data || []);
      // Filter users that have role DRIVER
      const driverUsers = usersList.filter(u => {
        const roles = u.roles || [];
        return roles.some(r => (typeof r === 'string' ? r : r.name || '').toUpperCase().includes('DRIVER'));
      });
      setDrivers(driverUsers);
    } catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const toggleStatus = async (driver) => {
    try {
      const updatedStatus = !driver.isActive;
      await userService.updateUser(driver.id, {
        ...driver,
        isActive: updatedStatus
      });
      setDrivers(prev => prev.map(d => d.id === driver.id ? { ...d, isActive: updatedStatus } : d));
    } catch (err) {
      alert('Lỗi cập nhật trạng thái tài xế: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateDriver = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await userService.createUser({
        username: formData.username.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim() || undefined,
        roles: ['DRIVER'],
        isActive: true
      });
      alert('Tạo tài khoản tài xế thành công!');
      setIsModalOpen(false);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        email: '',
        roles: ['DRIVER'],
        isActive: true
      });
      fetchDrivers();
    } catch (err) {
      alert('Lỗi tạo tài xế: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = drivers.filter(d => {
    const term = search.toLowerCase();
    const nameStr = (d.fullName || d.username || '').toLowerCase();
    const phoneStr = (d.phoneNumber || '').toLowerCase();
    return nameStr.includes(term) || phoneStr.includes(term) || d.id?.toString().includes(term);
  });

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100 rounded-2xl border border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold font-mono tracking-wider text-white">DRIVER ACCOUNTS</h1>
          <p className="text-slate-400 text-xs mt-1">Quản lý danh sách tài xế, tài khoản đăng nhập và trạng thái hoạt động.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchDrivers}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all font-mono shadow-lg shadow-blue-900/40"
          >
            <Plus size={16} />
            THÊM TÀI XẾ MỚI
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-2.5 rounded-xl mb-6">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Tìm theo tên tài xế, số điện thoại, username..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent border-none text-slate-200 outline-none text-sm w-full placeholder:text-slate-500"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-slate-500 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-widest font-mono text-[11px]">
              <th className="py-3.5 px-4">ID</th>
              <th className="py-3.5 px-4">Họ và Tên</th>
              <th className="py-3.5 px-4">Tên đăng nhập</th>
              <th className="py-3.5 px-4">Số điện thoại</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4">Vai trò</th>
              <th className="py-3.5 px-4 text-right">Trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                  Đang tải danh sách tài xế...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                  Chưa có tài khoản tài xế nào (role DRIVER).
                </td>
              </tr>
            ) : (
              filtered.map((drv) => (
                <tr key={drv.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-400">#{drv.id}</td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-slate-100 flex items-center gap-2">
                    <UserCircle2 size={16} className="text-slate-400" />
                    {drv.fullName || drv.username}
                  </td>
                  <td className="py-3.5 px-4 text-slate-300 font-mono">{drv.username}</td>
                  <td className="py-3.5 px-4 text-slate-400">{drv.phoneNumber || 'N/A'}</td>
                  <td className="py-3.5 px-4 text-slate-400 font-sans">{drv.email || 'N/A'}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-blue-950/60 border border-blue-800 text-blue-300 text-[10px]">
                      DRIVER
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button onClick={() => toggleStatus(drv)} className="inline-flex items-center gap-1.5 focus:outline-none">
                      {drv.isActive !== false ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold text-xs">
                          <ToggleRight className="text-emerald-500" size={24} />
                          Active
                        </span>
                      ) : (
                        <span className="text-slate-500 flex items-center gap-1 font-semibold text-xs">
                          <ToggleLeft className="text-slate-500" size={24} />
                          Inactive
                        </span>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE DRIVER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-sm text-slate-100">Thêm Tài Khoản Tài Xế Mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tên đăng nhập (Username) *</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                  placeholder="driver_01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Mật khẩu khởi tạo *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Họ và Tên tài xế *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Số điện thoại liên hệ *</label>
                <input
                  type="text"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(p => ({ ...p, phoneNumber: e.target.value }))}
                  placeholder="0912345678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Email (Tùy chọn)</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))}
                  placeholder="driver@smartems.vn"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-600/30"
                >
                  {isSaving ? 'Đang tạo...' : 'Tạo tài khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverAccounts;
