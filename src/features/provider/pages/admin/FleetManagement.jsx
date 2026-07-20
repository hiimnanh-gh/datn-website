import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, RefreshCw, Search, Edit3, X, MapPin
} from 'lucide-react';
import { dispatchResourceService } from '../../../../services/dispatchResourceService';

const getStatusBadge = (status) => {
  switch (status?.toUpperCase()) {
    case 'AVAILABLE':
      return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
    case 'BUSY':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'OFFLINE':
      return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
    case 'MAINTENANCE':
      return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};

const FleetManagement = () => {
  const [resources, setResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const [editModal, setEditModal] = useState(null);
  const [newStatus, setNewStatus] = useState('AVAILABLE');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchFleet = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dispatchResourceService.getAll();
      setResources(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching fleet resources:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFleet();
  }, [fetchFleet]);

  const handleUpdateStatus = async () => {
    if (!editModal) return;
    setIsUpdating(true);
    try {
      await dispatchResourceService.updateStatus(editModal.id, newStatus);
      setEditModal(null);
      fetchFleet();
    } catch (err) {
      console.error('Error updating resource status:', err);
      alert('Cập nhật trạng thái xe thất bại!');
    } finally {
      setIsUpdating(false);
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
      <div className="flex justify-between items-center border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-wider font-mono text-white uppercase flex items-center gap-2">
            <Truck className="text-blue-500" size={24} />
            Quản lý Đội xe (Fleet Management)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý danh sách phương tiện cấp cứu và trạng thái vận hành của đơn vị.
          </p>
        </div>

        <button
          onClick={fetchFleet}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors font-mono"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Làm mới Đội xe
        </button>
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
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Mã tài nguyên</th>
              <th className="py-3.5 px-4">Loại dịch vụ</th>
              <th className="py-3.5 px-4">Đơn vị (Provider)</th>
              <th className="py-3.5 px-4">Tài xế hiện tại</th>
              <th className="py-3.5 px-4">Vùng (Edge Node)</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4 text-right">Đổi trạng thái</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
                  Đang tải thông tin Đội xe...
                </td>
              </tr>
            ) : filteredFleet.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-sans">
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
                  <td className="py-3.5 px-4 text-slate-400 font-sans">
                    {res.edgeNodeName || `Node #${res.edgeNodeId}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-sans">
                    <button
                      onClick={() => {
                        setEditModal(res);
                        setNewStatus(res.status);
                      }}
                      className="p-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-800 text-blue-300 rounded transition-colors"
                      title="Cập nhật trạng thái"
                    >
                      <Edit3 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* EDIT MODAL */}
      {editModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2 font-mono">
                <Edit3 className="text-blue-400" size={18} />
                Cập nhật Trạng thái Xe: {editModal.resourceCode}
              </h3>
              <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono space-y-1">
                <div>Đơn vị: <span className="text-slate-300">{editModal.providerName}</span></div>
                <div>Trạng thái hiện tại: <span className="text-blue-400 font-bold">{editModal.status}</span></div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 uppercase font-semibold">Trạng thái mới</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                >
                  <option value="AVAILABLE">AVAILABLE - Sẵn sàng điều xe</option>
                  <option value="OFFLINE">OFFLINE - Tắt máy / Nghỉ ca</option>
                  <option value="MAINTENANCE">MAINTENANCE - Bảo dưỡng kỹ thuật</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors font-mono"
              >
                {isUpdating ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FleetManagement;
