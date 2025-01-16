import { User } from "../src/types/types";
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_STORAGE_KEY = '@user_data';

export const storage = {
  saveUser: async (user: User) => {
    try {
      const jsonUser = JSON.stringify(user);
      await AsyncStorage.setItem(USER_STORAGE_KEY, jsonUser);
      return true;
    } catch (error) {
      console.error('Error saving user:', error);
      return false;
    }
  },

  getUser: async (): Promise<User | null> => {
    try {
      const jsonUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return jsonUser ? JSON.parse(jsonUser) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  removeUser: async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error removing user:', error);
      return false;
    }
  }
};