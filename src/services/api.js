import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, accessToken = null, refreshToken = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve({ accessToken, refreshToken });
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach Bearer Token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Intercept 401 & Perform Token Refresh / Queue Retry / Session Expired Redirect
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Intercept 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Do not intercept auth login / refresh endpoints to avoid infinite loops
      if (
        originalRequest.url?.includes('/v1/auth/login') ||
        originalRequest.url?.includes('/v1/auth/refresh')
      ) {
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue concurrent failed requests
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(({ accessToken }) => {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken =
        useAuthStore.getState().refreshToken ||
        useAuthStore.getState().user?.refreshToken;

      if (!currentRefreshToken) {
        isRefreshing = false;
        useAuthStore.getState().logout();
        window.location.href = '/login?sessionExpired=true';
        return Promise.reject(error);
      }

      try {
        // Call token refresh API with raw axios to bypass interceptor
        const refreshResponse = await axios.post(`${baseURL}/v1/auth/refresh`, {
          refreshToken: currentRefreshToken,
        });

        const resData = refreshResponse.data;
        const authData = resData?.data || resData;
        const newAccessToken = authData?.accessToken;
        const newRefreshToken = authData?.refreshToken || currentRefreshToken;

        if (newAccessToken) {
          // Token Rotation: Save BOTH new access token and new refresh token
          useAuthStore.getState().updateTokens(newAccessToken, newRefreshToken);

          // Update header for original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          // Resolve all queued requests with the new access token
          processQueue(null, newAccessToken, newRefreshToken);

          // Retry the original request
          return api(originalRequest);
        } else {
          throw new Error('Refresh response missing accessToken');
        }
      } catch (refreshErr) {
        // On refresh failure, reject queue and logout user
        processQueue(refreshErr, null, null);
        useAuthStore.getState().logout();
        window.location.href = '/login?sessionExpired=true';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
