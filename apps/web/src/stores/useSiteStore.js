import { create } from 'zustand';
import defaultSeedData from '../data/content.seed.json';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const useSiteStore = create((set) => ({
  data: defaultSeedData,
  status: 'idle', // 'idle' | 'loading' | 'success' | 'fallback'
  load: async () => {
    set({ status: 'loading' });
    try {
      const res = await fetch(`${API_URL}/api/public/site`);
      if (!res.ok) {
        throw new Error(`Failed to fetch site data: ${res.status}`);
      }
      const data = await res.json();
      set({ data, status: 'success' });
    } catch (err) {
      // Fallback silently to bundled content.seed.json without disturbing visitors
      console.warn('Could not fetch from API, using bundled content seed.', err.message);
      set({ data: defaultSeedData, status: 'fallback' });
    }
  },
}));

