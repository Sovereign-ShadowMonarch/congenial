import api from './client';
import { z } from 'zod';

// Response schemas
const UserSchema = z.object({
  username: z.string(),
  logged_in: z.boolean(),
});

const LoginResponseSchema = z.object({
  result: z.object({
    username: z.string(),
    message: z.string(),
  }),
  message: z.string(),
});

const ErrorResponseSchema = z.object({
  message: z.string(),
  result: z.any().optional(),
});

// Request types
interface RegisterUserData {
  name: string;
  password: string;
  premium_api_key?: string;
  premium_api_secret?: string;
  initial_settings?: any;
}

interface LoginUserData {
  name: string;
  password: string;
  sync_approval?: 'yes' | 'no' | 'unknown';
}

export const authApi = {
  // Register a new user
  registerUser: async (userData: RegisterUserData) => {
    try {
      console.log('Registering user with data:', { username: userData.name, password: '***' });
      
      // Backend expects keys: username, password
      const payload = {
        username: userData.name,
        password: userData.password,
      };

      console.log('Sending payload to /users:', payload);
      const response = await api.put('/users', payload);
      console.log('Registration successful');
      return response.data;
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Registration failed';
      throw new Error(errorMessage);
    }
  },

  // Login user
  loginUser: async (username: string, password: string) => {
    try {
      console.log('Attempting login for user:', username);
      
      // Use proper HTTP method - some backends use PATCH instead of POST for login
      // We'll try both methods if needed
      let response;
      try {
        response = await api.patch(`/users/${username}`, {
          action: 'login',
          name: username,
          password,
          sync_approval: 'unknown',
        });
      } catch (patchError) {
        console.log('PATCH login failed, trying POST...');
        // If PATCH fails, try POST as fallback
        response = await api.post(`/users/${username}`, {
          action: 'login',
          name: username,
          password,
          sync_approval: 'unknown',
        });
      }
      
      console.log('Login successful');
      return LoginResponseSchema.parse(response.data);
    } catch (error: any) {
      console.error('Login failed:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },

  // Logout user
  logoutUser: async (username: string) => {
    try {
      const response = await api.patch(`/users/${username}`, {
        action: 'logout',
        name: username,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Change password
  changePassword: async (username: string, currentPassword: string, newPassword: string) => {
    try {
      const response = await api.patch(`/users/${username}/password`, {
        name: username,
        current_password: currentPassword,
        new_password: newPassword,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get list of users
  getUsers: async () => {
    try {
      console.log('Fetching users list');
      const response = await api.get('/users');
      console.log('Users list fetched successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch users:', error.response?.data || error.message);
      throw error.response?.data || error;
    }
  },
};
