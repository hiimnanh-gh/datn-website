import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Plus, Edit3, Trash2, Search, X, RefreshCw, Phone, MapPin, Activity, ShieldAlert
} from 'lucide-react';
import { medicalHospitalService } from '../../../../services/medicalHospitalService';

const HospitalManagement = () => {
  const [hospitals, setHospitals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    id: null,
    hospitalName: '',
    contactPhone: '',
    hospitalAddress: '',
    latitude: '',
    longitude: '',
    isActive: true
  });

  const fetchHospitals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await medicalHospitalService.getAll();
      setHospitals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHospitals();
  }, [fetchHospitals]);

  const handleOpenModal = (hospital = null) => {
    if (hospital) {
      setFormData({
        id: hospital.id,
        hospitalName: hospital.hospitalName || hospital.name || '',
        contactPhone: hospital.contactPhone || hospital.phone || hospital.phoneNumber || '',
        hospitalAddress: hospital.hospitalAddress || hospital.address || '',
        latitude: hospital.latitude !== undefined && hospital.latitude !== null ? hospital.latitude : '',
        longitude: hospital.longitude !== undefined && hospital.longitude !== null ? hospital.longitude : '',
        isActive: hospital.isActive !== undefined ? hospital.isActive : true
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        hospitalName: '',
        contactPhone: '',
        hospitalAddress: '',
        latitude: '',
        longitude: '',
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
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        hospitalName: formData.hospitalName,
        contactPhone: formData.contactPhone,
        hospitalAddress: formData.hospitalAddress,
        latitude: formData.latitude !== '' ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude !== '' ? parseFloat(formData.longitude) : null,
        isActive: !!formData.isActive
      };

      if (isEditing && formData.id) {
        await medicalHospitalService.update(formData.id, payload);
      } else {
        await medicalHospitalService.create(payload);
      }
      fetchHospitals();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving hospital:', err);
      alert('Lưu thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa bệnh viện/trung tâm "${name}"?`)) return;
    try {
      await medicalHospitalService.delete(id);
      fetchHospitals();
    } catch (err) {
      console.error('Error deleting hospital:', err);
      alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredHospitals = hospitals.filter(h => {
    const term = searchTerm.toLowerCase();
    const nameStr = (h.hospitalName || h.name || '').toLowerCase();
    const addrStr = (h.hospitalAddress || h.address || '').toLowerCase();
    const phoneStr = (h.contactPhone || h.phone || h.phoneNumber || '').toLowerCase();
    return nameStr.includes(term) || addrStr.includes(term) || phoneStr.includes(term);
  });

  return (
    <div className="p-6 bg-slate-950 min-h-full text-slate-100 font-sans space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="text-indigo-400" size={24} />
            Quản lý Bệnh viện & Trung tâm Cấp cứu
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Danh sách các trung tâm tiếp nhận bệnh nhân và điểm hạ cánh xe cứu thương.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchHospitals}
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
            Tạo Bệnh viện Mới
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
          placeholder="Tìm theo tên bệnh viện, địa chỉ, số điện thoại..."
          className="bg-transparent text-xs text-slate-100 focus:outline-none w-full placeholder:text-slate-500"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Hospitals Grid / List */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-mono">Đang tải danh sách bệnh viện...</div>
      ) : filteredHospitals.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          Không tìm thấy bệnh viện nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHospitals.map(h => {
            const hName = h.hospitalName || h.name || `Bệnh viện #${h.id}`;
            const hPhone = h.contactPhone || h.phone || h.phoneNumber || 'N/A';
            const hAddress = h.hospitalAddress || h.address || 'Chưa cập nhật địa chỉ';
            return (
              <div key={h.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm text-slate-100">{hName}</h3>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      h.isActive !== false ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {h.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 font-sans">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-slate-500 shrink-0" />
                      <span className="truncate">{hAddress}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={14} className="text-slate-500 shrink-0" />
                      <span>{hPhone}</span>
                    </div>
                    {h.latitude && h.longitude && (
                      <div className="text-[11px] font-mono text-slate-500">
                        GPS: {h.latitude}, {h.longitude}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3 mt-4">
                  <button
                    onClick={() => handleOpenModal(h)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Edit3 size={14} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(h.id, hName)}
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
                {isEditing ? 'Cập nhật Bệnh viện' : 'Thêm Bệnh viện / Trung tâm Cấp cứu'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tên Bệnh viện / Trung tâm *</label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                  placeholder="Bệnh viện Bạch Mai - Khoa Cấp cứu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Số điện thoại hotline</label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone}
                  onChange={handleChange}
                  placeholder="024-3869-xxxx"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  name="hospitalAddress"
                  value={formData.hospitalAddress}
                  onChange={handleChange}
                  placeholder="78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Vĩ độ (Latitude)</label>
                  <input
                    type="number"
                    step="any"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    placeholder="21.0031"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Kinh độ (Longitude)</label>
                  <input
                    type="number"
                    step="any"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    placeholder="105.8432"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>Đang hoạt động tiếp nhận (isActive)</span>
                </label>
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

export default HospitalManagement;
