import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../../utils/api';

// Define authentication types
export interface User {
  name: string;
  // Add more user properties as needed
}

export interface UserSettings {
  have_premium: boolean;
  version: string;
  main_currency: string;
  ui_floating_precision: number;
  include_crypto2crypto: boolean;
  anonymized_logs: boolean;
  submit_usage_analytics: boolean;
  // Add more settings as needed
}

export interface LoginRequest {
  action: 'login';
  password: string;
  sync_approval: 'unknown' | 'yes' | 'no';
}

export interface RegisterRequest {
  name: string;
  password: string;
  initial_settings?: {
    submit_usage_analytics: boolean;
    main_currency: string;
  };
}

export interface LoginResponse {
  exchanges: string[];
  settings: UserSettings;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Define auth API endpoints
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // Get all users and their login status
    getUsers: builder.query<Record<string, 'loggedin' | 'loggedout'>, void>({
      query: () => 'users',
      providesTags: ['User'],
    }),
    
    // Login endpoint
    login: builder.mutation<LoginResponse, { username: string, password: string, sync_approval: string }>({
      query: ({ username, password, sync_approval }) => ({
        url: `users/${username}`,
        method: 'PATCH',
        body: {
          action: 'login',
          password,
          sync_approval,
        },
      }),
      invalidatesTags: ['User'],
    }),
    
    // Logout endpoint
    logout: builder.mutation<boolean, string>({
      query: (username) => ({
        url: `users/${username}`,
        method: 'PATCH',
        body: {
          action: 'logout',
        },
      }),
      invalidatesTags: ['User'],
    }),
    
    // Register new user
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (credentials) => ({
        url: 'users',
        method: 'PUT',
        body: credentials,
      }),
      invalidatesTags: ['User'],
    }),
    
    // Change password
    changePassword: builder.mutation<boolean, { username: string, request: ChangePasswordRequest }>({
      query: ({ username, request }) => ({
        url: `users/${username}/password`,
        method: 'PATCH',
        body: request,
      }),
    }),
  }),
  // No need for overrideExisting in standalone API
});

// Export hooks for usage in components with type assertion to handle TypeScript complexity
export const {
  useGetUsersQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useChangePasswordMutation,
} = authApi as any;
