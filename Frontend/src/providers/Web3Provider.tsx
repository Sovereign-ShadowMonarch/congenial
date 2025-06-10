import React, { ReactNode, useEffect } from 'react';
import { WagmiConfig } from 'wagmi';
import { Web3Modal } from '@web3modal/wagmi';
import { config, chains } from '@/config/web3Config';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

// Get WalletConnect project ID from environment variable
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

interface Web3ProviderProps {
  children: ReactNode;
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  // Get theme from Redux
  const { theme } = useSelector((state: RootState) => state.ui);
  
  // Initialize Web3Modal with safety checks
  const web3modal = React.useMemo(() => {
    try {
      if (!projectId) {
        console.warn('WalletConnect projectId is missing. Some wallet connection features might not work properly.');
      }
      
      return new Web3Modal({
        projectId,
        chains,
        themeMode: theme === 'auto' ? 'light' : theme,
        themeVariables: {
          '--w3m-font-family': 'Inter, sans-serif',
          '--w3m-accent-color': '#6366F1', // Indigo-500
          '--w3m-background-color': '#4F46E5', // Indigo-600
        },
        metadata: {
          name: 'Crypto Portfolio Manager',
          description: 'Enterprise-grade cryptocurrency portfolio management platform',
          url: 'https://cryptoportfolio.app',
          icons: ['https://cryptoportfolio.app/icons/icon-512x512.png'],
        },
        termsOfServiceUrl: 'https://cryptoportfolio.app/terms',
        privacyPolicyUrl: 'https://cryptoportfolio.app/privacy',
      });
    } catch (error) {
      console.error('Failed to initialize Web3Modal:', error);
      // Fallback to a simpler version with minimal config to prevent crashes
      return new Web3Modal({
        projectId,
        chains,
      });
    }
  }, [theme]);

  // Log when provider mounts/unmounts for debugging purposes
  useEffect(() => {
    console.log('Web3Provider mounted');
    
    return () => {
      console.log('Web3Provider unmounted');
    };
  }, []);

  // Render the provider wrapping the app with error boundary
  return (
    <ErrorBoundary>
      <WagmiConfig config={config}>
        {children}
        <web3modal.Web3Modal />
      </WagmiConfig>
    </ErrorBoundary>
  );
};

// Simple error boundary to prevent wallet connection issues from crashing the app
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Web3Provider error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-100 text-red-700 rounded-md my-4">
          <h3 className="text-lg font-medium">Wallet Connection Error</h3>
          <p>There was an error connecting to your wallet. Please refresh the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Web3Provider;
