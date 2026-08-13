import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/v1/auth/login', { username, password });
    return response.data;
  },
  logout: async (refreshToken) => {
    const response = await api.post('/v1/auth/logout', { refreshToken });
    return response.data;
  },
  refresh: async (refreshToken) => {
    const response = await api.post('/v1/auth/refresh', { refreshToken });
    return response.data;
  },
  register: async (data) => {
    const response = await api.post('/v1/auth/register', data);
    return response.data;
  },
  sendOtp: async (phoneNumber) => {
    const response = await api.post('/v1/auth/send-otp', { phoneNumber });
    return response.data;
  },
  resetPassword: async (data) => {
    const response = await api.post('/v1/auth/reset-password', data);
    return response.data;
  },
  forgotPassword: async (identity) => {
    const response = await api.post('/v1/auth/forgot-password', { identity });
    return response.data;
  },
  changePassword: async (data) => {
    const response = await api.post('/v1/auth/change-password', data);
    return response.data;
  },
  verifyOtp: async (phoneNumber, otp) => {
    const response = await api.post('/v1/auth/verify-otp', { phoneNumber, otp });
    return response.data;
  }
};
