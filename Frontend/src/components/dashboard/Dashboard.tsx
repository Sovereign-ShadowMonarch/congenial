import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAppSelector } from '../../store';
import { useSyncPortfolioDataMutation } from '../../store/apis/portfolioApi';
import { CheckCircleIcon, XCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid';

// Error boundary component for safely handling errors in UI components
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error in component:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Error fallback components
const TransactionErrorFallback: React.FC = () => (
  <div className="p-6 text-center">
    <ExclamationCircleIcon className="h-12 w-12 mx-auto text-red-400" />
    <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Failed to load transactions</h3>
    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
      There was an error retrieving your transaction history. Please try again later.
    </p>
  </div>
);

// Import new dashboard components
import PortfolioSummary from './PortfolioSummary';
import PortfolioAllocation from './PortfolioAllocation';
import PerformanceGraph from './PerformanceGraph';
import RecentTransactions from './RecentTransactions';
import QuickActions from './QuickActions';
import WalletStatusBar from './WalletStatusBar';

interface AuthState {
  token: string | null;
  user: {
    id: string;
    email: string;
  } | null;
}

const Dashboard: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error'} | null>(null);
  const router = useRouter();
  const auth = useAppSelector(state => state.auth as AuthState);
  
  // Sync mutation for portfolio data
  const [syncPortfolio, { isLoading: isSyncLoading }] = useSyncPortfolioDataMutation();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!auth.token) {
      router.push('/login');
    }
  }, [auth.token, router]);
  
  // Handle sync action
  const handleSync = async () => {
    try {
      setIsSyncing(true);
      const result = await syncPortfolio().unwrap();
      setIsSyncing(false);
      setNotification({
        message: 'Portfolio data successfully synchronized',
        type: 'success'
      });
      
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
      return result;
    } catch (error) {
      setIsSyncing(false);
      console.error('Sync failed:', error);
      setNotification({
        message: (error as any)?.data?.message || 'Failed to synchronize portfolio data',
        type: 'error'
      });
      
      // Auto-dismiss notification after 5 seconds
      setTimeout(() => setNotification(null), 5000);
      return null;
    }
  };
  
  if (!auth.token) {
    return null; // Will redirect to login
  }
  
  return (
    <div className="flex flex-col space-y-6 p-6 max-w-7xl mx-auto">
      {/* Notification */}
      {notification && (
        <div className={`rounded-md p-4 ${notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
              ) : (
                <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                {notification.message}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className={`inline-flex rounded-md p-1.5 ${notification.type === 'success' ? 'text-green-500 hover:bg-green-100 dark:hover:bg-green-800' : 'text-red-500 hover:bg-red-100 dark:hover:bg-red-800'} focus:outline-none focus:ring-2 focus:ring-offset-2 ${notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'}`}
                >
                  <span className="sr-only">Dismiss</span>
                  <XCircleIcon className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Portfolio Dashboard</h1>
        <WalletStatusBar />
      </div>
      
      {/* Main dashboard grid - improved responsive layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
        {/* Left column - Portfolio Summary */}
        <div className="lg:col-span-8 space-y-4 md:space-y-6">
          {/* Portfolio summary metrics */}
          <PortfolioSummary />
          
          {/* Portfolio performance graph */}
          <PerformanceGraph className="h-full" />
          
          {/* Recent transactions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Recent Transactions</h2>
              <Link href="/transactions">
                <a className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium">
                  View All
                </a>
              </Link>
            </div>
            <ErrorBoundary fallback={<TransactionErrorFallback />}>
              <RecentTransactions limit={5} />
            </ErrorBoundary>
          </div>
        </div>
        
        {/* Right column - Asset allocation and quick actions */}
        <div className="lg:col-span-4 space-y-4 md:space-y-6">
          {/* Portfolio allocation */}
          <PortfolioAllocation className="h-auto" />
          
          {/* Quick actions panel */}
          <QuickActions 
            onSync={handleSync}
            isSyncing={isSyncing || isSyncLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
