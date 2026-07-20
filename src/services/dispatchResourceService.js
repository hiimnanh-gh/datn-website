import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const dispatchResourceService = {
  // GET /api/v1/dispatch-resources
  getAll: async () => {
    const response = await api.get('/v1/dispatch-resources');
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/dispatch-resources/{id}
  getById: async (id) => {
    const response = await api.get(`/v1/dispatch-resources/${id}`);
    return unwrapBaseResponse(response);
  },

  // PATCH /api/v1/dispatch-resources/{id}/status
  updateStatus: async (id, status) => {
    const response = await api.patch(`/v1/dispatch-resources/${id}/status`, { status });
    return unwrapBaseResponse(response);
  }
};

export default dispatchResourceService;
