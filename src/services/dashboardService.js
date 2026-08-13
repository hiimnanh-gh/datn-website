import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const dashboardService = {
  // Admin Dashboard
  getAdminDashboard: async (params) => {
    const response = await api.get('/v1/dashboard/admin', { params });
    return unwrapBaseResponse(response);
  },
  exportAdminDashboard: async (params) => {
    const response = await api.get('/v1/dashboard/admin/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Dispatcher Dashboard
  getDispatcherDashboard: async (params) => {
    const response = await api.get('/v1/dashboard/dispatcher', { params });
    return unwrapBaseResponse(response);
  },
  exportDispatcherDashboard: async (params) => {
    const response = await api.get('/v1/dashboard/dispatcher/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Provider Dashboard
  getProviderDashboard: async (params) => {
    const response = await api.get('/v1/dashboard/provider', { params });
    return unwrapBaseResponse(response);
  },
  exportProviderDashboard: async (params) => {
    const response = await api.get('/v1/dashboard/provider/export', {
      params,
      responseType: 'blob'
    });
    return response.data;
  }
};

export default dashboardService;
