import { create } from 'zustand';
import { User } from '../types/types';
import { storage } from '../utils/storage';

type AuthStore = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  setUser: async (user) => {
    set({ user });
    if (user) {
      await storage.saveUser(user);
    }
  },
  logout: async () => {
    await storage.removeUser();
    set({ user: null });
  },
  initializeAuth: async () => {
    const user = await storage.getUser();
    if (user) {
      set({ user });
    }
  },
}));
