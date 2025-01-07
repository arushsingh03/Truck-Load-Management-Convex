import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_KEY = '@auth_store';

export const storage = {
  async saveUser(user: any) {
    try {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  async getUser() {
    try {
      const data = await AsyncStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async removeUser() {
    try {
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }
};
