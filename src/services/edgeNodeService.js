import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const edgeNodeService = {
  // GET /api/v1/operation-zones (backend updated from /api/v1/edge-nodes)
  getAll: async () => {
    try {
      const response = await api.get('/v1/operation-zones');
      return unwrapBaseResponse(response);
    } catch (err) {
      if (err.response?.status === 404 || err.response?.status === 500) {
        // Fallback to legacy endpoint if operation-zones returns error
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
      if (err.response?.status === 404 || err.response?.status === 500) {
        const fallbackRes = await api.get(`/v1/edge-nodes/${id}`);
        return unwrapBaseResponse(fallbackRes);
      }
      throw err;
    }
  }
};

export default edgeNodeService;
