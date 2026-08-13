import api from './api';

export const dispatchMissionService = {
  // GET /api/v1/dispatch-missions
  getAll: async () => {
    const response = await api.get('/v1/dispatch-missions');
    return response.data?.data || response.data;
  },

  // POST /api/v1/dispatch-missions
  // Body: { requestId, resourceId, destinationName, notes }
  create: async (payload) => {
    const response = await api.post('/v1/dispatch-missions', payload);
    return response.data?.data || response.data;
  },

  // POST /api/v1/dispatch-missions/redispatch
  redispatch: async (payload) => {
    const response = await api.post('/v1/dispatch-missions/redispatch', payload);
    return response.data?.data || response.data;
  },

  // GET /api/v1/dispatch-missions/{id}
  getById: async (id) => {
    const response = await api.get(`/v1/dispatch-missions/${id}`);
    return response.data?.data || response.data;
  }
};

export default dispatchMissionService;
