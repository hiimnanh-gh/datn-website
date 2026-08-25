import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const callService = {
  // GET /api/v1/calls/{id} - Lấy chi tiết cuộc gọi cấp cứu
  getById: async (id) => {
    if (!id) return null;
    const response = await api.get(`/v1/calls/${id}`);
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/calls/{id}/status - Trạng thái xử lý cuộc gọi
  getStatus: async (id) => {
    if (!id) return null;
    const response = await api.get(`/v1/calls/${id}/status`);
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/calls/{id}/tracking - Theo dõi cuộc gọi & xe
  getTracking: async (id) => {
    if (!id) return null;
    const response = await api.get(`/v1/calls/${id}/tracking`);
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/calls/my-calls
  getMyCalls: async () => {
    const response = await api.get('/v1/calls/my-calls');
    return unwrapBaseResponse(response);
  },
};

export default callService;
