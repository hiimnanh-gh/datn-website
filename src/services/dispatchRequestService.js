import api from './api';

export const unwrapBaseResponse = (res) => {
  if (res && res.data && typeof res.data === 'object' && 'data' in res.data) {
    return res.data.data;
  }
  return res?.data;
};

export const dispatchRequestService = {
  // GET /api/v1/dispatch-requests
  getAll: async () => {
    const response = await api.get('/v1/dispatch-requests');
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/dispatch-requests/{id}
  getById: async (id) => {
    const response = await api.get(`/v1/dispatch-requests/${id}`);
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/emergency-calls
  getEmergencyCalls: async () => {
    const response = await api.get('/v1/emergency-calls');
    return unwrapBaseResponse(response);
  }
};

export default dispatchRequestService;
