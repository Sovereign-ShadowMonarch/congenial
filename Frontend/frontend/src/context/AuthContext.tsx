import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { jwtDecode } from 'jwt-decode';

interface User {
  username: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: {
    name: string;
    password: string;
    premium_api_key?: string;
    premium_api_secret?: string;
    initial_settings?: any;
  }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if we have a user session
      const response = await authApi.getUsers();
      if (response.result && response.result.length > 0) {
        const loggedInUser = response.result.find((u: any) => u.logged_in);
        if (loggedInUser) {
          setUser({ username: loggedInUser.username });
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await authApi.loginUser(username, password);
      if (response.result) {
        setUser({ username: response.result.username });
        // The backend should set the authentication cookie
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await authApi.logoutUser(user.username);
      }
      setUser(null);
      // Redirect to login page
      window.location.href = '/auth/signin';
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const register = async (userData: {
    name: string;
    password: string;
    premium_api_key?: string;
    premium_api_secret?: string;
    initial_settings?: any;
  }) => {
    try {
      const response = await authApi.registerUser(userData);
      if (response.result) {
        // After registration, log the user in
        await login(userData.name, userData.password);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Registration failed');
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error('No user logged in');
    }
    
    try {
      await authApi.changePassword(user.username, currentPassword, newPassword);
    } catch (error: any) {
      console.error('Change password error:', error);
      throw new Error(error.message || 'Failed to change password');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    changePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
