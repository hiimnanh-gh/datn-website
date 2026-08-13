import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const fileStorageService = {
  // Upload file: POST /api/v1/files/upload
  upload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/v1/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return unwrapBaseResponse(response);
  },

  // List files: GET /api/v1/files
  listFiles: async () => {
    const response = await api.get('/v1/files');
    return unwrapBaseResponse(response);
  },

  // Get Metadata: GET /api/v1/files/metadata/{objectKey}
  getMetadata: async (objectKey) => {
    const response = await api.get(`/v1/files/metadata/${encodeURIComponent(objectKey)}`);
    return unwrapBaseResponse(response);
  },

  // Download File: GET /api/v1/files/download/{objectKey}
  downloadFile: async (objectKey) => {
    const response = await api.get(`/v1/files/download/${encodeURIComponent(objectKey)}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Delete File: DELETE /api/v1/files/admin/{objectKey}
  deleteFile: async (objectKey) => {
    const response = await api.delete(`/v1/files/admin/${encodeURIComponent(objectKey)}`);
    return unwrapBaseResponse(response);
  }
};

export default fileStorageService;
