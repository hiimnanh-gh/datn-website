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
    providerType: 'PRIVATE',
    businessLicense: '',
    contactPhone: '',
    contactAddress: '',
    commissionRate: 10,
    isVerified: true,
    isActive: true
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
        providerType: provider.providerType || 'PRIVATE',
        businessLicense: provider.businessLicense || '',
        contactPhone: provider.contactPhone || '',
        contactAddress: provider.contactAddress || provider.address || '',
        commissionRate: provider.commissionRate !== undefined ? provider.commissionRate : 10,
        isVerified: provider.isVerified !== undefined ? provider.isVerified : true,
        isActive: provider.isActive !== undefined ? provider.isActive : true
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        providerName: '',
        providerType: 'PRIVATE',
        businessLicense: '',
        contactPhone: '',
        contactAddress: '',
        commissionRate: 10,
        isVerified: true,
        isActive: true
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'commissionRate' ? parseFloat(value) || 0 : value) 
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        providerName: formData.providerName,
        providerType: formData.providerType || 'PRIVATE',
        businessLicense: formData.businessLicense,
        contactPhone: formData.contactPhone,
        contactAddress: formData.contactAddress,
        commissionRate: parseFloat(formData.commissionRate) || 0,
        isVerified: !!formData.isVerified,
        isActive: !!formData.isActive
      };

      if (isEditing && formData.id) {
        await providerService.update(formData.id, payload);
      } else {
        await providerService.create(payload);
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
    p.contactPhone?.includes(searchTerm) ||
    p.providerType?.toLowerCase().includes(searchTerm.toLowerCase())
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
                <th className="py-4 px-5">Loại hình</th>
                <th className="py-4 px-5">Liên hệ</th>
                <th className="py-4 px-5">Địa chỉ</th>
                <th className="py-4 px-5">Hoa hồng</th>
                <th className="py-4 px-5">Trạng thái</th>
                <th className="py-4 px-5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Đang tải danh sách...
                  </td>
                </tr>
              ) : filteredProviders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Không tìm thấy đơn vị nào.
                  </td>
                </tr>
              ) : (
                filteredProviders.map(provider => (
                  <tr key={provider.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-slate-400 text-xs">#{provider.id}</td>
                    <td className="py-3.5 px-5 font-medium text-slate-100">
                      <div>{provider.providerName}</div>
                      {provider.businessLicense && (
                        <div className="text-[11px] text-slate-500 font-mono">GPKD: {provider.businessLicense}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-300">
                      <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-[11px]">
                        {provider.providerType || 'PRIVATE'}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 space-y-1">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Phone size={12} className="text-slate-500" />
                        {provider.contactPhone || <span className="text-slate-600 italic">Trống</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-400 max-w-[200px] truncate">
                      {provider.contactAddress || provider.address || <span className="text-slate-600 italic">Chưa cập nhật</span>}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-xs text-amber-400">
                      {provider.commissionRate ?? 0}%
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        provider.isActive !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <Activity size={10} />
                        {provider.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
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

            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Tên đơn vị <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="providerName"
                  value={formData.providerName}
                  onChange={handleChange}
                  required
                  placeholder="Ví dụ: Công ty Cứu hộ Y tế An Tâm..."
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Loại hình đơn vị</label>
                  <select
                    name="providerType"
                    value={formData.providerType}
                    onChange={handleChange}
                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="PRIVATE">Tư nhân (PRIVATE)</option>
                    <option value="PUBLIC">Công lập (PUBLIC)</option>
                    <option value="HOSPITAL">Bệnh viện (HOSPITAL)</option>
                    <option value="CLINIC">Phòng khám (CLINIC)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Giấy phép KD</label>
                  <input
                    type="text"
                    name="businessLicense"
                    value={formData.businessLicense}
                    onChange={handleChange}
                    placeholder="GPKD-123456"
                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Số điện thoại liên hệ</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      name="contactPhone"
                      value={formData.contactPhone}
                      onChange={handleChange}
                      placeholder="0912345678"
                      className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Tỉ lệ hoa hồng (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    name="commissionRate"
                    value={formData.commissionRate}
                    onChange={handleChange}
                    placeholder="10.0"
                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 block">Địa chỉ liên hệ</label>
                <div className="relative">
                  <MapPin size={14} className="absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    name="contactAddress"
                    value={formData.contactAddress}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, quận, thành phố..."
                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-9 pr-3 py-2.5 outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>Đang hoạt động (isActive)</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={formData.isVerified}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>Đã xác minh (isVerified)</span>
                </label>
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
