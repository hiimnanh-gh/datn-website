import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const medicalHospitalService = {
  // GET /api/v1/medical-hospitals
  getAll: async (params) => {
    const response = await api.get('/v1/medical-hospitals', { params });
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/medical-hospitals/{id}
  getById: async (id) => {
    const response = await api.get(`/v1/medical-hospitals/${id}`);
    return unwrapBaseResponse(response);
  },

  // POST /api/v1/medical-hospitals
  create: async (data) => {
    const response = await api.post('/v1/medical-hospitals', data);
    return unwrapBaseResponse(response);
  },

  // PUT /api/v1/medical-hospitals/{id}
  update: async (id, data) => {
    const response = await api.put(`/v1/medical-hospitals/${id}`, data);
    return unwrapBaseResponse(response);
  },

  // DELETE /api/v1/medical-hospitals/{id}
  delete: async (id) => {
    const response = await api.delete(`/v1/medical-hospitals/${id}`);
    return unwrapBaseResponse(response);
  }
};

export default medicalHospitalService;
