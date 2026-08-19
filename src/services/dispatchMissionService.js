import api from './api';

const generateUUID = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const dispatchMissionService = {
  // GET /api/v1/dispatch-missions
  getAll: async () => {
    const response = await api.get('/v1/dispatch-missions');
    return response.data?.data || response.data;
  },

  // POST /api/v1/dispatch-missions
  // Body: { requestId, resourceId, destinationName, notes }
  // Header: Idempotency-Key: UUID
  create: async (payload, customIdempotencyKey = null) => {
    const idempotencyKey = customIdempotencyKey || generateUUID();
    const response = await api.post('/v1/dispatch-missions', payload, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });
    return response.data?.data || response.data;
  },

  // POST /api/v1/dispatch-missions/redispatch?requestId={id}&newResourceId={id}
  // Query: requestId, newResourceId
  // Header: Idempotency-Key: UUID
  redispatch: async (paramsOrPayload, customIdempotencyKey = null) => {
    const requestId = paramsOrPayload?.requestId;
    const newResourceId = paramsOrPayload?.newResourceId || paramsOrPayload?.resourceId;
    const idempotencyKey = customIdempotencyKey || generateUUID();

    const response = await api.post('/v1/dispatch-missions/redispatch', null, {
      params: { requestId, newResourceId },
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });
    return response.data?.data || response.data;
  },

  // GET /api/v1/dispatch-missions/{id}
  getById: async (id) => {
    const response = await api.get(`/v1/dispatch-missions/${id}`);
    return response.data?.data || response.data;
  }
};

export default dispatchMissionService;
