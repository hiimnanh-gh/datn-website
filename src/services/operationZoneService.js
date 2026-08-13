import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const operationZoneService = {
  // GET /api/v1/operation-zones
  getAll: async () => {
    try {
      const response = await api.get('/v1/operation-zones');
      return unwrapBaseResponse(response);
    } catch (err) {
      if (err.response?.status === 404) {
        const fallbackRes = await api.get('/v1/edge-nodes');
        return unwrapBaseResponse(fallbackRes);
      }
      throw err;
    }
  },

  // GET /api/v1/operation-zones/{id}
  getById: async (id) => {
    try {
      const response = await api.get(`/v1/operation-zones/${id}`);
      return unwrapBaseResponse(response);
    } catch (err) {
      if (err.response?.status === 404) {
        const fallbackRes = await api.get(`/v1/edge-nodes/${id}`);
        return unwrapBaseResponse(fallbackRes);
      }
      throw err;
    }
  },

  // POST /api/v1/operation-zones
  create: async (data) => {
    const response = await api.post('/v1/operation-zones', data);
    return unwrapBaseResponse(response);
  },

  // PUT /api/v1/operation-zones/{id}
  update: async (id, data) => {
    const response = await api.put(`/v1/operation-zones/${id}`, data);
    return unwrapBaseResponse(response);
  },

  // DELETE /api/v1/operation-zones/{id}
  delete: async (id) => {
    const response = await api.delete(`/v1/operation-zones/${id}`);
    return unwrapBaseResponse(response);
  }
};

export default operationZoneService;
