import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Plus, Edit3, Trash2, Search, X, Check, RefreshCw, Phone, Mail, MapPin, Activity
} from 'lucide-react';
import { providerService } from '../../../../services/providerService';
import './ProviderManagement.css';

const ProviderManagement = () => {
  const [providers, setProviders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    providerName: '',
    contactPhone: '',
    contactEmail: '',
    address: '',
    status: 'ACTIVE'
  });

  const fetchProviders = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await providerService.getAll();
      setProviders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching providers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleOpenModal = (provider = null) => {
    if (provider) {
      setFormData({
        id: provider.id,
        providerName: provider.providerName || '',
        contactPhone: provider.contactPhone || '',
        contactEmail: provider.contactEmail || '',
        address: provider.address || '',
        status: provider.status || 'ACTIVE'
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        providerName: '',
        contactPhone: '',
        contactEmail: '',
        address: '',
        status: 'ACTIVE'
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing) {
        await providerService.update(formData.id, formData);
      } else {
        await providerService.create(formData);
      }
      setIsModalOpen(false);
      fetchProviders();
    } catch (error) {
      console.error('Error saving provider:', error);
      alert('Không thể lưu thông tin: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa đơn vị: ${name}?`)) {
      try {
        await providerService.delete(id);
        fetchProviders();
      } catch (error) {
        console.error('Error deleting provider:', error);
        alert('Lỗi xóa đơn vị: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const filteredProviders = providers.filter(p => 
    p.providerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.contactPhone?.includes(searchTerm)
  );

  return (
    <div className="provider-management-page p-6 font-sans text-slate-100 flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Building2 className="text-indigo-400" size={24} />
            Quản lý Đơn vị (Providers)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý danh sách các đơn vị cung cấp xe cứu thương và phòng khám
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchProviders}
            className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Làm mới
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-indigo-900/40"
          >
            <Plus size={16} />
            Thêm Đơn vị
          </button>
        </div>
      </div>

      {/* Toolbar & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-4 px-5">ID</th>
                <th className="py-4 px-5">Tên Đơn vị</th>
                <th className="py-4 px-5">Liên hệ</th>
                <th className="py-4 px-5">Địa chỉ</th>
                <th className="py-4 px-5">Trạng thái</th>
                <th className="py-4 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Không tìm thấy đơn vị nào.
                  </td>
                </tr>
              ) : (
                filteredProviders.map(provider => (
                  <tr key={provider.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-xs">#{provider.id}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-100">{provider.providerName}</td>
                    <td className="py-3.5 px-5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone size={12} className="text-slate-500" />
                        {provider.contactPhone || <span className="text-slate-600 italic">Trống</span>}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Mail size={12} className="text-slate-500" />
                        {provider.contactEmail || <span className="text-slate-600 italic">Trống</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-400 max-w-[200px] truncate">
                      {provider.address || <span className="text-slate-600 italic">Chưa cập nhật</span>}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        provider.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <Activity size={10} />
                        {provider.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right space-x-2">
                      <button
                        onClick={() => handleOpenModal(provider)}
                        className="p-1.5 bg-slate-800 hover:bg-indigo-900/60 text-slate-300 hover:text-indigo-400 rounded transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(provider.id, provider.providerName)}
                        className="p-1.5 bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-400 rounded transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="modal-enter bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                {isEditing ? <Edit3 className="text-indigo-400" size={20} /> : <Plus className="text-emerald-400" size={20} />}
                {isEditing ? 'Cập nhật Đơn vị' : 'Thêm mới Đơn vị'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Tên đơn vị <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="providerName"
                  value={formData.providerName}
                  onChange={handleChange}
                  required
                  placeholder="Ví dụ: Phòng khám Đa khoa A..."
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Số điện thoại</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="0912..."
                      className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="email@..."
                      className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Địa chỉ</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, quận..."
                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors appearance-none"
                >
                  <option value="ACTIVE">ACTIVE (Hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Tạm dừng)</option>
                  <option value="SUSPENDED">SUSPENDED (Đình chỉ)</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-indigo-900/40 disabled:opacity-70"
                >
                  {isSaving ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Check size={16} />
                  )}
                  {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderManagement;
