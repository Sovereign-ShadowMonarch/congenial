import React, { useState } from 'react';
import { useGetWalletsQuery, Wallet, WalletBalance } from '@/store/apis/walletsApi';
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface WalletStatusBarProps {
  onConnect?: () => void;
}

const WalletStatusBar: React.FC<WalletStatusBarProps> = ({ onConnect }) => {
  const { data, isLoading, isError, error } = useGetWalletsQuery();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Format wallet address to show only first and last few characters
  const formatAddress = (address: string): string => {
    if (!address || address.length < 10) return address;
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Format balance with appropriate number of decimal places
  const formatBalance = (balance: number, symbol: string): string => {
    const decimals = symbol === 'BTC' ? 8 : 4;
    return `${balance.toFixed(decimals)} ${symbol}`;
  };
  
  // Get network icon class based on blockchain name
  const getNetworkIcon = (network: string): string => {
    const icons: Record<string, string> = {
      ethereum: 'ethereum',
      polygon: 'polygon',
      binance: 'binance',
      avalanche: 'avalanche',
      solana: 'solana',
      bitcoin: 'bitcoin',
      default: 'globe'
    };
    
    return icons[network.toLowerCase()] || icons.default;
  };
  
  // Get background color class for network
  const getNetworkBgColorClass = (networkIcon: string): string => {
    const bgColors: Record<string, string> = {
      ethereum: 'bg-blue-100 dark:bg-blue-900/30',
      polygon: 'bg-purple-100 dark:bg-purple-900/30',
      binance: 'bg-yellow-100 dark:bg-yellow-900/30',
      avalanche: 'bg-red-100 dark:bg-red-900/30',
      solana: 'bg-indigo-100 dark:bg-indigo-900/30',
      bitcoin: 'bg-orange-100 dark:bg-orange-900/30',
      default: 'bg-gray-100 dark:bg-gray-700'
    };
    
    return bgColors[networkIcon] || bgColors.default;
  };
  
  // Get text color class for network
  const getNetworkTextColorClass = (networkIcon: string): string => {
    const textColors: Record<string, string> = {
      ethereum: 'text-blue-600 dark:text-blue-400',
      polygon: 'text-purple-600 dark:text-purple-400',
      binance: 'text-yellow-600 dark:text-yellow-400',
      avalanche: 'text-red-600 dark:text-red-400',
      solana: 'text-indigo-600 dark:text-indigo-400',
      bitcoin: 'text-orange-600 dark:text-orange-400',
      default: 'text-gray-600 dark:text-gray-400'
    };
    
    return textColors[networkIcon] || textColors.default;
  };
  
  // Handle connect wallet button click
  const handleConnectWallet = () => {
    if (onConnect) {
      onConnect();
    }
  };
  
  // Error state with retry option
  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-medium text-red-700 dark:text-red-300">Failed to load wallet data</p>
            <p className="text-sm mt-1 text-red-600 dark:text-red-400">
              {(error as any)?.data?.message || (error as any)?.message || 'Could not connect to wallet service'}
            </p>
          </div>
          <button
            onClick={handleConnectWallet}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="animate-pulse flex justify-between items-center">
          <div className="flex space-x-4 items-center">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28"></div>
        </div>
      </div>
    );
  }
  
  // No wallets state
  if (!data || !data.wallets || data.wallets.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No Wallets Connected</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Connect a wallet to view your assets</p>
            </div>
          </div>
          <button
            onClick={handleConnectWallet}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }
  
  // Toggle expanded/collapsed view
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  // If not expanded, show compact view
  if (!isExpanded) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex -space-x-2 overflow-hidden">
              {data.wallets.slice(0, 3).map((wallet: Wallet, index: number) => {
                const networkIcon = getNetworkIcon(wallet.network);
                const bgColorClass = getNetworkBgColorClass(networkIcon);
                const textColorClass = getNetworkTextColorClass(networkIcon);
                
                return (
                  <div 
                    key={wallet.id} 
                    className={`h-8 w-8 rounded-full ${bgColorClass} flex items-center justify-center border-2 border-white dark:border-gray-800`}
                  >
                    <span className={`${textColorClass} text-xs`}>
                      {wallet.network.substring(0, 1).toUpperCase()}
                    </span>
                  </div>
                );
              })}
              {data.wallets.length > 3 && (
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center border-2 border-white dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400 text-xs font-medium">+{data.wallets.length - 3}</span>
                </div>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {data.wallets.length} Wallet{data.wallets.length !== 1 ? 's' : ''} Connected
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Click to expand details
              </p>
            </div>
          </div>
          <button
            onClick={toggleExpanded}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    );
  }
  
  // Expanded view with full wallet list
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Connected Wallets ({data.wallets.length})</h3>
        <button
          onClick={toggleExpanded}
          className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      <ul className="divide-y divide-gray-200 dark:divide-gray-700">
        {data.wallets.map((wallet: Wallet) => (
          <li key={wallet.id} className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {(() => {
                  const networkIcon = getNetworkIcon(wallet.network);
                  const bgColorClass = getNetworkBgColorClass(networkIcon);
                  const textColorClass = getNetworkTextColorClass(networkIcon);
                  
                  return (
                    <div className={`h-8 w-8 rounded-full ${bgColorClass} flex items-center justify-center`}>
                      <span className={`${textColorClass} text-xs`}>
                        {wallet.network.substring(0, 1).toUpperCase()}
                      </span>
                    </div>
                  );
                })()}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatAddress(wallet.address)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {wallet.name || wallet.network}
                  </p>
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {wallet.balances && wallet.balances.length > 0 && (
                  <div className="flex flex-col items-end">
                    {wallet.balances.slice(0, 2).map((balance: WalletBalance, idx: number) => (
                      <span key={idx} className={idx === 0 ? 'font-semibold' : 'text-xs text-gray-500 dark:text-gray-400'}>
                        {formatBalance(balance.amount, balance.asset)}
                      </span>
                    ))}
                    {wallet.balances.length > 2 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        +{wallet.balances.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="bg-gray-50 dark:bg-gray-750 px-4 py-3 text-right">
        <button
          onClick={handleConnectWallet}
          className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        >
          Add Wallet
        </button>
      </div>
    </div>
  );
};

export default WalletStatusBar;
