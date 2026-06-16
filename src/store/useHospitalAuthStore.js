import { create } from 'zustand';

const useHospitalAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  // Mock login action to switch between roles for testing
  loginAs: (role) => {
    if (role === 'HOSPITAL_ADMIN') {
      set({
        user: {
          id: 'admin_01',
          name: 'Sarah Jenkins',
          role: 'HOSPITAL_ADMIN',
          hospitalName: 'City General Hospital',
        },
        isAuthenticated: true,
      });
    } else if (role === 'HOSPITAL_STAFF') {
      set({
        user: {
          id: 'staff_01',
          name: 'Dr. John Carter',
          role: 'HOSPITAL_STAFF',
          hospitalName: 'City General Hospital',
        },
        isAuthenticated: true,
      });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));

export default useHospitalAuthStore;
