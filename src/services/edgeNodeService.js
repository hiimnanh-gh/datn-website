import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const edgeNodeService = {
  // GET /api/v1/edge-nodes
  getAll: async () => {
    const response = await api.get('/v1/edge-nodes');
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/edge-nodes/{id}
  getById: async (id) => {
    const response = await api.get(`/v1/edge-nodes/${id}`);
    return unwrapBaseResponse(response);
  }
};

export default edgeNodeService;
