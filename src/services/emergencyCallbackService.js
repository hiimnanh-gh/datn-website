import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const emergencyCallbackService = {
  // POST /api/v1/calls/callback
  receiveAICallback: async (data) => {
    const response = await api.post('/v1/calls/callback', data);
    return unwrapBaseResponse(response);
  }
};

export default emergencyCallbackService;
