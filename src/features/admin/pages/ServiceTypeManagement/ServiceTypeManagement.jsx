import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, Plus, Edit3, Trash2, Search, X, RefreshCw, Layers
} from 'lucide-react';
import { serviceTypeService } from '../../../../services/serviceTypeService';

const ServiceTypeManagement = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    typeName: '',
    description: '',
    baseFee: ''
  });

  const fetchServiceTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await serviceTypeService.getAll();
      setServiceTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching service types:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServiceTypes();
  }, [fetchServiceTypes]);

  const handleOpenModal = (st = null) => {
    if (st) {
      setFormData({
        id: st.id,
        typeName: st.typeName || st.name || '',
        description: st.description || '',
        baseFee: st.baseFee || ''
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        typeName: '',
        description: '',
        baseFee: ''
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
      const payload = {
        typeName: formData.typeName,
        description: formData.description,
        baseFee: formData.baseFee ? parseFloat(formData.baseFee) : 0
      };

      if (isEditing && formData.id) {
        await serviceTypeService.update(formData.id, payload);
      } else {
        await serviceTypeService.create(payload);
      }
      fetchServiceTypes();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving service type:', err);
      alert('Lưu thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa loại dịch vụ "${name}"?`)) return;
    try {
      await serviceTypeService.delete(id);
      fetchServiceTypes();
    } catch (err) {
      console.error('Error deleting service type:', err);
      alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredTypes = serviceTypes.filter(st => {
    const term = searchTerm.toLowerCase();
    const name = (st.typeName || st.name || '').toLowerCase();
    const desc = (st.description || '').toLowerCase();
    return name.includes(term) || desc.includes(term);
  });

  return (
    <div className="p-6 bg-slate-950 min-h-full text-slate-100 font-sans space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Layers className="text-indigo-400" size={24} />
            Quản lý Danh mục Loại xe & Dịch vụ Cấp cứu
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Phân loại dịch vụ cứu thương (Cấp cứu 115, Vận chuyển ICU, Chuyên gia y tế...)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchServiceTypes}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs transition-colors"
            title="Tải lại dữ liệu"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
          >
            <Plus size={16} />
            Tạo Loại dịch vụ Mới
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên loại dịch vụ..."
          className="bg-transparent text-xs text-slate-100 focus:outline-none w-full placeholder:text-slate-500"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* List Grid */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-mono">Đang tải loại dịch vụ...</div>
      ) : filteredTypes.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          Chưa có loại dịch vụ nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTypes.map(st => {
            const stName = st.typeName || st.name || `Loại dịch vụ #${st.id}`;
            return (
              <div key={st.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-100">{stName}</h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800">
                      ID #{st.id}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400">
                    {st.description || 'Chưa có mô tả'}
                  </p>

                  {st.baseFee !== undefined && (
                    <div className="text-xs font-mono text-emerald-400">
                      Giá cơ sở: {Number(st.baseFee).toLocaleString()} VNĐ
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3 mt-4">
                  <button
                    onClick={() => handleOpenModal(st)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Edit3 size={14} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(st.id, stName)}
                    className="p-1.5 bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Trash2 size={14} />
                    Xóa
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-sm text-slate-100">
                {isEditing ? 'Cập nhật Loại dịch vụ' : 'Thêm Loại dịch vụ Mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tên Loại dịch vụ *</label>
                <input
                  type="text"
                  name="typeName"
                  value={formData.typeName}
                  onChange={handleChange}
                  required
                  placeholder="Xe Cấp cứu Chuyên dụng (ICU Mobile)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Mô tả</label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Trang bị máy thở, máy sốc tim, kíp bác sĩ chuyên khoa..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Cước phí cơ sở (VNĐ)</label>
                <input
                  type="number"
                  name="baseFee"
                  value={formData.baseFee}
                  onChange={handleChange}
                  placeholder="500000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold shadow-lg shadow-indigo-600/30"
                >
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

export default ServiceTypeManagement;
