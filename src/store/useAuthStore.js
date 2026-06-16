import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null, // { role: 'ADMIN' | 'DISPATCHER', name: 'John Doe' }
  token: null,
  isAuthenticated: false,

  login: (userData, token) => set({
    user: userData,
    token,
    isAuthenticated: true,
  }),

  logout: () => set({
    user: null,
    token: null,
    isAuthenticated: false,
  }),
}));

export default useAuthStore;
