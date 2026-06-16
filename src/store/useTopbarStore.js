import { create } from 'zustand';

/**
 * Topbar Slot Store
 * Each admin page can call setSlot() on mount to inject page-specific
 * contextual content into the AdminTopbar's center area.
 * Call clearSlot() on unmount (return from useEffect).
 */
const useTopbarStore = create((set) => ({
  slot: null,
  setSlot:  (slot) => set({ slot }),
  clearSlot: ()    => set({ slot: null }),
}));

export default useTopbarStore;
