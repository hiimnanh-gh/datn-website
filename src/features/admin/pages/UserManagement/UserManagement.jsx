import React, { useState, useEffect, useCallback } from 'react';
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
  Filter
} from 'lucide-react';
import { userService } from '../../../../services/userService';

// Custom Toast Component
const Toast = ({ message, type, onClose }) => {
  if (!message) return null;
  return (
    <div className={`fixed top-4 right-4 z-[9999] flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl animate-fade-in
      ${type === 'success' ? 'bg-emerald-900 border border-emerald-700 text-emerald-100' : 'bg-red-900 border border-red-700 text-red-100'}`}
    >
      {type === 'success' ? <CheckCircle size={18} className="text-emerald-400" /> : <AlertCircle size={18} className="text-red-400" />}
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-75 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

const AVAILABLE_ROLES = ["ADMIN", "DISPATCHER", "DRIVER", "PROVIDER_ADMIN", "REPORTER"];

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
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username || '',
        password: '', // Rỗng khi sửa
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        email: user.email || '',
        roles: user.roles || [],
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
        roles: [],
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

  return (
    <div className="p-6 h-full flex flex-col bg-slate-950 text-slate-200">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-indigo-500">groups</span>
            Quản Lý Người Dùng (User Management)
          </h1>
          <p className="text-sm text-slate-400 mt-1">Quản lý tài khoản, phân quyền và trạng thái hoạt động trên toàn hệ thống</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPageNumber(0);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Tất cả vai trò</option>
              {AVAILABLE_ROLES.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageNumber(0);
              }}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="ACTIVE">Hoạt động (Active)</option>
              <option value="INACTIVE">Vô hiệu hóa (Inactive)</option>
            </select>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-52">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Tìm user, SĐT..." 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPageNumber(0);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Add New Button */}
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-lg shadow-indigo-900/40"
          >
            <Plus size={16} /> Thêm Mới
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
            <thead className="bg-slate-900 text-slate-300 sticky top-0 z-20 shadow-sm border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5 font-semibold bg-slate-900">Username</th>
                <th className="px-4 py-3.5 font-semibold bg-slate-900">Full Name</th>
                <th className="px-4 py-3.5 font-semibold bg-slate-900">Contact Info</th>
                <th className="px-4 py-3.5 font-semibold bg-slate-900">Roles</th>
                <th className="px-4 py-3.5 font-semibold bg-slate-900">Status</th>
                <th className="px-4 py-3.5 font-semibold bg-slate-900 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-400">Đang tải dữ liệu người dùng...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="6" className="px-4 py-12 text-center text-slate-500">Không tìm thấy người dùng nào phù hợp</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-white">{user.username}</td>
                    <td className="px-4 py-3">{user.fullName}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span>{user.phoneNumber}</span>
                        <span className="text-xs text-slate-500">{user.email || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap w-48">
                        {user.roles?.map(r => (
                          <span key={r} className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-900/50 text-indigo-300 border border-indigo-800/50">
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {user.isActive ? (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-900/30 text-emerald-400 border border-emerald-800/30">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-900/30 text-red-400 border border-red-800/30">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 rounded transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id, user.username)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Pagination Footer Bar ── */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-400">
            <span>Hiển thị</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="bg-slate-900 border border-slate-750 text-slate-200 rounded px-2 py-1 outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>dòng/trang • Tổng số <strong>{totalElements}</strong> tài khoản</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(0)}
              disabled={pageNumber === 0 || loading}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang đầu"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => handlePageChange(pageNumber - 1)}
              disabled={pageNumber === 0 || loading}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang trước"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="px-3 py-1 bg-indigo-950 text-indigo-300 font-bold border border-indigo-800 rounded">
              Trang {pageNumber + 1} / {totalPages || 1}
            </span>

            <button
              onClick={() => handlePageChange(pageNumber + 1)}
              disabled={pageNumber >= totalPages - 1 || loading}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang sau"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => handlePageChange(totalPages - 1)}
              disabled={pageNumber >= totalPages - 1 || loading}
              className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Trang cuối"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-white">
                {editingUser ? 'Cập nhật Người dùng' : 'Tạo mới Người dùng'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="user-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Username */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Username <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                      disabled={!!editingUser}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 ${formErrors.username ? 'border-red-500' : 'border-slate-700'} ${editingUser ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                    {formErrors.username && <p className="text-red-400 text-xs mt-1">{formErrors.username}</p>}
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Password {editingUser ? '(Để trống nếu không đổi)' : <span className="text-red-500">*</span>}
                    </label>
                    <input 
                      type="password" 
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      placeholder={editingUser ? "••••••••" : ""}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 ${formErrors.password ? 'border-red-500' : 'border-slate-700'}`}
                    />
                    {formErrors.password && <p className="text-red-400 text-xs mt-1">{formErrors.password}</p>}
                  </div>

                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Họ và tên <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.fullName}
                      onChange={e => setFormData({...formData, fullName: e.target.value})}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 ${formErrors.fullName ? 'border-red-500' : 'border-slate-700'}`}
                    />
                    {formErrors.fullName && <p className="text-red-400 text-xs mt-1">{formErrors.fullName}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Số điện thoại <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={formData.phoneNumber}
                      onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 ${formErrors.phoneNumber ? 'border-red-500' : 'border-slate-700'}`}
                    />
                    {formErrors.phoneNumber && <p className="text-red-400 text-xs mt-1">{formErrors.phoneNumber}</p>}
                  </div>

                  {/* Email */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 ${formErrors.email ? 'border-red-500' : 'border-slate-700'}`}
                    />
                    {formErrors.email && <p className="text-red-400 text-xs mt-1">{formErrors.email}</p>}
                  </div>

                  {/* Roles */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Phân quyền <span className="text-red-500">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_ROLES.map(role => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => toggleRole(role)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                            ${formData.roles.includes(role) 
                              ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-900/50' 
                              : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700'}`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    {formErrors.roles && <p className="text-red-400 text-xs mt-1">{formErrors.roles}</p>}
                  </div>

                  {/* Status */}
                  <div className="space-y-1 md:col-span-2 flex items-center justify-between bg-slate-950 border border-slate-700 p-3 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-white">Trạng thái hoạt động</div>
                      <div className="text-xs text-slate-500">Khóa hoặc mở khóa tài khoản này</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                </div>
              </form>
            </div>

            <div className="px-6 py-4 border-t border-slate-700 flex justify-end gap-3 shrink-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Hủy
              </button>
              <button 
                type="submit" 
                form="user-form"
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                {editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
