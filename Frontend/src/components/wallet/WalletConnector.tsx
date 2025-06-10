import React, { useState, useEffect } from 'react';
import { useWalletConnection } from '@/hooks/useWalletConnection';

interface WalletConnectorProps {
  size?: 'sm' | 'md' | 'lg';
  showBalance?: boolean;
  showNetwork?: boolean;
  className?: string;
}

export const WalletConnector: React.FC<WalletConnectorProps> = ({
  size = 'md',
  showBalance = true,
  showNetwork = true,
  className = '',
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const {
    isConnected,
    address,
    ensName,
    chainId,
    balance,
    isConnecting,
    error,
    supportedChains,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    connectors,
  } = useWalletConnection();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest('[data-wallet-container]')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Format address for display
  const formatAddress = (address: string | null) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Get current network name
  const currentNetwork = React.useMemo(() => {
    return supportedChains.find(chain => chain.id === chainId)?.name || 'Unknown';
  }, [supportedChains, chainId]);

  // Helper to get wallet connector icon (placeholder for actual icons)
  const getWalletIconPath = (connectorId: string) => {
    switch (connectorId) {
      case 'metaMask':
        return '/icons/metamask.svg';
      case 'coinbaseWallet':
        return '/icons/coinbase.svg';
      case 'walletConnect':
        return '/icons/walletconnect.svg';
      case 'ledger':
        return '/icons/ledger.svg';
      default:
        return '/icons/wallet.svg';
    }
  };

  // Copy address to clipboard
  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
        .then(() => {
          setCopied(true);
        })
        .catch(err => {
          console.error('Failed to copy address:', err);
        });
    }
  };

  // UI size classes
  const sizeClasses = {
    sm: 'text-xs py-1 px-2',
    md: 'text-sm py-2 px-3',
    lg: 'text-base py-2 px-4',
  };

  // If not connected, show connect button
  if (!isConnected) {
    return (
      <div data-wallet-container className={`relative ${className}`}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={isConnecting}
          className={`${sizeClasses[size]} flex items-center justify-center rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow transition-colors ${isConnecting ? 'opacity-70 cursor-not-allowed' : ''}`}
          aria-label="Connect wallet"
          aria-expanded={isDropdownOpen}
          aria-haspopup="true"
          data-testid="connect-wallet-button"
        >
          {isConnecting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connecting...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
              Connect Wallet
            </>
          )}
        </button>

        {/* Wallet selection dropdown */}
        {isDropdownOpen && (
          <div 
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5 py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="wallet-menu"
          >
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Wallet</h3>
            </div>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => {
                  connectWallet(connector.id);
                  setIsDropdownOpen(false);
                }}
                disabled={!connector.ready}
                className="flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                role="menuitem"
                data-testid={`wallet-option-${connector.id}`}
              >
                <div className="flex-shrink-0 h-6 w-6 mr-3 relative">
                  <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                    </svg>
                  </div>
                </div>
                <div>
                  <p className="font-medium">{connector.name}</p>
                  {!connector.ready && <p className="text-xs text-gray-500">Not installed</p>}
                </div>
              </button>
            ))}
            {error && (
              <div className="px-4 py-2 text-xs text-red-600 dark:text-red-400 border-t border-gray-200 dark:border-gray-700">
                {error}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // If connected, show wallet info
  return (
    <div data-wallet-container className={`relative ${className}`}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`${sizeClasses[size]} flex items-center rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium transition-colors border border-indigo-200`}
        aria-label="Wallet options"
        aria-expanded={isDropdownOpen}
        aria-haspopup="true"
        data-testid="wallet-info-button"
      >
        {/* Chain indicator */}
        {showNetwork && (
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" title={currentNetwork} aria-label={`Connected to ${currentNetwork}`}></span>
        )}

        {/* Address/ENS */}
        <span className="mr-2" title={address || ''}>{ensName || formatAddress(address)}</span>
        
        {/* Balance */}
        {showBalance && balance && (
          <span className="bg-indigo-200 py-0.5 px-2 rounded-md text-sm">
            {parseFloat(balance).toFixed(4)} ETH
          </span>
        )}
      </button>

      {/* Account dropdown */}
      {isDropdownOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 ring-1 ring-black ring-opacity-5"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="wallet-options-menu"
        >
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Connected Account</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{address}</p>
          </div>
          
          {/* Network selection */}
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Network</p>
            <select
              value={chainId?.toString() || '1'}
              onChange={(e) => {
                const newChainId = parseInt(e.target.value);
                if (!isNaN(newChainId) && switchNetwork) {
                  switchNetwork(newChainId);
                }
              }}
              className="w-full text-sm bg-gray-100 dark:bg-gray-700 border-none rounded py-1 px-2"
              aria-label="Select blockchain network"
              data-testid="network-selector"
            >
              {supportedChains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Balance display */}
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Balance</p>
            <p className="text-sm font-mono">{balance || '0.0000'} ETH</p>
          </div>

          {/* Actions */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyAddress}
                className="text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                data-testid="copy-address-button"
              >
                {copied ? 'Copied!' : 'Copy Address'}
              </button>
              
              <button
                onClick={() => {
                  if (address) {
                    // Safe way to open a new window
                    const url = `https://etherscan.io/address/${address}`;
                    const newWindow = window.open();
                    if (newWindow) {
                      newWindow.opener = null;
                      newWindow.location.href = url;
                    }
                  }
                }}
                className="text-xs py-1 px-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded transition-colors"
                aria-label="View wallet on blockchain explorer"
                data-testid="view-explorer-button"
              >
                View on Explorer
              </button>
            </div>
            
            <button
              onClick={() => {
                disconnectWallet();
                setIsDropdownOpen(false);
              }}
              className="w-full mt-2 text-xs py-1 px-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
              aria-label="Disconnect wallet"
              data-testid="disconnect-wallet-button"
            >
              Disconnect
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnector;
