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

  // POST /api/v1/dispatch-requests/{id}/verify
  verify: async (id) => {
    const response = await api.post(`/v1/dispatch-requests/${id}/verify`);
    return unwrapBaseResponse(response);
  },

  // POST /api/v1/dispatch-requests/{id}/reject
  reject: async (id, reason) => {
    const response = await api.post(`/v1/dispatch-requests/${id}/reject`, { reason });
    return unwrapBaseResponse(response);
  },

  // POST /api/v1/dispatch-requests/{id}/redispatch
  redispatch: async (id, payload) => {
    const response = await api.post(`/v1/dispatch-requests/${id}/redispatch`, payload);
    return unwrapBaseResponse(response);
  },

  // POST /api/v1/dispatch-requests/{id}/confirm
  confirm: async (id, payload) => {
    const response = await api.post(`/v1/dispatch-requests/${id}/confirm`, payload);
    return unwrapBaseResponse(response);
  },

  // POST /api/v1/dispatch-requests/{id}/analyze
  analyze: async (id) => {
    const response = await api.post(`/v1/dispatch-requests/${id}/analyze`);
    return unwrapBaseResponse(response);
  },

  // PATCH /api/v1/dispatch-requests/{id}/severity
  updateSeverity: async (id, urgencyLevel) => {
    const response = await api.patch(`/v1/dispatch-requests/${id}/severity`, { urgencyLevel });
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/dispatch-requests/{id}/timeline
  getTimeline: async (id) => {
    const response = await api.get(`/v1/dispatch-requests/${id}/timeline`);
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/dispatch-requests/{id}/recommendations
  getRecommendations: async (id) => {
    const response = await api.get(`/v1/dispatch-requests/${id}/recommendations`);
    return unwrapBaseResponse(response);
  },

  // GET /api/v1/dispatch-requests/statistics
  getStatistics: async () => {
    const response = await api.get('/v1/dispatch-requests/statistics');
    return unwrapBaseResponse(response);
  }
};

export default dispatchRequestService;
