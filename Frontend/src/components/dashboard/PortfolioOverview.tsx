import React from 'react';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { SerializedError } from '@reduxjs/toolkit';

interface PortfolioMetric {
  title: string;
  value: string;
  change?: {
    value: string;
    percentage: string;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

interface PortfolioSummary {
  total_value: number;
  total_value_change_24h: number;
  total_value_percentage_change_24h: number;
  best_performing_asset: {
    symbol: string;
    name: string;
    change_percentage: number;
  };
  worst_performing_asset: {
    symbol: string;
    name: string;
    change_percentage: number;
  };
  total_asset_count: number;
  performance_data?: Array<{
    timestamp: number;
    value: number;
  }>;
  allocation?: Array<{
    asset: string;
    symbol: string;
    value: number;
    percentage: number;
    color?: string;
  }>;
}

interface PortfolioOverviewProps {
  isLoading: boolean;
  data?: PortfolioSummary;
  error?: FetchBaseQueryError | SerializedError;
}

const PortfolioOverview: React.FC<PortfolioOverviewProps> = ({
  isLoading,
  data,
  error
}) => {
  // Format currency with proper symbols and decimal places
  const formatCurrency = (value: number): string => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(value);
  };
  
  // Format percentage values with + or - prefix and % suffix
  const formatPercentage = (value: number): string => {
    const prefix = value >= 0 ? '+' : '';
    return `${prefix}${value.toFixed(2)}%`;
  };
  
  // Generate metrics data from API response
  const getMetrics = (): PortfolioMetric[] => {
    if (!data) return [];
    
    return [
      {
        title: 'Portfolio Value',
        value: formatCurrency(data.total_value),
        change: {
          value: formatCurrency(data.total_value_change_24h),
          percentage: formatPercentage(data.total_value_percentage_change_24h),
          isPositive: data.total_value_percentage_change_24h >= 0
        }
      },
      {
        title: 'Best Performer',
        value: data.best_performing_asset?.symbol || 'N/A',
        change: {
          value: data.best_performing_asset?.name || '',
          percentage: formatPercentage(data.best_performing_asset?.change_percentage || 0),
          isPositive: (data.best_performing_asset?.change_percentage || 0) >= 0
        }
      },
      {
        title: 'Worst Performer',
        value: data.worst_performing_asset?.symbol || 'N/A',
        change: {
          value: data.worst_performing_asset?.name || '',
          percentage: formatPercentage(data.worst_performing_asset?.change_percentage || 0),
          isPositive: (data.worst_performing_asset?.change_percentage || 0) >= 0
        }
      },
      {
        title: 'Total Assets',
        value: data.total_asset_count.toString(),
        change: undefined
      }
    ];
  };
  
  // Loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, index) => (
          <div 
            key={index}
            className="h-28 bg-gray-100 dark:bg-gray-700 animate-pulse rounded-lg shadow"
          />
        ))}
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
        <p className="font-semibold">Error loading portfolio data</p>
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
        <p className="font-semibold">No portfolio data available</p>
        <p className="text-sm mt-1">
          Connect exchanges or add transactions to start tracking your portfolio.
        </p>
      </div>
    );
  }
  
  const metrics = getMetrics();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div 
          key={index}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all hover:shadow-lg"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {metric.title}
            </p>
            {metric.icon && (
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-full">
                {metric.icon}
              </div>
            )}
          </div>
          <div className="mt-2">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {metric.value}
            </p>
            {metric.change && (
              <div className="flex items-center mt-1">
                <span 
                  className={`text-sm font-medium ${
                    metric.change.isPositive 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {metric.change.percentage}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                  {metric.change.value}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PortfolioOverview;
