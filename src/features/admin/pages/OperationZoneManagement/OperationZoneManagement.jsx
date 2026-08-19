import React, { useState, useEffect, useCallback } from 'react';
import { 
  RadioTower, Plus, Edit3, Trash2, Search, X, RefreshCw, MapPin, Globe, Activity
} from 'lucide-react';
import { operationZoneService } from '../../../../services/operationZoneService';

const OperationZoneManagement = () => {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    zoneName: '',
    coverageAreaJson: '',
    isActive: true
  });

  const fetchZones = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await operationZoneService.getAll();
      setZones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching operation zones:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  const handleOpenModal = (zone = null) => {
    if (zone) {
      setFormData({
        id: zone.id,
        zoneName: zone.zoneName || zone.nodeName || '',
        coverageAreaJson: zone.coverageArea ? JSON.stringify(zone.coverageArea, null, 2) : '',
        isActive: zone.isActive !== undefined ? zone.isActive : true
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        zoneName: '',
        coverageAreaJson: '',
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
      let coverageArea = [];
      if (formData.coverageAreaJson?.trim()) {
        try {
          coverageArea = JSON.parse(formData.coverageAreaJson);
        } catch (jsonErr) {
          alert('Dữ liệu Tọa độ phạm vi (coverageArea) phải là định dạng JSON hợp lệ dạng: [{"latitude": 21.0, "longitude": 105.8}]');
          setIsSaving(false);
          return;
        }
      }

      const payload = {
        zoneName: formData.zoneName,
        coverageArea: Array.isArray(coverageArea) ? coverageArea : [],
        isActive: !!formData.isActive
      };

      if (isEditing && formData.id) {
        await operationZoneService.update(formData.id, payload);
      } else {
        await operationZoneService.create(payload);
      }
      fetchZones();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving operation zone:', err);
      alert('Lưu thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc muốn xóa Vùng hoạt động "${name}"?`)) return;
    try {
      await operationZoneService.delete(id);
      fetchZones();
    } catch (err) {
      console.error('Error deleting zone:', err);
      alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredZones = zones.filter(z => {
    const term = searchTerm.toLowerCase();
    const name = (z.zoneName || z.nodeName || '').toLowerCase();
    return name.includes(term) || z.id?.toString().includes(term);
  });

  return (
    <div className="p-6 bg-slate-950 min-h-full text-slate-100 font-sans space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <RadioTower className="text-indigo-400" size={24} />
            Quản lý Vùng hoạt động (Operation Zones)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Phân vùng điều phối địa lý và điều phối luồng xe cứu thương theo khu vực.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchZones}
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
            Tạo Vùng hoạt động Mới
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
          placeholder="Tìm theo ID, tên vùng hoạt động..."
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
        <div className="text-center py-12 text-slate-400 text-xs font-mono">Đang tải danh sách vùng hoạt động...</div>
      ) : filteredZones.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          Chưa có vùng hoạt động nào.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredZones.map(z => {
            const zName = z.zoneName || z.nodeName || `Zone #${z.id}`;
            const pointCount = Array.isArray(z.coverageArea) ? z.coverageArea.length : 0;
            return (
              <div key={z.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800">
                        ID: #{z.id}
                      </span>
                      <h3 className="font-bold text-sm text-slate-100 mt-1">{zName}</h3>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      z.isActive !== false ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {z.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 space-y-1 font-sans">
                    <div className="flex items-center gap-1.5">
                      <Globe size={14} className="text-slate-500 shrink-0" />
                      <span>{pointCount > 0 ? `${pointCount} điểm biên tọa độ` : 'Chưa thiết lập vùng polygon'}</span>
                    </div>
                    {z.createdAt && (
                      <div className="text-[11px] font-mono text-slate-500">
                        Tạo lúc: {new Date(z.createdAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-800 pt-3 mt-4">
                  <button
                    onClick={() => handleOpenModal(z)}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 transition-colors"
                  >
                    <Edit3 size={14} />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(z.id, zName)}
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
                {isEditing ? 'Cập nhật Vùng hoạt động' : 'Tạo Vùng hoạt động Mới'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tên Vùng hoạt động (zoneName) *</label>
                <input
                  type="text"
                  name="zoneName"
                  value={formData.zoneName}
                  onChange={handleChange}
                  required
                  placeholder="Vùng điều phối Quận Ba Đình..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Tọa độ biên Coverage Area (JSON Array)</label>
                <textarea
                  name="coverageAreaJson"
                  rows={4}
                  value={formData.coverageAreaJson}
                  onChange={handleChange}
                  placeholder={`[\n  {"latitude": 21.033, "longitude": 105.815},\n  {"latitude": 21.040, "longitude": 105.830}\n]`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-indigo-500 resize-none"
                />
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
                  <span>Đang hoạt động (isActive)</span>
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

export default OperationZoneManagement;
