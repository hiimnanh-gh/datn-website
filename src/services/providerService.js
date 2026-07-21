import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const providerService = {
  // GET /api/v1/providers
  getAll: async () => {
    const response = await api.get('/v1/providers');
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/providers/{id}
  getById: async (id) => {
    const response = await api.get(`/v1/providers/${id}`);
    return unwrapBaseResponse(response);
  },

  // POST /api/v1/providers
  create: async (data) => {
    const response = await api.post('/v1/providers', data);
    return unwrapBaseResponse(response);
  },

  // PUT /api/v1/providers/{id}
  update: async (id, data) => {
    const response = await api.put(`/v1/providers/${id}`, data);
    return unwrapBaseResponse(response);
  },

  // DELETE /api/v1/providers/{id}
  delete: async (id) => {
    const response = await api.delete(`/v1/providers/${id}`);
    return unwrapBaseResponse(response);
  }
};

export default providerService;
