import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Users,
  Shield,
  Truck,
  Activity,
  Phone,
  Mail,
  RefreshCw,
  UserCheck,
  UserX,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { userService } from '../../../../services/userService';

// Custom Toast Component
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-fade-in border
      ${type === 'success' 
        ? 'bg-slate-900/95 border-emerald-500/50 text-emerald-300 shadow-emerald-950/40 backdrop-blur-md' 
        : 'bg-slate-900/95 border-red-500/50 text-red-300 shadow-red-950/40 backdrop-blur-md'}`}
    >
      {type === 'success' ? <CheckCircle size={18} className="text-emerald-400 shrink-0" /> : <AlertCircle size={18} className="text-red-400 shrink-0" />}
      <span className="text-xs font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white transition-opacity">
        <X size={14} />
      </button>
    </div>
  );
};

const AVAILABLE_ROLES = ["ADMIN", "DISPATCHER", "DRIVER", "PROVIDER_ADMIN", "REPORTER"];

// Color & label map for roles
const getRoleBadge = (role) => {
  switch (role) {
    case 'ADMIN':
      return { bg: 'bg-red-500/10 text-red-400 border-red-500/30', label: 'Quản trị viên (ADMIN)' };
    case 'DISPATCHER':
      return { bg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30', label: 'Điều phối viên (DISPATCHER)' };
    case 'PROVIDER_ADMIN':
      return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'Quản lý Nhà xe (PROVIDER)' };
    case 'DRIVER':
      return { bg: 'bg-amber-500/10 text-amber-300 border-amber-500/30', label: 'Tài xế Cấp cứu (DRIVER)' };
    default:
      return { bg: 'bg-slate-500/10 text-slate-400 border-slate-500/30', label: role || 'REPORTER' };
  }
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Pagination state
  const [pageNumber, setPageNumber] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  
  // Toast state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    roles: [],
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        pageNumber,
        pageSize,
        keyword: search.trim() || undefined,
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
      showToast('Lỗi khi tải danh sách người dùng', 'error');
    } finally {
      setLoading(false);
    }
  }, [pageNumber, pageSize, search, roleFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
  };

  const handleOpenModal = (user = null) => {
    setShowPassword(false);
    if (user) {
      setEditingUser(user);
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
      setEditingUser(null);
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
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) errors.username = 'Tên đăng nhập không được để trống';
    if (!editingUser && !formData.password) errors.password = 'Mật khẩu không được để trống khi tạo mới';
    if (!formData.fullName.trim()) errors.fullName = 'Họ tên không được để trống';
    if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Số điện thoại không được để trống';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (formData.roles.length === 0) errors.roles = 'Phải chọn ít nhất 1 quyền';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password;
      }

      if (editingUser) {
        await userService.updateUser(editingUser.id, payload);
        showToast('Cập nhật người dùng thành công');
      } else {
        await userService.createUser(payload);
        showToast('Tạo mới người dùng thành công');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi lưu dữ liệu';
      showToast(`Lỗi: ${errorMsg}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa user "${username}" không? Hành động này không thể hoàn tác.`)) {
      try {
        await userService.deleteUser(id);
        showToast('Đã xóa người dùng thành công');
        fetchUsers();
      } catch (err) {
        const errorMsg = err.response?.data?.message || 'Có lỗi xảy ra khi xóa';
        showToast(`Lỗi: ${errorMsg}`, 'error');
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

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPageNumber(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPageNumber(0);
  };

  // Compute Quick Stats
  const stats = useMemo(() => {
    const activeCount = users.filter(u => u.isActive).length;
    const adminOrDispatcher = users.filter(u => 
      (u.roles || []).some(r => ['ADMIN', 'DISPATCHER'].includes(typeof r === 'string' ? r : r.name))
    ).length;
    const providerOrDriver = users.filter(u => 
      (u.roles || []).some(r => ['PROVIDER_ADMIN', 'DRIVER'].includes(typeof r === 'string' ? r : r.name))
    ).length;

    return {
      total: totalElements || users.length,
      active: activeCount,
      operations: adminOrDispatcher,
      fleets: providerOrDriver
    };
  }, [users, totalElements]);

  return (
    <div className="p-6 h-full flex flex-col bg-slate-950 text-slate-100 font-sans space-y-5 overflow-hidden">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      
      {/* ── Top Header Section ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 border-b border-slate-800/80 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
              <Users size={20} />
            </span>
            Quản Lý Người Dùng & Phân Quyền Hệ Thống
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản trị danh sách tài khoản, vai trò bảo mật RBAC và trạng thái hoạt động toàn mạng lưới
          </p>
        </div>

        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-950/60 active:scale-98 whitespace-nowrap"
        >
          <Plus size={16} /> Thêm Người Dùng Mới
        </button>
      </div>

      {/* ── KPI Stat Summary Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
        <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Tổng Tài Khoản</span>
            <span className="text-lg font-bold font-mono text-white mt-0.5 block">{stats.total}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Đang Hoạt Động</span>
            <span className="text-lg font-bold font-mono text-emerald-400 mt-0.5 block">{stats.active}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <UserCheck size={18} />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Quản Trị / Điều Phối</span>
            <span className="text-lg font-bold font-mono text-red-400 mt-0.5 block">{stats.operations}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <Shield size={18} />
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between shadow-sm">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider block">Đơn Vị & Tài Xế</span>
            <span className="text-lg font-bold font-mono text-amber-400 mt-0.5 block">{stats.fleets}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Truck size={18} />
          </div>
        </div>
      </div>

      {/* ── Modern Filter & Search Bar ── */}
      <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shrink-0 shadow-md">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[300px]">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Tìm theo username, họ tên, SĐT..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNumber(0);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <Filter size={13} className="text-slate-500 hidden sm:block" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPageNumber(0);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
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
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="ACTIVE">🟢 Đang hoạt động (Active)</option>
            <option value="INACTIVE">🔴 Vô hiệu hóa (Inactive)</option>
          </select>
        </div>

        {/* Refresh button */}
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Tải lại danh sách"
        >
          <RefreshCw size={15} className={loading ? 'animate-spin text-indigo-400' : ''} />
        </button>
      </div>

      {/* ── Table Container ── */}
      <div className="flex-1 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative min-h-0">
        <div className="overflow-auto flex-1 custom-scrollbar">
          <table className="w-full text-left text-xs whitespace-nowrap border-collapse">
            <thead className="bg-slate-900 text-slate-300 sticky top-0 z-20 shadow-md border-b border-slate-800 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 bg-slate-900">Người Dùng</th>
                <th className="px-4 py-3.5 bg-slate-900">Liên Hệ</th>
                <th className="px-4 py-3.5 bg-slate-900">Vai Trò (Roles)</th>
                <th className="px-4 py-3.5 bg-slate-900 text-center">Trạng Thái</th>
                <th className="px-4 py-3.5 bg-slate-900 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center text-slate-400">
                    <RefreshCw size={24} className="animate-spin text-indigo-400 mx-auto mb-2" />
                    <p className="text-xs">Đang tải danh sách người dùng...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-4 py-16 text-center text-slate-500">
                    <Users size={32} className="mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="text-xs">Không tìm thấy tài khoản người dùng nào phù hợp với bộ lọc.</p>
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const initial = (user.fullName || user.username || 'U').charAt(0).toUpperCase();
                  const primaryRole = (user.roles?.[0] || 'REPORTER');
                  const roleStyle = getRoleBadge(typeof primaryRole === 'string' ? primaryRole : primaryRole.name);

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* User Column */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-700/60 flex items-center justify-center font-bold font-mono text-indigo-300 text-xs shadow-inner">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 text-xs">{user.fullName || user.username}</div>
                            <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                              <span>@{user.username}</span>
                              {user.providerId && (
                                <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded border border-slate-700">
                                  Provider #{user.providerId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-3 font-mono text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-200">
                            <Phone size={12} className="text-slate-500" />
                            <span>{user.phoneNumber || user.phone || '—'}</span>
                          </div>
                          {user.email && (
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                              <Mail size={11} className="text-slate-500" />
                              <span>{user.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Roles */}
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {user.roles?.map(r => {
                            const rName = typeof r === 'string' ? r : (r.name || '');
                            const badge = getRoleBadge(rName);
                            return (
                              <span 
                                key={rName} 
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${badge.bg}`}
                              >
                                {rName}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 text-center">
                        {user.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-950/60 text-red-400 border border-red-800/80 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                            Inactive
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button 
                            onClick={() => handleOpenModal(user)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-950/40 rounded-lg border border-transparent hover:border-blue-800/50 transition-all"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => handleDelete(user.id, user.username)}
                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/40 rounded-lg border border-transparent hover:border-red-800/50 transition-all"
                            title="Xóa tài khoản"
                          >
                            <Trash2 size={14} />
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

        {/* ── Modern Pagination Bar ── */}
        <div className="p-3 bg-slate-950/95 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-slate-900 border border-slate-750 text-slate-200 rounded-lg px-2 py-1 outline-none font-mono"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>dòng/trang • Tổng số <strong className="text-white">{totalElements}</strong> người dùng</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handlePageChange(0)}
              disabled={pageNumber === 0 || loading}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              title="Trang đầu"
            >
              <ChevronsLeft size={15} />
            </button>
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber === 0 || loading}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              title="Trang trước"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="px-3 py-1 bg-indigo-950/80 text-indigo-300 font-bold border border-indigo-800/80 rounded-lg">
              Trang {pageNumber + 1} / {totalPages || 1}
            </span>

            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages - 1 || loading}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              title="Trang sau"
            >
              <ChevronRight size={15} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={pageNumber >= totalPages - 1 || loading}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              title="Trang cuối"
            >
              <ChevronsRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal Form (Create / Edit) ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-left animate-scale-in">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                <Shield size={18} className="text-indigo-400" />
                {editingUser ? 'CẬP NHẬT THÔNG TIN NGƯỜI DÙNG' : 'TẠO MỚI TÀI KHOẢN NGƯỜI DÙNG'}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Username */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                      Username <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. johndoe"
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                      disabled={!!editingUser}
                      className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono ${formErrors.username ? 'border-red-500' : 'border-slate-800'} ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {formErrors.username && <p className="text-red-400 text-[10px] mt-1">{formErrors.username}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                      Password {editingUser ? '(Để trống nếu không đổi)' : <span className="text-red-400">*</span>}
                    </label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        placeholder={editingUser ? "••••••••" : "Nhập mật khẩu"}
                        className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono ${formErrors.password ? 'border-red-500' : 'border-slate-800'}`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {formErrors.password && <p className="text-red-400 text-[10px] mt-1">{formErrors.password}</p>}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                      Họ và Tên <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 ${formErrors.fullName ? 'border-red-500' : 'border-slate-800'}`}
                    />
                    {formErrors.fullName && <p className="text-red-400 text-[10px] mt-1">{formErrors.fullName}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                      Số Điện Thoại <span className="text-red-400">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. 0987654321"
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono ${formErrors.phoneNumber ? 'border-red-500' : 'border-slate-800'}`}
                    />
                    {formErrors.phoneNumber && <p className="text-red-400 text-[10px] mt-1">{formErrors.phoneNumber}</p>}
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Email</label>
                  <input 
                    type="email" 
                    placeholder="e.g. user@semd.vn"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className={`w-full bg-slate-950 border rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono ${formErrors.email ? 'border-red-500' : 'border-slate-800'}`}
                  />
                  {formErrors.email && <p className="text-red-400 text-[10px] mt-1">{formErrors.email}</p>}
                </div>

                {/* Roles Checkboxes */}
                <div className="space-y-2 pt-1">
                  <label className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                    Phân Quyền Vai Trò (Roles) <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                    {AVAILABLE_ROLES.map(role => {
                      const isChecked = formData.roles.includes(role);
                      const badge = getRoleBadge(role);
                      return (
                        <label 
                          key={role} 
                          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border ${isChecked ? 'bg-slate-900 border-indigo-500/50 shadow-sm' : 'bg-transparent border-transparent hover:bg-slate-900/50'}`}
                        >
                          <input 
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleRole(role)}
                            className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0 w-4 h-4"
                          />
                          <span className={`text-[11px] font-mono font-semibold ${isChecked ? 'text-white' : 'text-slate-400'}`}>
                            {badge.label}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                  {formErrors.roles && <p className="text-red-400 text-[10px] mt-1">{formErrors.roles}</p>}
                </div>

                {/* Status Toggle */}
                <div className="pt-2 flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-200 block">Trạng thái kích hoạt tài khoản</span>
                    <span className="text-[10px] text-slate-500">Tài khoản Active mới có thể đăng nhập vào hệ thống</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex justify-end gap-2.5 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
              >
                Hủy bỏ
              </button>
              <button 
                type="submit"
                form="user-form"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-950/60 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <CheckCircle size={14} />
                )}
                {editingUser ? 'Cập Nhật' : 'Tạo Tài Khoản'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserManagement;
