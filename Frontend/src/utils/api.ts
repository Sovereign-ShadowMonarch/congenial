import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Using a partial type for RootState since we only need auth.token
// This prevents circular dependency issues with the store
interface AuthState {
  token: string | null;
}

interface PartialRootState {
  auth: AuthState;
}

/**
 * Creates a consistent base query configuration with authentication and response handling
 * @param baseUrl - The base URL for the API requests (defaults to '/api/1/')
 * @returns A configured fetchBaseQuery instance with auth token handling and error management
 */
export const createBaseQuery = (baseUrl: string = '/api/1/') => {
  return fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Get auth token from Redux store
      const state = getState() as PartialRootState;
      const token = state.auth.token;
      
      // Add authorization header if token exists
      if (token && typeof token === 'string') {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Set standard headers
      headers.set('Content-Type', 'application/json');
      return headers;
    },
    responseHandler: async (response) => {
      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        return Promise.reject(errorData || { 
          message: `Server error: ${response.status} ${response.statusText}` 
        });
      }
      
      try {
        // Parse JSON response
        const data = await response.json() as { result: unknown; message?: string };
        
        // The backend always wraps responses in { result, message }
        // If message exists but result is falsy, treat as error
        if (data.message && !data.result) {
          return Promise.reject({ 
            message: data.message,
            status: response.status,
            statusText: response.statusText
          });
        }
        
        // Return only the result part of the response
        return data.result;
      } catch (error) {
        // Handle JSON parsing errors
        return Promise.reject({ 
          message: 'Failed to parse server response',
          parseError: error
        });
      }
    }
  });
};

/**
 * Utility for creating standardized error transformers for RTK Query
 * @returns A configured error transformer for consistent error handling
 */
export const createErrorTransformer = () => {
  return (baseQueryReturnValue: any, meta: any, arg: any) => {
    const status = baseQueryReturnValue?.status || 'FETCH_ERROR';
    const message = baseQueryReturnValue?.data?.message || 
                    baseQueryReturnValue?.error ||
                    'An unknown error occurred';
                    
    return {
      status,
      message,
      originalError: baseQueryReturnValue,
      timestamp: new Date().toISOString()
    };
  };
};

/**
 * Common tag types used across all API slices for cache invalidation
 */
export const commonTagTypes = [
  'User', 
  'Settings', 
  'Exchange', 
  'Balance', 
  'Trade',
  'Transaction', 
  'LedgerAction', 
  'BlockchainAccount',
  'DeFiPosition', 
  'Asset', 
  'Price', 
  'Statistics'
] as const;

/**
 * Type for common tag types
 */
export type CommonTagTypes = typeof commonTagTypes[number];
