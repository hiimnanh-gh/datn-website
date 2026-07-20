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
  }
};

export default providerService;
