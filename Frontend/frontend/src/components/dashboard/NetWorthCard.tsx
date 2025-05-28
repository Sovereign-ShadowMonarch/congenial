import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface NetWorthCardProps {
  netWorth: number;
  change24h: number;
  isLoading?: boolean;
}

const NetWorthCard: React.FC<NetWorthCardProps> = ({ netWorth, change24h, isLoading = false }) => {
  const formattedNetWorth = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(netWorth);

  const formattedChange = Math.abs(change24h).toFixed(2) + '%';
  const isPositive = change24h >= 0;

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="animate-pulse flex flex-col space-y-4">
            <div className="h-6 bg-base-200 rounded w-1/3"></div>
            <div className="h-12 bg-base-200 rounded w-2/3"></div>
            <div className="h-6 bg-base-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-base-content/70">Net Worth</h2>
        <p className="text-4xl font-bold">{formattedNetWorth}</p>
        <div className="flex items-center mt-2">
          <div className={`badge ${isPositive ? 'badge-success' : 'badge-error'} gap-1`}>
            {isPositive ? (
              <ArrowTrendingUpIcon className="h-3 w-3" />
            ) : (
              <ArrowTrendingDownIcon className="h-3 w-3" />
            )}
            {formattedChange}
          </div>
          <span className="text-sm text-base-content/70 ml-2">24h</span>
        </div>
      </div>
    </div>
  );
};

export default NetWorthCard;
