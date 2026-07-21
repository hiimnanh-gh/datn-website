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
  },

  // POST /api/v1/dispatch-resources
  create: async (data) => {
    const response = await api.post('/v1/dispatch-resources', data);
    return unwrapBaseResponse(response);
  },

  // PUT /api/v1/dispatch-resources/{id}
  update: async (id, data) => {
    const response = await api.put(`/v1/dispatch-resources/${id}`, data);
    return unwrapBaseResponse(response);
  },

  // DELETE /api/v1/dispatch-resources/{id}
  delete: async (id) => {
    const response = await api.delete(`/v1/dispatch-resources/${id}`);
    return unwrapBaseResponse(response);
  }
};

export default dispatchResourceService;
