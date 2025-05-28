import React, { useState } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

interface Asset {
  symbol: string;
  name: string;
  balance: number;
  value_usd: number;
  pnl_24h: number;
}

interface AssetListProps {
  assets: Asset[];
  isLoading?: boolean;
  onIgnoreAsset?: (symbol: string) => void;
  showIgnoredAssets?: boolean;
  ignoredAssets?: string[];
}

const AssetList: React.FC<AssetListProps> = ({ 
  assets, 
  isLoading = false,
  onIgnoreAsset,
  showIgnoredAssets = true,
  ignoredAssets = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter assets based on search term and ignored status
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          asset.symbol.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!showIgnoredAssets && ignoredAssets.includes(asset.symbol)) {
      return false;
    }
    
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="overflow-x-auto">
        <div className="animate-pulse mb-4">
          <div className="h-10 bg-base-200 rounded w-full max-w-xs"></div>
        </div>
        <table className="table w-full">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Balance</th>
              <th>Value</th>
              <th>24h Change</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, index) => (
              <tr key={index} className="hover">
                <td>
                  <div className="animate-pulse flex items-center space-x-2">
                    <div className="h-8 w-8 bg-base-200 rounded-full"></div>
                    <div className="h-4 bg-base-200 rounded w-20"></div>
                  </div>
                </td>
                <td><div className="animate-pulse h-4 bg-base-200 rounded w-16"></div></td>
                <td><div className="animate-pulse h-4 bg-base-200 rounded w-24"></div></td>
                <td><div className="animate-pulse h-4 bg-base-200 rounded w-16"></div></td>
                <td><div className="animate-pulse h-8 bg-base-200 rounded w-20"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full max-w-xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-base-content/50" />
          </div>
          <input 
            type="text" 
            className="input input-bordered w-full pl-10"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label cursor-pointer gap-2">
            <span className="label-text">Show ignored assets</span>
            <input 
              type="checkbox" 
              className="toggle toggle-primary" 
              checked={showIgnoredAssets}
              onChange={() => {}} // This would be handled by the parent component
            />
          </label>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Balance</th>
              <th>Value</th>
              <th>24h Change</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10">
                  {searchTerm ? 
                    'No assets matching your search' : 
                    'No assets in your portfolio yet'
                  }
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => {
                const isIgnored = ignoredAssets.includes(asset.symbol);
                return (
                  <tr key={asset.symbol} className={`hover ${isIgnored ? 'opacity-60' : ''}`}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="avatar placeholder">
                          <div className="bg-primary text-primary-content rounded-full w-8 h-8">
                            <span>{asset.symbol.substring(0, 2).toUpperCase()}</span>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold">{asset.symbol}</div>
                          <div className="text-sm opacity-50">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td>{asset.balance.toFixed(8)}</td>
                    <td>
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(asset.value_usd)}
                    </td>
                    <td>
                      <div className="flex items-center">
                        {asset.pnl_24h >= 0 ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-success mr-1" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-error mr-1" />
                        )}
                        <span className={asset.pnl_24h >= 0 ? 'text-success' : 'text-error'}>
                          {Math.abs(asset.pnl_24h).toFixed(2)}%
                        </span>
                      </div>
                    </td>
                    <td>
                      <button 
                        className={`btn btn-sm ${isIgnored ? 'btn-success' : 'btn-ghost'}`}
                        onClick={() => onIgnoreAsset && onIgnoreAsset(asset.symbol)}
                      >
                        {isIgnored ? 'Unignore' : 'Ignore'}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetList;
