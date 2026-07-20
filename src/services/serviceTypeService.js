import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const serviceTypeService = {
  // GET /api/v1/service-types
  getAll: async () => {
    const response = await api.get('/v1/service-types');
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/service-types/{id}
  getById: async (id) => {
    const response = await api.get(`/v1/service-types/${id}`);
    return unwrapBaseResponse(response);
  }
};

export default serviceTypeService;
