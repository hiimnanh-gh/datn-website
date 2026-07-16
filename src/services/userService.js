import api from './api';

export const userService = {
  // Lấy danh sách tất cả user
  getUsers: async () => {
    const response = await api.get('/v1/users');
    return response.data;
  },

  // Lấy thông tin user đang đăng nhập
  getMe: async () => {
    const response = await api.get('/v1/users/me');
    return response.data;
  },

  // Lấy chi tiết một user
  getUserById: async (id) => {
    const response = await api.get(`/v1/users/${id}`);
    return response.data;
  },

  // Tạo mới user
  createUser: async (data) => {
    const response = await api.post('/v1/users', data);
    return response.data;
  },

  // Cập nhật user
  updateUser: async (id, data) => {
    const response = await api.put(`/v1/users/${id}`, data);
    return response.data;
  },

  // Xóa user
  deleteUser: async (id) => {
    const response = await api.delete(`/v1/users/${id}`);
    return response.data;
  }
};
