import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Valid role types: 'ADMIN' | 'PROVIDER' | 'PROVIDER_ADMIN' | 'DISPATCHER' | 'DRIVER'
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (userData, accessToken, refreshToken) => {
        const allowedRoles = ['ADMIN', 'PROVIDER', 'PROVIDER_ADMIN', 'DISPATCHER', 'DRIVER', 'REPORTER'];
        const roleStr = userData?.role?.toUpperCase() || '';
        
        const isAllowed = allowedRoles.some(r => roleStr.includes(r));
        if (!isAllowed) {
          console.error(`Unauthorized login attempt with role: ${userData?.role}`);
          return;
        }

        const activeRefreshToken = refreshToken || userData?.refreshToken || null;

        set({
          user: { ...userData, refreshToken: activeRefreshToken },
          token: accessToken,
          refreshToken: activeRefreshToken,
          isAuthenticated: true,
        });
      },

      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setRefreshToken: (refreshToken) => set((state) => ({
        refreshToken,
        user: state.user ? { ...state.user, refreshToken } : null
      })),

      updateTokens: (newAccessToken, newRefreshToken) => {
        set((state) => ({
          token: newAccessToken,
          refreshToken: newRefreshToken || state.refreshToken,
          user: state.user ? { ...state.user, refreshToken: newRefreshToken || state.user.refreshToken } : null,
          isAuthenticated: true,
        }));
      },

      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
