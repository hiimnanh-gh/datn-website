import api from './api';

export const dispatchMissionService = {
  // POST /api/v1/dispatch-missions
  // Body: { requestId, resourceId, destinationName, notes }
  // Note: Backend returns raw MissionDto directly in response.data
  create: async (payload) => {
    const response = await api.post('/v1/dispatch-missions', payload);
    return response.data;
  }
};

export default dispatchMissionService;
