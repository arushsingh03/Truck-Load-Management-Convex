import { create } from 'zustand';
import { User } from '../types/types';
import { storage } from '../utils/storage';

type AuthStore = {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: async (user) => {
    try {
      if (user) {
        const success = await storage.saveUser(user);
        if (!success) {
          throw new Error('Failed to save user data');
        }
        set({ user, isAuthenticated: true });
      } else {
        const success = await storage.removeUser();
        if (!success) {
          throw new Error('Failed to remove user data');
        }
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Error in setUser:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      const success = await storage.removeUser();
      if (!success) {
        throw new Error('Failed to remove user data during logout');
      }
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
  initializeAuth: async () => {
    try {
      const user = await storage.getUser();
      set({ user, isAuthenticated: !!user });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null, isAuthenticated: false });
    }
  },
}));
