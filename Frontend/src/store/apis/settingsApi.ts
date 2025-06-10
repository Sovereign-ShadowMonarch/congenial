import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../../utils/api';

// Import UserSettings type from authApi to maintain consistency
import { UserSettings } from './authApi';

// Define settings-specific types
export interface DisplaySettings {
  ui_floating_precision: number;
  date_display_format: string;
  main_currency: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export interface SecuritySettings {
  two_factor_enabled: boolean;
  session_timeout: number;
  api_rate_limiting: boolean;
}

export interface NotificationSettings {
  email_notifications: boolean;
  price_alerts: boolean;
  security_alerts: boolean;
  portfolio_updates: boolean;
  update_frequency: 'daily' | 'weekly' | 'monthly' | 'never';
}

export interface PrivacySettings {
  anonymized_logs: boolean;
  submit_usage_analytics: boolean;
  data_sharing: boolean;
}

export interface SettingsUpdateRequest {
  settings: Partial<UserSettings>;
}

// Define settings API endpoints
export const settingsApi = createApi({
  reducerPath: 'settingsApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Settings'],
  
  endpoints: (builder) => ({
    // Get user settings
    getUserSettings: builder.query<UserSettings, void>({
      query: () => 'settings',
      providesTags: ['Settings'],
    }),
    
    // Update user settings
    updateSettings: builder.mutation<UserSettings, SettingsUpdateRequest>({
      query: (request) => ({
        url: 'settings',
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Export user settings (for backup)
    exportSettings: builder.query<string, void>({
      query: () => ({
        url: 'settings/export',
        responseHandler: async (response) => {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        },
      }),
    }),
    
    // Import user settings
    importSettings: builder.mutation<UserSettings, FormData>({
      query: (formData) => ({
        url: 'settings/import',
        method: 'POST',
        body: formData,
        formData: true,
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Reset settings to defaults
    resetSettings: builder.mutation<UserSettings, void>({
      query: () => ({
        url: 'settings/reset',
        method: 'POST',
      }),
      invalidatesTags: ['Settings'],
    }),
    
    // Get available currencies
    getAvailableCurrencies: builder.query<string[], void>({
      query: () => 'settings/currencies',
    }),
    
    // Get available languages
    getAvailableLanguages: builder.query<{ code: string, name: string }[], void>({
      query: () => 'settings/languages',
    }),
  }),

});

// Export hooks for usage in components
export const {
  useGetUserSettingsQuery,
  useUpdateSettingsMutation,
  useExportSettingsQuery,
  useImportSettingsMutation,
  useGetDisplaySettingsQuery,
  useGetNotificationSettingsQuery,
  useGetPrivacySettingsQuery,
  useGetSecuritySettingsQuery
} = settingsApi as any; // Type assertion to avoid TypeScript errors
