import api from './api';
import { unwrapBaseResponse } from './dispatchRequestService';

export const userService = {
  // Lấy danh sách tất cả user
  getUsers: async (params) => {
    const response = await api.get('/v1/users', { params });
    if (response?.data && typeof response.data === 'object' && 'data' in response.data) {
      const list = response.data.data;
      if (Array.isArray(list)) {
        list._metadata = response.data.metadata;
      }
      return list;
    }
    return unwrapBaseResponse(response);
  },

  // Lấy thông tin user đang đăng nhập
  getMe: async () => {
    const response = await api.get('/v1/users/me');
    return unwrapBaseResponse(response);
  },

  // Lấy chi tiết một user
  getUserById: async (id) => {
    const response = await api.get(`/v1/users/${id}`);
    return unwrapBaseResponse(response);
  },

  // Tạo mới user
  createUser: async (data) => {
    const response = await api.post('/v1/users', data);
    return unwrapBaseResponse(response);
  },

  // Cập nhật user
  updateUser: async (id, data) => {
    const response = await api.put(`/v1/users/${id}`, data);
    return unwrapBaseResponse(response);
  },

  // Xóa user
  deleteUser: async (id) => {
    const response = await api.delete(`/v1/users/${id}`);
    return unwrapBaseResponse(response);
  },

  // Tạo tài khoản nội bộ (Admin user)
  createAdminUser: async (data) => {
    const response = await api.post('/v1/admin/users', data);
    return unwrapBaseResponse(response);
  }
};

export default userService;

