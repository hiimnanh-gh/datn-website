import { create } from 'zustand';

const useProviderAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // Mock login action to switch between roles for testing
  loginAs: (role) => {
    if (role === 'PROVIDER_ADMIN') {
      set({
        user: {
          id: 'prov_admin_01',
          name: 'CEO Michael Scott',
          role: 'PROVIDER_ADMIN',
          providerName: 'City EMS',
        },
        isAuthenticated: true,
      });
    } else if (role === 'PROVIDER_STAFF') {
      set({
        user: {
          id: 'prov_staff_01',
          name: 'Dispatcher Pam',
          role: 'PROVIDER_STAFF',
          providerName: 'City EMS',
        },
        isAuthenticated: true,
      });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));

export default useProviderAuthStore;
