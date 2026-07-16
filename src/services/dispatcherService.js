import api from './api';

export const dispatcherService = {
  // Lấy danh sách các Provider (Đơn vị xe cứu thương / phòng khám)
  getProviders: async () => {
    const response = await api.get('/v1/providers');
    return response.data;
  },

  // Lấy danh sách các Resource (Xe cứu thương cụ thể)
  getDispatchResources: async () => {
    const response = await api.get('/v1/dispatch-resources');
    return response.data;
  },

  // Lấy danh sách yêu cầu điều phối đang chờ
  getDispatchRequests: async () => {
    const response = await api.get('/v1/dispatch-requests');
    return response.data;
  },

  // Phân bổ chuyến xe (Gửi cho Xe cứu thương)
  createDispatchMission: async (data) => {
    // data: { requestId, resourceId, destinationName, notes }
    const response = await api.post('/v1/dispatch-missions', data);
    return response.data;
  }
};
