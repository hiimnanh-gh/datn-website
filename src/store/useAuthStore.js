import { create } from 'zustand';

// Valid role types: 'ADMIN' | 'PROVIDER' | 'DISPATCHER' | 'DRIVER'
const useAuthStore = create((set) => ({
  user: null, // { role: 'ADMIN' | 'PROVIDER' | 'DISPATCHER' | 'DRIVER', name: string }
  token: null,
  isAuthenticated: false,

  login: (userData, token) => {
    // Restrict login role to only the 4 allowed B2B roles
    const allowedRoles = ['ADMIN', 'PROVIDER', 'DISPATCHER', 'DRIVER'];
    if (!allowedRoles.includes(userData?.role)) {
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
}));

export default useAuthStore;

