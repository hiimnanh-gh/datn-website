import React, { useState, useEffect, useCallback } from 'react';
import { 
  History, Search, RefreshCw, Eye, MapPin, AlertTriangle, FileText, X
} from 'lucide-react';
import { dispatchRequestService } from '../../../../services/dispatchRequestService';

const getUrgencyBadge = (urgency) => {
  switch (urgency?.toUpperCase()) {
    case 'CRITICAL':
      return 'bg-red-500/20 text-red-400 border-red-500/40';
    case 'HIGH':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
    case 'MEDIUM':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
    case 'LOW':
    default:
      return 'bg-slate-500/20 text-slate-400 border-slate-500/40';
  }
};

const DispatchHistory = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDetail, setSelectedDetail] = useState(null);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dispatchRequestService.getAll();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching dispatch request history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const filteredRequests = requests.filter(req => {
    const codeMatch = search ? `REQ-${req.id}`.toLowerCase().includes(search.toLowerCase()) || req.id.toString().includes(search) : true;
    const urgencyMatch = urgencyFilter === 'ALL' || req.urgencyLevel === urgencyFilter;
    const statusMatch = statusFilter === 'ALL' || req.status === statusFilter;
    return codeMatch && urgencyMatch && statusMatch;
  });

  return (
    <div className="p-6 bg-slate-950 min-h-full text-slate-100 font-sans space-y-6 overflow-y-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <History className="text-indigo-400" size={24} />
            Lịch sử Yêu cầu Điều phối (Dispatch Request History)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tra cứu lịch sử toàn bộ các yêu cầu điều phối đã phát sinh trong hệ thống.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 rounded-lg text-xs font-medium transition-colors"
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Làm mới
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search REQ ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={urgencyFilter}
          onChange={(e) => setUrgencyFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">Mức độ khẩn cấp: Tất cả</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
        >
          <option value="ALL">Trạng thái: Tất cả</option>
          <option value="PENDING">PENDING</option>
          <option value="READY">READY</option>
          <option value="DISPATCHED">DISPATCHED</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[11px] border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-4">Mã Yêu cầu</th>
              <th className="py-3.5 px-4">Call ID</th>
              <th className="py-3.5 px-4">Mức độ</th>
              <th className="py-3.5 px-4">Loại dịch vụ</th>
              <th className="py-3.5 px-4">Vùng (Edge Node)</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4">Thời gian tạo</th>
              <th className="py-3.5 px-4 text-right">Chi tiết</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                  Đang tải Lịch sử yêu cầu điều phối...
                </td>
              </tr>
            ) : filteredRequests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                  Không tìm thấy lịch sử phù hợp.
                </td>
              </tr>
            ) : (
              filteredRequests.map(req => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-400">
                    REQ-{req.id}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    #{req.callId || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getUrgencyBadge(req.urgencyLevel)}`}>
                      {req.urgencyLevel}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-sans font-medium">
                    {req.serviceTypeName || `ID: ${req.serviceTypeId}`}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-sans">
                    {req.edgeNodeName || `Node #${req.edgeNodeId}`}
                  </td>
                  <td className="py-3 px-4 font-sans">
                    <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] border border-slate-700">
                      {req.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-[11px]">
                    {req.createdAt ? new Date(req.createdAt).toLocaleString() : 'N/A'}
                  </td>
                  <td className="py-3 px-4 text-right font-sans">
                    <button
                      onClick={() => setSelectedDetail(req)}
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition-colors"
                    >
                      <Eye size={14} />
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
                <FileText className="text-indigo-400" size={20} />
                Chi tiết REQ-{selectedDetail.id}
              </h3>
              <button onClick={() => setSelectedDetail(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs font-sans">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Mã Yêu cầu</span>
                <span className="font-bold text-indigo-400 font-mono text-sm">REQ-{selectedDetail.id}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Mức độ Khẩn cấp</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block mt-0.5 ${getUrgencyBadge(selectedDetail.urgencyLevel)}`}>
                  {selectedDetail.urgencyLevel}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Loại dịch vụ</span>
                <span className="text-slate-200 font-medium">{selectedDetail.serviceTypeName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase">Vùng điều phối</span>
                <span className="text-slate-200 font-medium">{selectedDetail.edgeNodeName}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase mb-1">Tọa độ GPS</span>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                <MapPin size={14} className="text-emerald-400" />
                {selectedDetail.latitude && selectedDetail.longitude ? `${selectedDetail.latitude}, ${selectedDetail.longitude}` : 'Chưa có tọa độ GPS'}
              </div>
            </div>

            {selectedDetail.extendedRequirements && (
              <div>
                <span className="text-slate-500 text-[10px] block uppercase mb-1">Extended Requirements</span>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-slate-300 font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedDetail.extendedRequirements, null, 2)}
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

    </div>
  );
};

export default DispatchHistory;
