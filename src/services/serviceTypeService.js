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
  },

  // POST /api/v1/service-types
  create: async (data) => {
    const response = await api.post('/v1/service-types', data);
    return unwrapBaseResponse(response);
  },

  // PUT /api/v1/service-types/{id}
  update: async (id, data) => {
    const response = await api.put(`/v1/service-types/${id}`, data);
    return unwrapBaseResponse(response);
  },

  // DELETE /api/v1/service-types/{id}
  delete: async (id) => {
    const response = await api.delete(`/v1/service-types/${id}`);
    return unwrapBaseResponse(response);
  }
};

export default serviceTypeService;
