import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/solid';
import { useGetPortfolioSummaryQuery } from '../../store/apis/portfolioApi';

interface PortfolioSummaryProps {
  className?: string;
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ className }) => {
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useGetPortfolioSummaryQuery();

  // Loading state
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
        <p className="font-medium">Failed to load portfolio summary</p>
        <p className="text-sm mt-1">
          {(error as any)?.data?.message || (error as any)?.message || 'Unknown error occurred'}
        </p>
      </div>
    );
  }

  // No data state
  if (!data) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 text-blue-700 dark:text-blue-300">
        <p className="font-medium">No portfolio data available</p>
        <p className="text-sm mt-1">
          Connect wallets or exchanges to start tracking your portfolio.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Net Worth Card */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Net Worth</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            ${data.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`ml-2 flex items-center text-sm ${data.change24h >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {data.change24h >= 0 ? (
              <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500 dark:text-green-400" />
            ) : (
              <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500 dark:text-red-400" />
            )}
            <span className="sr-only">{data.change24h >= 0 ? 'Increased' : 'Decreased'} by</span>
            {Math.abs(data.change24h).toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Best Performer */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Best Performer</h3>
        <div className="mt-2">
          <div className="flex items-center">
            {data.topGainer && (
              <>
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <img 
                    src={data.topGainer.iconUrl || `https://cryptoicons.org/api/icon/${data.topGainer.symbol.toLowerCase()}/50`} 
                    alt={data.topGainer.name} 
                    className="h-full w-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://cryptoicons.org/api/icon/generic/50';
                    }}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{data.topGainer.symbol}</p>
                  <div className="flex items-baseline">
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                      +{data.topGainer.changePercent.toFixed(2)}%
                    </p>
                    <p className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ${data.topGainer.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </>
            )}
            {!data.topGainer && (
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Worst Performer */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Worst Performer</h3>
        <div className="mt-2">
          <div className="flex items-center">
            {data.topLoser && (
              <>
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <img 
                    src={data.topLoser.iconUrl || `https://cryptoicons.org/api/icon/${data.topLoser.symbol.toLowerCase()}/50`} 
                    alt={data.topLoser.name} 
                    className="h-full w-full"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://cryptoicons.org/api/icon/generic/50';
                    }}
                  />
                </div>
                <div className="ml-3">
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">{data.topLoser.symbol}</p>
                  <div className="flex items-baseline">
                    <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                      {data.topLoser.changePercent.toFixed(2)}%
                    </p>
                    <p className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ${data.topLoser.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </>
            )}
            {!data.topLoser && (
              <p className="text-gray-500 dark:text-gray-400">No data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Asset Count */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Asset Count</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {data.assetCount}
          </p>
          <p className="ml-2 text-sm text-gray-500 dark:text-gray-400">
            Assets tracked
          </p>
        </div>
        <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Across {data.exchangeCount} exchanges and {data.walletCount} wallets
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;
