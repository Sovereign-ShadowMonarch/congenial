import React, { ReactNode } from 'react';
import { ReduxProvider } from './ReduxProvider';
import { Web3Provider } from './Web3Provider';
import { ErrorBoundary } from 'react-error-boundary';

interface AppProviderProps {
  children: ReactNode;
}

/**
 * Global error fallback component
 */
const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-4 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-red-100 p-3 mb-4">
            <svg className="h-10 w-10 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error.message}</p>
          <button
            onClick={resetErrorBoundary}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            Try again
          </button>
        </div>
        <div className="mt-4 p-4 border border-red-200 rounded-md bg-red-50 dark:bg-red-900/20 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 font-mono whitespace-pre-wrap break-words">
            {error.stack}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Application Provider that wraps the app with all required providers
 * in the correct order for proper dependency resolution.
 */
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Track if providers have loaded and log any critical errors
  const handleError = (error: Error, info: { componentStack: string }) => {
    // In production, you would want to send this to your error reporting service
    console.error('Application error:', error);
    console.error('Component stack:', info.componentStack);
  };

  return (
    <ErrorBoundary 
      FallbackComponent={ErrorFallback} 
      onError={handleError}
      onReset={() => {
        // Reset application state here if needed
        window.location.href = '/';
      }}
    >
      {/* Redux must be the outermost provider as other providers depend on it */}
      <ReduxProvider>
        {/* Web3Provider depends on Redux for configuration */}
        <Web3Provider>
          {children}
        </Web3Provider>
      </ReduxProvider>
    </ErrorBoundary>
  );
};

export default AppProvider;
