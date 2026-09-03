import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Truck, RefreshCw, Search, Edit3, X, MapPin, Plus, Trash2, Check
} from 'lucide-react';
import { dispatchResourceService } from '../../../../services/dispatchResourceService';
import { providerService } from '../../../../services/providerService';
import { serviceTypeService } from '../../../../services/serviceTypeService';
import useAuthStore from '../../../../store/useAuthStore';

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'DISPATCHED':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    case 'ON_MISSION':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'RETURNING':
      return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40';
    case 'OFFLINE':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    case 'MAINTENANCE':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    case 'OUT_OF_SERVICE':
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};

const FleetManagement = () => {
  const { user } = useAuthStore();
  const [resources, setResources] = useState([]);
  const [providers, setProviders] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);

  const userRoles = useMemo(() => {
    if (Array.isArray(user?.roles)) {
      return user.roles.map(r => (typeof r === 'string' ? r.toUpperCase() : r?.name?.toUpperCase() || ''));
    }
    return [user?.role?.toUpperCase()].filter(Boolean);
  }, [user]);

  const isGlobalAdminOrDispatcher = useMemo(() => {
    return userRoles.some(r => ['ADMIN', 'DISPATCHER'].includes(r));
  }, [userRoles]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Status Update Modal
  const [editStatusModal, setEditStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('AVAILABLE');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Add / Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    resourceCode: '',
    resourceTypeId: '',
    providerId: '',
    status: 'AVAILABLE'
  });

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      let fetchProvidersPromise;
      if (isGlobalAdminOrDispatcher) {
        fetchProvidersPromise = providerService.getAll().catch(() => []);
      } else if (user?.providerId) {
        fetchProvidersPromise = providerService.getById(user.providerId)
          .then(res => (res ? [res] : []))
          .catch(() => []);
      } else {
        fetchProvidersPromise = Promise.resolve([]);
      }

      const [resList, provList, stList] = await Promise.all([
        dispatchResourceService.getAll(),
        fetchProvidersPromise,
        serviceTypeService.getAll().catch(() => []),
      ]);

      let finalProviders = Array.isArray(provList) ? provList : [];
      if (finalProviders.length === 0 && user?.providerId) {
        finalProviders = [{ id: user.providerId, providerName: user.providerName || `Đơn vị #${user.providerId}` }];
      }

      setResources(Array.isArray(resList) ? resList : []);
      setProviders(finalProviders);
      setServiceTypes(Array.isArray(stList) ? stList : []);
    } catch (err) {
      console.error('Error fetching fleet resources data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isGlobalAdminOrDispatcher, user]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Handle Update Status Only
  const handleUpdateStatus = async () => {
    if (!editStatusModal) return;
    setIsUpdatingStatus(true);
    try {
      await dispatchResourceService.updateStatus(editStatusModal.id, newStatus);
      setEditStatusModal(null);
      fetchAllData();
    } catch (err) {
      console.error('Error updating resource status:', err);
      alert('Cập nhật trạng thái xe thất bại!');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Open Form Modal
  const handleOpenFormModal = (resource = null) => {
    if (resource) {
      setFormData({
        id: resource.id,
        resourceCode: resource.resourceCode || '',
        resourceTypeId: resource.resourceTypeId || '',
        providerId: resource.providerId || '',
        zoneId: resource.zoneId || '',
        status: resource.status || 'AVAILABLE'
      });
      setIsEditing(true);
    } else {
      setFormData({
        id: null,
        resourceCode: '',
        resourceTypeId: serviceTypes.length > 0 ? serviceTypes[0].id : '',
        providerId: user?.providerId || (providers.length > 0 ? providers[0].id : ''),
        zoneId: null,
        status: 'AVAILABLE'
      });
      setIsEditing(false);
    }
    setIsFormModalOpen(true);
  };

  // Handle Form Change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle Save (Create / Update)
  const handleSaveResource = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload = {
        resourceCode: formData.resourceCode.trim(),
        resourceTypeId: Number(formData.resourceTypeId) || null,
        providerId: Number(formData.providerId) || null,
        status: formData.status
      };

      if (isEditing) {
        await dispatchResourceService.update(formData.id, payload);
      } else {
        await dispatchResourceService.create(payload);
      }
      setIsFormModalOpen(false);
      fetchAllData();
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Không thể lưu thông tin xe: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Delete
  const handleDeleteResource = async (id, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa xe [${code}] không?`)) {
      try {
        await dispatchResourceService.delete(id);
        fetchAllData();
      } catch (error) {
        console.error('Error deleting resource:', error);
        alert('Lỗi xóa xe: ' + (error.response?.data?.message || error.message));
      }
    }
  };

  const filteredFleet = resources.filter(res => {
    const codeMatch = searchTerm ? res.resourceCode?.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const statusMatch = statusFilter === 'ALL' || res.status === statusFilter;
    return codeMatch && statusMatch;
  });

  return (
    <div className="text-slate-100 p-6 space-y-6 font-sans bg-slate-950 min-h-screen">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-wider font-mono text-white uppercase flex items-center gap-2">
            <Truck className="text-blue-500" size={24} />
            Quản lý Đội xe (Fleet Management)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý danh sách phương tiện cấp cứu và trạng thái vận hành của đơn vị.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors font-mono"
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Làm mới Đội xe
          </button>
          <button
            onClick={() => handleOpenFormModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-lg shadow-blue-900/40"
          >
            <Plus size={16} />
            Thêm xe mới
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo Mã xe (Resource Code)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">Trạng thái: Tất cả</option>
          <option value="AVAILABLE">AVAILABLE (Có sẵn)</option>
          <option value="BUSY">BUSY (Đang bận)</option>
          <option value="OFFLINE">OFFLINE (Tắt máy)</option>
          <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300 min-w-max">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Mã tài nguyên</th>
                <th className="py-3.5 px-4">Loại dịch vụ</th>
                <th className="py-3.5 px-4">Đơn vị (Provider)</th>
                <th className="py-3.5 px-4">Tài xế hiện tại</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    Đang tải thông tin Đội xe...
                  </td>
                </tr>
              ) : filteredFleet.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 font-sans">
                    Không tìm thấy phương tiện phù hợp.
                  </td>
                </tr>
              ) : (
                filteredFleet.map(res => (
                  <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-blue-400 flex items-center gap-2">
                      <Truck size={14} className="text-blue-500" />
                      {res.resourceCode}
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-sans">
                      {res.resourceTypeName || `Type #${res.resourceTypeId}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">
                      {res.providerName || `Provider #${res.providerId}`}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">
                      {res.currentDriverName || <span className="text-slate-500 italic">Chưa gán</span>}
                    </td>
                    <td className="py-3.5 px-4">
                      <button 
                        onClick={() => {
                          setEditStatusModal(res);
                          setNewStatus(res.status);
                        }}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border hover:opacity-80 transition-opacity cursor-pointer ${getStatusBadge(res.status)}`}
                        title="Nhấn để đổi trạng thái nhanh"
                      >
                        {res.status}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans space-x-2">
                      <button
                        onClick={() => handleOpenFormModal(res)}
                        className="p-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 rounded transition-colors"
                        title="Cập nhật thông tin xe"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteResource(res.id, res.resourceCode)}
                        className="p-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded transition-colors"
                        title="Xóa xe"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT FORM MODAL */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full flex flex-col overflow-hidden shadow-2xl animate-scale-in">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-lg text-white flex items-center gap-2">
                {isEditing ? <Edit3 className="text-blue-400" size={20} /> : <Plus className="text-emerald-400" size={20} />}
                {isEditing ? 'Cập nhật Thông tin Xe' : 'Thêm mới Xe Cứu Thương'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveResource} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Mã xe (Resource Code) <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  name="resourceCode"
                  value={formData.resourceCode}
                  onChange={handleFormChange}
                  required
                  placeholder="Ví dụ: AMB-001..."
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white font-mono rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Loại dịch vụ (Service Type) <span className="text-rose-500">*</span></label>
                <select
                  name="resourceTypeId"
                  value={formData.resourceTypeId}
                  onChange={handleFormChange}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="" disabled>-- Chọn Loại Dịch Vụ --</option>
                  {serviceTypes.map(st => (
                    <option key={st.id} value={st.id}>{st.displayName || st.typeCode}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Đơn vị Quản lý (Provider) <span className="text-rose-500">*</span></label>
                <select
                  name="providerId"
                  value={formData.providerId}
                  onChange={handleFormChange}
                  disabled={!isGlobalAdminOrDispatcher && !!user?.providerId}
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>-- Chọn Đơn Vị --</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.providerName}</option>
                  ))}
                  {providers.length === 0 && user?.providerId && (
                    <option value={user.providerId}>{user.providerName || `Đơn vị #${user.providerId}`}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Trạng thái (Status)</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleFormChange}
                  className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="AVAILABLE">AVAILABLE - Sẵn sàng điều xe</option>
                  <option value="DISPATCHED">DISPATCHED - Đã gán lệnh điều xe</option>
                  <option value="ON_MISSION">ON_MISSION - Đang thực hiện nhiệm vụ</option>
                  <option value="RETURNING">RETURNING - Đang trở về trạm</option>
                  <option value="OFFLINE">OFFLINE - Tắt máy / Nghỉ ca</option>
                  <option value="MAINTENANCE">MAINTENANCE - Bảo dưỡng</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE - Tạm ngừng phục vụ</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800 mt-6">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/40 disabled:opacity-70"
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

      {/* EDIT STATUS MODAL (QUICK ACTION) */}
      {editStatusModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2 font-mono">
                <Edit3 className="text-blue-400" size={18} />
                Đổi Trạng thái Nhanh: {editStatusModal.resourceCode}
              </h3>
              <button onClick={() => setEditStatusModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono space-y-1">
                <div>Đơn vị: <span className="text-slate-300">{editStatusModal.providerName}</span></div>
                <div>Trạng thái hiện tại: <span className="text-blue-400 font-bold">{editStatusModal.status}</span></div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 uppercase font-semibold">Trạng thái mới</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="AVAILABLE">AVAILABLE - Sẵn sàng điều xe</option>
                  <option value="DISPATCHED">DISPATCHED - Đã gán lệnh điều xe</option>
                  <option value="ON_MISSION">ON_MISSION - Đang thực hiện nhiệm vụ</option>
                  <option value="RETURNING">RETURNING - Đang trở về trạm</option>
                  <option value="OFFLINE">OFFLINE - Tắt máy / Nghỉ ca</option>
                  <option value="MAINTENANCE">MAINTENANCE - Bảo dưỡng kỹ thuật</option>
                  <option value="OUT_OF_SERVICE">OUT_OF_SERVICE - Tạm ngừng phục vụ</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-3 mt-4">
              <button
                onClick={() => setEditStatusModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors font-mono"
              >
                {isUpdatingStatus ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FleetManagement;
