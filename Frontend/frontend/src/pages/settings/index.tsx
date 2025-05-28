import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { 
  CheckIcon,
  SunIcon,
  MoonIcon,
  CurrencyDollarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Mock settings API endpoints
// In a real application, these would be part of the API client
const settingsApi = {
  getSettings: async () => {
    // Simulate API call
    return {
      theme: localStorage.getItem('theme') || 'light',
      currency: localStorage.getItem('currency') || 'USD',
      timeFormat: localStorage.getItem('timeFormat') || '24h',
      notifications: localStorage.getItem('notifications') === 'true',
    };
  },
  updateSettings: async (settings: any) => {
    // Simulate API call
    Object.entries(settings).forEach(([key, value]) => {
      localStorage.setItem(key, value as string);
    });
    return settings;
  },
};

// Form schema for settings
const settingsSchema = z.object({
  currency: z.string().min(1, 'Currency is required'),
  timeFormat: z.enum(['12h', '24h']),
  notifications: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user settings
  const { 
    data: settings, 
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useQuery({
    queryKey: ['userSettings'],
    queryFn: settingsApi.getSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      currency: settings?.currency || 'USD',
      timeFormat: settings?.timeFormat || '24h',
      notifications: settings?.notifications || false,
    },
    values: settings as SettingsFormData,
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: settingsApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      setSuccessMessage('Settings updated successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to update settings');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Submit handler for updating settings
  const onSubmit = async (data: SettingsFormData) => {
    setErrorMessage(null);
    try {
      await updateSettingsMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in mutation callbacks
    }
  };

  // Currency options
  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' },
    { value: 'CNY', label: 'Chinese Yuan (CNY)' },
    { value: 'BTC', label: 'Bitcoin (BTC)' },
    { value: 'ETH', label: 'Ethereum (ETH)' },
  ];

  return (
    <ProtectedRoute>
      <Layout title="Settings">
        <div className="py-6">
          {/* Success and Error Messages */}
          {successMessage && (
            <div className="alert alert-success mb-4">
              <CheckIcon className="h-6 w-6" />
              <span>{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="card-title">Account Settings</h2>
                <button 
                  className="btn btn-sm"
                  onClick={() => refetchSettings()}
                >
                  <ArrowPathIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="divider"></div>

              {/* User Info Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm opacity-70">Username</div>
                    <div className="text-lg font-semibold">{user?.username || 'Not logged in'}</div>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* Theme Section */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">Theme Settings</h3>
                <div className="flex items-center gap-4">
                  <span>Theme:</span>
                  <div className="btn-group">
                    <button 
                      className={`btn ${theme === 'light' ? 'btn-active' : ''}`}
                      onClick={() => theme === 'dark' && toggleTheme()}
                    >
                      <SunIcon className="h-5 w-5 mr-1" />
                      Light
                    </button>
                    <button 
                      className={`btn ${theme === 'dark' ? 'btn-active' : ''}`}
                      onClick={() => theme === 'light' && toggleTheme()}
                    >
                      <MoonIcon className="h-5 w-5 mr-1" />
                      Dark
                    </button>
                  </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* Settings Form */}
              {isLoadingSettings ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <h3 className="text-lg font-bold mb-4">Display Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Default Currency</span>
                      </label>
                      <div className="input-group">
                        <span className="flex items-center px-3 border border-r-0 border-base-300 bg-base-200 text-base-content">
                          <CurrencyDollarIcon className="h-5 w-5" />
                        </span>
                        <select 
                          className={`select select-bordered flex-1 ${errors.currency ? 'select-error' : ''}`}
                          {...register('currency')}
                        >
                          {currencies.map((currency) => (
                            <option key={currency.value} value={currency.value}>
                              {currency.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {errors.currency && (
                        <label className="label">
                          <span className="label-text-alt text-error">{errors.currency.message}</span>
                        </label>
                      )}
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Time Format</span>
                      </label>
                      <div className="flex gap-4">
                        <label className="label cursor-pointer gap-2">
                          <input 
                            type="radio" 
                            className="radio" 
                            value="12h"
                            {...register('timeFormat')}
                          />
                          <span className="label-text">12-hour (AM/PM)</span>
                        </label>
                        <label className="label cursor-pointer gap-2">
                          <input 
                            type="radio" 
                            className="radio" 
                            value="24h"
                            {...register('timeFormat')}
                          />
                          <span className="label-text">24-hour</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="form-control mt-4">
                    <label className="label cursor-pointer justify-start gap-2">
                      <input 
                        type="checkbox" 
                        className="checkbox" 
                        {...register('notifications')}
                      />
                      <span className="label-text">Enable Notifications</span>
                    </label>
                  </div>

                  <div className="mt-6">
                    <button 
                      type="submit"
                      className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                      disabled={isSubmitting || !isDirty}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Settings'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="card bg-base-100 shadow-xl mt-6">
            <div className="card-body">
              <h3 className="card-title text-error">Danger Zone</h3>
              
              <div className="divider"></div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold">Reset Application Data</h4>
                  <p className="text-sm opacity-70">This will reset all your application settings and preferences.</p>
                </div>
                <button className="btn btn-error">Reset Data</button>
              </div>
              
              <div className="divider"></div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold">Delete Account</h4>
                  <p className="text-sm opacity-70">Permanently delete your account and all associated data.</p>
                </div>
                <button className="btn btn-error">Delete Account</button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
