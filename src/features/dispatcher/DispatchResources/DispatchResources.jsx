import React, { useState, useEffect, useCallback } from 'react';
import { 
  Truck, RefreshCw, Search, Filter, ShieldCheck, Eye, Edit3, X, Check, AlertCircle, MapPin
} from 'lucide-react';
import { dispatchResourceService } from '../../../services/dispatchResourceService';
import { providerService } from '../../../services/providerService';
import { serviceTypeService } from '../../../services/serviceTypeService';
import { edgeNodeService } from '../../../services/edgeNodeService';

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

const DispatchResources = () => {
  const [resources, setResources] = useState([]);
  const [providers, setProviders] = useState([]);
  const [serviceTypes, setServiceTypes] = useState([]);
  const [edgeNodes, setEdgeNodes] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [edgeNodeFilter, setEdgeNodeFilter] = useState('ALL');

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [editStatusModal, setEditStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('AVAILABLE');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resList, provList, stList, enList] = await Promise.all([
        dispatchResourceService.getAll(),
        providerService.getAll().catch(() => []),
        serviceTypeService.getAll().catch(() => []),
        edgeNodeService.getAll().catch(() => []),
      ]);

      setResources(Array.isArray(resList) ? resList : []);
      setProviders(Array.isArray(provList) ? provList : []);
      setServiceTypes(Array.isArray(stList) ? stList : []);
      setEdgeNodes(Array.isArray(enList) ? enList : []);
    } catch (err) {
      console.error('Error loading dispatch resources:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Update Status handler
  const handleUpdateStatus = async () => {
    if (!editStatusModal) return;
    setIsUpdatingStatus(true);
    try {
      await dispatchResourceService.updateStatus(editStatusModal.id, newStatus);
      setEditStatusModal(null);
      fetchAllData();
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Cập nhật trạng thái thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filter resources
  const filteredResources = resources.filter(r => {
    const codeMatch = searchCode ? r.resourceCode?.toLowerCase().includes(searchCode.toLowerCase()) : true;
    const statusMatch = statusFilter === 'ALL' || r.status === statusFilter;
    const typeMatch = typeFilter === 'ALL' || r.resourceTypeId === Number(typeFilter);
    const provMatch = providerFilter === 'ALL' || r.providerId === Number(providerFilter);
    const edgeMatch = edgeNodeFilter === 'ALL' || r.edgeNodeId === Number(edgeNodeFilter);
    return codeMatch && statusMatch && typeMatch && provMatch && edgeMatch;
  });

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 font-sans p-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <Truck className="text-indigo-400" size={24} />
            Tài nguyên điều phối (Dispatch Resources)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý danh sách phương tiện cấp cứu, nhà cung cấp và trạng thái vận hành thực tế.
          </p>
        </div>

        <button
          onClick={fetchAllData}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Tìm theo Mã xe (Code)..."
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">Trạng thái: Tất cả</option>
          <option value="AVAILABLE">AVAILABLE (Có sẵn)</option>
          <option value="BUSY">BUSY (Bận nhiệm vụ)</option>
          <option value="OFFLINE">OFFLINE (Tắt máy)</option>
          <option value="MAINTENANCE">MAINTENANCE (Bảo trì)</option>
        </select>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">Loại dịch vụ: Tất cả</option>
          {serviceTypes.map(st => (
            <option key={st.id} value={st.id}>{st.displayName || st.typeCode}</option>
          ))}
        </select>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">Đơn vị: Tất cả</option>
          {providers.map(p => (
            <option key={p.id} value={p.id}>{p.providerName}</option>
          ))}
        </select>

        <select
          value={edgeNodeFilter}
          onChange={(e) => setEdgeNodeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">Vùng điều phối: Tất cả</option>
          {edgeNodes.map(node => (
            <option key={node.id} value={node.id}>{node.nodeName}</option>
          ))}
        </select>
      </div>

      {/* Resource Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Mã tài nguyên</th>
              <th className="py-3.5 px-4">Loại xe / Dịch vụ</th>
              <th className="py-3.5 px-4">Đơn vị (Provider)</th>
              <th className="py-3.5 px-4">Tài xế hiện tại</th>
              <th className="py-3.5 px-4">Vùng (Edge Node)</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4">Cập nhật cuối</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                  Đang tải danh sách Tài nguyên...
                </td>
              </tr>
            ) : filteredResources.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                  Không tìm thấy tài nguyên nào phù hợp.
                </td>
              </tr>
            ) : (
              filteredResources.map(res => (
                <tr key={res.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-100 flex items-center gap-2">
                    <Truck size={14} className="text-indigo-400" />
                    {res.resourceCode}
                  </td>
                  <td className="py-3 px-4 text-indigo-300 font-medium font-sans">
                    {res.resourceTypeName || `ID: ${res.resourceTypeId}`}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans">
                    {res.providerName || `Provider #${res.providerId}`}
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-sans">
                    {res.currentDriverName || <span className="text-slate-500 italic">Chưa gán</span>}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans">
                    {res.edgeNodeName || `Node #${res.edgeNodeId}`}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(res.status)}`}>
                      {res.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {res.updatedAt ? new Date(res.updatedAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2 font-sans">
                    <button
                      onClick={() => setSelectedDetail(res)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                      title="Xem chi tiết"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setEditStatusModal(res);
                        setNewStatus(res.status);
                      }}
                      className="p-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 rounded transition-colors"
                      title="Đổi trạng thái vận hành"
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

      {/* DETAIL MODAL */}
      {selectedDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Truck className="text-indigo-400" size={20} />
                Chi tiết Tài nguyên: {selectedDetail.resourceCode}
              </h3>
              <button onClick={() => setSelectedDetail(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Mã tài nguyên</span>
                <span className="font-bold text-emerald-400 font-mono text-sm">{selectedDetail.resourceCode}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Trạng thái</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block mt-0.5 ${getStatusBadge(selectedDetail.status)}`}>
                  {selectedDetail.status}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Loại dịch vụ</span>
                <span className="text-slate-200 font-medium">{selectedDetail.resourceTypeName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Vùng điều phối (Edge Node)</span>
                <span className="text-slate-200 font-medium">{selectedDetail.edgeNodeName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Đơn vị cung cấp</span>
                <span className="text-slate-200 font-medium">{selectedDetail.providerName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Tài xế hiện tại</span>
                <span className="text-slate-200 font-medium">{selectedDetail.currentDriverName || 'Chưa gán'}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase mb-1">Tọa độ vị trí GPS</span>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400" />
                {selectedDetail.latitude && selectedDetail.longitude ? `${selectedDetail.latitude}, ${selectedDetail.longitude}` : 'Chưa có dữ liệu GPS từ xe'}
              </div>
            </div>

            {selectedDetail.extendedAttributes && (
              <div>
                <span className="text-slate-500 text-[10px] block uppercase mb-1">Thuộc tính mở rộng</span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedDetail.extendedAttributes, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-800 pt-3">
              <button
                onClick={() => setSelectedDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT STATUS MODAL */}
      {editStatusModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Edit3 className="text-indigo-400" size={18} />
                Cập nhật Trạng thái Vận hành
              </h3>
              <button onClick={() => setEditStatusModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono">
                <div>Xe: <span className="font-bold text-slate-100">{editStatusModal.resourceCode}</span></div>
                <div>Trạng thái hiện tại: <span className="text-indigo-400 font-bold">{editStatusModal.status}</span></div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 block mb-1 uppercase font-semibold">Chọn trạng thái mới</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="AVAILABLE">AVAILABLE - Có sẵn phát lệnh</option>
                  <option value="OFFLINE">OFFLINE - Xe ngắt kết nối / nghỉ</option>
                  <option value="MAINTENANCE">MAINTENANCE - Xe bảo dưỡng kỹ thuật</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-3">
              <button
                onClick={() => setEditStatusModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                {isUpdatingStatus ? 'Đang lưu...' : 'Lưu trạng thái'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DispatchResources;
