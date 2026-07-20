import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Valid role types: 'ADMIN' | 'PROVIDER' | 'PROVIDER_ADMIN' | 'DISPATCHER' | 'DRIVER'
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: (userData, token) => {
        const allowedRoles = ['ADMIN', 'PROVIDER', 'PROVIDER_ADMIN', 'DISPATCHER', 'DRIVER', 'REPORTER'];
        const roleStr = userData?.role?.toUpperCase() || '';
        
        const isAllowed = allowedRoles.some(r => roleStr.includes(r));
        if (!isAllowed) {
          console.error(`Unauthorized login attempt with role: ${userData?.role}`);
          return;
        }

        set({
          user: userData,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;
