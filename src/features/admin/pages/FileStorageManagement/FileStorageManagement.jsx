import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderArchive, Upload, Download, Trash2, Search, X, RefreshCw, FileText, Info, HardDrive
} from 'lucide-react';
import { fileStorageService } from '../../../../services/fileStorageService';

const FileStorageManagement = () => {
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selected file for metadata modal
  const [metadataModal, setMetadataModal] = useState(null);

  const fetchFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fileStorageService.listFiles();
      setFiles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error listing MinIO files:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await fileStorageService.upload(selectedFile);
      alert('Tải tệp tin lên MinIO thành công!');
      fetchFiles();
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Tải tệp lên thất bại: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleDownload = async (objectKey) => {
    try {
      const blob = await fileStorageService.downloadFile(objectKey);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', objectKey.split('/').pop() || objectKey);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Tải file thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (objectKey) => {
    if (!window.confirm(`Bạn có chắc muốn xóa tệp "${objectKey}" trên MinIO?`)) return;
    try {
      await fileStorageService.deleteFile(objectKey);
      fetchFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      alert('Xóa file thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewMetadata = async (objectKey) => {
    try {
      const meta = await fileStorageService.getMetadata(objectKey);
      setMetadataModal({ objectKey, meta });
    } catch (err) {
      console.error('Error fetching metadata:', err);
      setMetadataModal({ objectKey, meta: { error: err.message } });
    }
  };

  const filteredFiles = files.filter(f => {
    const key = (f.objectKey || f.name || f.fileName || typeof f === 'string' ? f : '').toString().toLowerCase();
    return key.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6 bg-slate-950 min-h-full text-slate-100 font-sans space-y-6 overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <HardDrive className="text-indigo-400" size={24} />
            Quản lý Lưu trữ Tệp tin (MinIO Storage)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý và lưu trữ tài liệu y tế, hình ảnh hiện trường và các tệp đính kèm hệ thống.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFiles}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-xs transition-colors"
            title="Tải lại danh sách"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>

          <label className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/30 cursor-pointer transition-all active:scale-95">
            <Upload size={16} />
            <span>{isUploading ? 'Đang tải lên...' : 'Tải tệp lên MinIO'}</span>
            <input type="file" onChange={handleFileUpload} className="hidden" disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-3">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên tệp hoặc object key..."
          className="bg-transparent text-xs text-slate-100 focus:outline-none w-full placeholder:text-slate-500"
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Files List Table */}
      {isLoading ? (
        <div className="text-center py-12 text-slate-400 text-xs font-mono">Đang tải danh sách tệp trên MinIO...</div>
      ) : filteredFiles.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
          Chưa có tệp tin nào trên bộ lưu trữ MinIO.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-medium">
              <tr>
                <th className="py-3 px-4">Tên tệp / Object Key</th>
                <th className="py-3 px-4">Dung lượng</th>
                <th className="py-3 px-4">Ngày tải lên</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredFiles.map((fileObj, idx) => {
                const objectKey = typeof fileObj === 'string' ? fileObj : (fileObj.objectKey || fileObj.name || `file-${idx}`);
                const size = typeof fileObj === 'object' && fileObj.size ? `${(fileObj.size / 1024).toFixed(1)} KB` : 'N/A';
                const lastModified = typeof fileObj === 'object' && fileObj.lastModified ? new Date(fileObj.lastModified).toLocaleString() : 'N/A';

                return (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-200 flex items-center gap-2">
                      <FileText size={16} className="text-indigo-400 shrink-0" />
                      <span className="truncate max-w-md">{objectKey}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{size}</td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{lastModified}</td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleViewMetadata(objectKey)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-medium"
                      >
                        Metadata
                      </button>
                      <button
                        onClick={() => handleDownload(objectKey)}
                        className="px-2 py-1 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/60 rounded text-[11px] font-medium"
                      >
                        Tải về
                      </button>
                      <button
                        onClick={() => handleDelete(objectKey)}
                        className="px-2 py-1 bg-red-950/50 hover:bg-red-900/60 text-red-400 border border-red-900/50 rounded text-[11px] font-medium"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Metadata Modal */}
      {metadataModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Info size={16} className="text-indigo-400" />
                Siêu dữ liệu (Metadata)
              </h2>
              <button onClick={() => setMetadataModal(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-slate-400 text-xs font-mono block">Key: {metadataModal.objectKey}</span>
              <pre className="bg-slate-950 p-3 rounded-lg text-xs text-slate-300 font-mono overflow-x-auto border border-slate-800 max-h-64">
                {JSON.stringify(metadataModal.meta, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setMetadataModal(null)}
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

export default FileStorageManagement;
