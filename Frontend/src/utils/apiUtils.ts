import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { RootState } from '../store';

// Type for the standard API response structure
export interface ApiResponse<T = any> {
  result: T;
  message?: string;
  success: boolean;
}

/**
 * Create a consistent base query with authentication and error handling for RTK Query
 * @returns Configured BaseQueryFn with error handling and response transformation
 */
export function createBaseQuery(): BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError,
  {},
  FetchBaseQueryMeta
> {
  const baseQuery = fetchBaseQuery({
    // API base URL from environment variable, fallback to default
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api/1/',
    
    // Prepares headers for each request, including auth token
    prepareHeaders: (headers, { getState }) => {
      // Get authentication token from Redux state
      const state = getState() as RootState;
      
      // Safely access auth token if it exists
      const authState = state.auth || {};
      const token = typeof authState === 'object' && authState !== null && 'token' in authState ? 
        authState.token : undefined;
      
      // Add auth token if available
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      // Add content type for non-GET requests
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      
      return headers;
    },
    
    // Add credentials for CORS requests
    credentials: 'include',
  });

  // Return wrapped base query with additional error handling
  return async (args, api, extraOptions) => {
    // Execute the base query
    const result = await baseQuery(args, api, extraOptions);
    
    // Extract the error if any
    const error = result.error as FetchBaseQueryError | undefined;
    
    // Log detailed error info in development
    if (error && import.meta.env.DEV) {
      console.error('API Error:', error);
      
      // Log additional details about the request
      if (typeof args === 'string') {
        console.error(`Request path: ${args}`);
      } else {
        console.error(`Request path: ${args.url}`);
        if (args.body) {
          console.error('Request body:', args.body);
        }
      }
    }
    
    // If the response has our API envelope structure
    if (result.data && typeof result.data === 'object' && 'result' in result.data) {
      // Transform to extract just the result property for easier data access
      const apiResponse = result.data as ApiResponse<unknown>;
      
      // If API indicates failure but RTK Query didn't catch it
      if (!apiResponse.success && !result.error) {
        // Create proper error response format expected by RTK Query
        return {
          error: {
            status: 'CUSTOM_ERROR',
            data: {
              message: apiResponse.message || 'An unexpected error occurred'
            },
          } as FetchBaseQueryError,
          data: undefined,
          meta: result.meta
        };
      }
    }
    
    return result;
  };
}

/**
 * Parse error message from RTK Query error
 */
export function parseApiError(error: FetchBaseQueryError | SerializedError | undefined): string {
  if (!error) {
    return 'An unknown error occurred';
  }
  
  // If it's a FetchBaseQueryError
  if ('status' in error) {
    // If server returned a message
    if (error.data && typeof error.data === 'object' && 'message' in error.data) {
      return error.data.message as string;
    }
    
    // Handle standard HTTP errors
    switch (error.status) {
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized. Please log in again.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Error ${error.status}: Request failed.`;
    }
  }
  
  // If it's a SerializedError
  if ('message' in error && error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}
