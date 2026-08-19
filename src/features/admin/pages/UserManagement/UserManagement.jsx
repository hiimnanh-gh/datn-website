import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  X, 
  RefreshCw, 
  Phone, 
  Mail, 
  Shield, 
  CheckCircle2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Eye,
  EyeOff
} from 'lucide-react';
import { userService } from '../../../../services/userService';

const AVAILABLE_ROLES = ["ADMIN", "DISPATCHER", "PROVIDER_ADMIN", "DRIVER", "REPORTER"];

const getRoleBadge = (role) => {
  switch (role) {
    case 'ADMIN':
      return { bg: 'bg-red-950/60 text-red-400 border-red-800/80', label: 'ADMIN' };
    case 'DISPATCHER':
      return { bg: 'bg-blue-950/60 text-blue-400 border-blue-800/80', label: 'DISPATCHER' };
    case 'PROVIDER_ADMIN':
      return { bg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/80', label: 'PROVIDER_ADMIN' };
    case 'DRIVER':
      return { bg: 'bg-amber-950/60 text-amber-400 border-amber-800/80', label: 'DRIVER' };
    default:
      return { bg: 'bg-slate-800 text-slate-300 border-slate-700', label: role || 'REPORTER' };
  }
};

const getRoleAvatarColor = (roles = []) => {
  if (roles.includes('ADMIN')) return 'from-red-600 to-rose-700 text-white';
  if (roles.includes('DISPATCHER')) return 'from-blue-600 to-indigo-700 text-white';
  if (roles.includes('PROVIDER_ADMIN')) return 'from-emerald-600 to-teal-700 text-white';
  if (roles.includes('DRIVER')) return 'from-amber-600 to-orange-700 text-white';
  return 'from-slate-700 to-slate-800 text-slate-300';
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    roles: ['REPORTER'],
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        pageNumber,
        pageSize,
        keyword: searchTerm.trim() || undefined,
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        isActive: statusFilter === 'ACTIVE' ? true : (statusFilter === 'INACTIVE' ? false : undefined)
      };

      const res = await userService.getUsers(params);
      const usersList = Array.isArray(res) ? res : (res?.data || []);
      setUsers(usersList);

      if (res?._metadata) {
        setTotalElements(res._metadata.totalElements ?? usersList.length);
        setTotalPages(res._metadata.totalPages ?? 1);
      } else {
        setTotalElements(usersList.length);
        setTotalPages(Math.max(1, Math.ceil(usersList.length / pageSize)));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenModal = (user = null) => {
    setShowPassword(false);
    setFormErrors({});
    if (user) {
      setEditingId(user.id);
      setIsEditing(true);
      setFormData({
        username: user.username || '',
        password: '',
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || user.phone || '',
        email: user.email || '',
        roles: (user.roles || []).map(r => typeof r === 'string' ? r : (r.name || '')),
        isActive: user.isActive !== undefined ? user.isActive : true
      });
    } else {
      setEditingId(null);
      setIsEditing(false);
      setFormData({
        username: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        email: '',
        roles: ['REPORTER'],
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Tên đăng nhập là bắt buộc';
    if (!isEditing && !formData.password) errors.password = 'Mật khẩu là bắt buộc khi tạo mới';
    if (!formData.fullName.trim()) errors.fullName = 'Họ tên là bắt buộc';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Số điện thoại là bắt buộc';
    if (formData.roles.length === 0) errors.roles = 'Cần chọn ít nhất 1 vai trò';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const payload = { ...formData };
      if (isEditing && !payload.password) {
        delete payload.password;
      }

      if (isEditing && editingId) {
        await userService.updateUser(editingId, payload);
      } else {
        await userService.createUser(payload);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      alert('Lỗi lưu người dùng: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}" không?`)) {
      try {
        await userService.deleteUser(id);
        fetchUsers();
      } catch (err) {
        alert('Lỗi xóa người dùng: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const toggleRole = (role) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  return (
    <div className="p-6 bg-slate-950 min-h-full text-slate-100 font-sans space-y-5 overflow-y-auto">
      
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Users className="text-indigo-400" size={24} />
            Quản lý Người dùng & Phân quyền
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Danh sách tài khoản, vai trò bảo mật và trạng thái hoạt động trong toàn hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin text-indigo-400' : ''} />
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} />
            Thêm Người Dùng Mới
          </button>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPageNumber(0);
              }}
              placeholder="Tìm theo username, họ tên, số điện thoại..."
              className="bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-lg pl-9 pr-8 py-2 w-full placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setPageNumber(0);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400 hidden sm:block" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPageNumber(0);
              }}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="ALL">Tất cả vai trò</option>
              {AVAILABLE_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageNumber(0);
            }}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">Hoạt động (Active)</option>
            <option value="INACTIVE">Vô hiệu hóa (Inactive)</option>
          </select>
        </div>

        {/* Counter */}
        <div className="text-xs text-slate-400 font-mono">
          Tổng số: <strong className="text-slate-200">{totalElements}</strong> người dùng
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Người Dùng</th>
                <th className="py-3.5 px-4 font-semibold">Thông Tin Liên Hệ</th>
                <th className="py-3.5 px-4 font-semibold">Vai Trò (Roles)</th>
                <th className="py-3.5 px-4 font-semibold text-center">Trạng Thái</th>
                <th className="py-3.5 px-4 font-semibold text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <RefreshCw size={24} className="animate-spin text-indigo-400 mx-auto mb-2" />
                    <p className="text-xs">Đang tải danh sách người dùng...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <Users size={32} className="mx-auto mb-2 opacity-30 text-slate-500" />
                    <p className="text-xs">Không tìm thấy tài khoản người dùng nào phù hợp.</p>
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const initial = (u.fullName || u.username || 'U').charAt(0).toUpperCase();
                  const rolesList = (u.roles || []).map(r => typeof r === 'string' ? r : (r.name || ''));
                  const avatarGradient = getRoleAvatarColor(rolesList);

                  return (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${avatarGradient} flex items-center justify-center font-bold text-xs shadow-sm shrink-0`}>
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 text-xs">{u.fullName || u.username}</div>
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              @{u.username}
                              {u.providerId && (
                                <span className="ml-1.5 px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                                  Provider #{u.providerId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4 font-sans text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <Phone size={13} className="text-slate-500 shrink-0" />
                            <span>{u.phoneNumber || u.phone || '—'}</span>
                          </div>
                          {u.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Mail size={12} className="text-slate-500 shrink-0" />
                              <span>{u.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1.5">
                          {rolesList.map(r => {
                            const badge = getRoleBadge(r);
                            return (
                              <span
                                key={r}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg}`}
                              >
                                {badge.label}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                          u.isActive !== false
                            ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            : 'bg-red-950/60 text-red-400 border-red-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} />
                          {u.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenModal(u)}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Sửa thông tin"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer ── */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPageNumber(0);
              }}
              className="bg-slate-900 border border-slate-800 text-slate-200 rounded px-2 py-1 outline-none text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>dòng/trang</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPageNumber(0)}
              disabled={pageNumber === 0 || loading}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang đầu"
            >
              <ChevronsLeft size={14} />
            </button>
            <button
              onClick={() => setPageNumber(p => Math.max(0, p - 1))}
              disabled={pageNumber === 0 || loading}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang trước"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="px-3 py-1 bg-slate-900 text-indigo-300 font-mono font-bold border border-slate-800 rounded">
              Trang {pageNumber + 1} / {totalPages || 1}
            </span>

            <button
              onClick={() => setPageNumber(p => Math.min(totalPages - 1, p + 1))}
              disabled={pageNumber >= totalPages - 1 || loading}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang sau"
            >
              <ChevronRight size={14} />
            </button>
            <button
              onClick={() => setPageNumber(totalPages - 1)}
              disabled={pageNumber >= totalPages - 1 || loading}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang cuối"
            >
              <ChevronsRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal Form (Create / Edit) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Shield className="text-indigo-400" size={18} />
                {isEditing ? 'Cập Nhật Người Dùng' : 'Tạo Người Dùng Mới'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSave} className="p-5 space-y-4">
              
              {/* Username */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Tên Đăng Nhập <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={e => setFormData({ ...formData, username: e.target.value })}
                  disabled={isEditing}
                  placeholder="Ví dụ: nguyenvana"
                  className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 ${
                    formErrors.username ? 'border-red-500' : 'border-slate-800'
                  } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {formErrors.username && <p className="text-[11px] text-red-400 mt-0.5">{formErrors.username}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Mật Khẩu {isEditing ? '(Để trống nếu giữ nguyên)' : <span className="text-red-400">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    placeholder={isEditing ? '••••••••' : 'Nhập mật khẩu'}
                    className={`w-full bg-slate-950 border rounded-lg px-3 py-2 pr-9 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 ${
                      formErrors.password ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                {formErrors.password && <p className="text-[11px] text-red-400 mt-0.5">{formErrors.password}</p>}
              </div>

              {/* Full Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Họ và Tên <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ví dụ: Nguyễn Văn A"
                    className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 ${
                      formErrors.fullName ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.fullName && <p className="text-[11px] text-red-400 mt-0.5">{formErrors.fullName}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Số Điện Thoại <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phoneNumber}
                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="Ví dụ: 0987654321"
                    className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 ${
                      formErrors.phoneNumber ? 'border-red-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.phoneNumber && <p className="text-[11px] text-red-400 mt-0.5">{formErrors.phoneNumber}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Roles Checkbox Grid */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Phân Quyền Vai Trò (Roles) <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  {AVAILABLE_ROLES.map(role => {
                    const isChecked = formData.roles.includes(role);
                    return (
                      <label
                        key={role}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer text-xs transition-colors ${
                          isChecked ? 'bg-indigo-950/40 text-indigo-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleRole(role)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                        />
                        <span>{role}</span>
                      </label>
                    );
                  })}
                </div>
                {formErrors.roles && <p className="text-[11px] text-red-400 mt-0.5">{formErrors.roles}</p>}
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Kích hoạt tài khoản</span>
                  <span className="text-[11px] text-slate-500">Cho phép người dùng đăng nhập vào hệ thống</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  {isEditing ? 'Cập Nhật' : 'Tạo Tài Khoản'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
