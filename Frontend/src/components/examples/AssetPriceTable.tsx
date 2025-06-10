import React, { useState, useEffect } from 'react';
import { useGetAllAssetsQuery, useGetMultipleAssetPricesQuery } from '../../store/apis/assetsApi';
import { useAdaptivePolling } from '../../utils/apiHooks';

interface AssetPriceTableProps {
  limit?: number;
  refreshInterval?: number;
}

export const AssetPriceTable: React.FC<AssetPriceTableProps> = ({ 
  limit = 10, 
  refreshInterval = 30000 // 30 seconds default
}) => {
  // Track if tab is currently active for adaptive polling
  const [isTabActive, setIsTabActive] = useState(true);
  
  // Get all assets
  const { 
    data: assets, 
    isLoading: assetsLoading, 
    error: assetsError 
  } = useGetAllAssetsQuery();
  
  // Filter to show only top assets by market cap up to limit
  const topAssets = assets
    ? [...assets]
        .sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0))
        .slice(0, limit)
    : [];
  
  // Create a list of asset IDs for price query
  const assetIds = topAssets.map(asset => asset.id);
  
  // Calculate adaptive polling interval based on tab activity
  const pollingInterval = useAdaptivePolling(isTabActive, refreshInterval, refreshInterval * 5);
  
  // Get prices for selected assets with adaptive polling
  const { 
    data: prices, 
    isLoading: pricesLoading, 
    error: pricesError 
  } = useGetMultipleAssetPricesQuery(
    { assetIds },
    { 
      pollingInterval,
      skip: assetIds.length === 0
    }
  );
  
  // Track tab visibility for adaptive polling
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabActive(!document.hidden);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Format currency values
  const formatCurrency = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    });
    
    return formatter.format(value);
  };
  
  // Format percentage values
  const formatPercent = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A';
    
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };
  
  // Combined loading state
  const isLoading = assetsLoading || pricesLoading;
  
  // Combined error state
  const error = assetsError || pricesError;
  
  if (isLoading) return <div className="p-4">Loading asset prices...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {(error as any).message || 'Failed to load asset data'}</div>;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Top Assets</h2>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Auto refreshes every {isTabActive ? (refreshInterval / 1000) : (refreshInterval * 5 / 1000)} seconds
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Asset
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                24h Change
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Market Cap
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Volume (24h)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {topAssets.map(asset => {
              const price = prices?.[asset.id];
              return (
                <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {asset.icon_url && (
                        <img 
                          src={asset.icon_url} 
                          alt={asset.name} 
                          className="h-6 w-6 mr-2 rounded-full"
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {asset.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {asset.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900 dark:text-white">
                    {formatCurrency(price?.current_price)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm text-right ${
                    price?.price_change_percentage_24h && price.price_change_percentage_24h >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {price?.price_change_percentage_24h !== undefined 
                      ? formatPercent(price.price_change_percentage_24h) 
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    {formatCurrency(asset.market_cap)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500 dark:text-gray-400">
                    {formatCurrency(price?.total_volume)}
                  </td>
                </tr>
              );
            })}
            {topAssets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                  No assets found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
        Data refreshed {new Date().toLocaleTimeString()}
      </div>
    </div>
  );
};

export default AssetPriceTable;
