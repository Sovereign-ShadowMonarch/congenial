import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Layout from '@/components/Layout/Layout';
import AssetList from '@/components/portfolio/AssetList';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { portfolioApi } from '@/api/portfolio';
import { assetsApi } from '@/api/assets';

const Portfolio: React.FC = () => {
  const queryClient = useQueryClient();
  const [showIgnoredAssets, setShowIgnoredAssets] = useState(false);

  // Fetch portfolio summary with assets
  const { data: portfolioSummary, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ['portfolioSummary'],
    queryFn: () => portfolioApi.getPortfolioSummary(),
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch ignored assets
  const { data: ignoredAssets, isLoading: isLoadingIgnored } = useQuery({
    queryKey: ['ignoredAssets'],
    queryFn: () => assetsApi.getIgnoredAssets(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add asset to ignored list
  const addIgnoreMutation = useMutation({
    mutationFn: (symbol: string) => assetsApi.addIgnoredAssets([symbol]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ignoredAssets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] });
    },
  });

  // Remove asset from ignored list
  const removeIgnoreMutation = useMutation({
    mutationFn: (symbol: string) => assetsApi.removeIgnoredAssets([symbol]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ignoredAssets'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] });
    },
  });

  // Extract assets from portfolio summary and format them
  const assets = React.useMemo(() => {
    if (!portfolioSummary?.result?.assets) {
      return [];
    }
    
    return portfolioSummary.result.assets.map((asset) => ({
      symbol: asset.symbol,
      name: asset.name,
      balance: asset.balance,
      value_usd: asset.value_usd,
      pnl_24h: asset.pnl_24h,
    }));
  }, [portfolioSummary]);

  // Get ignored assets list
  const ignoredAssetsList = ignoredAssets?.result || [];

  // Toggle asset ignored status
  const handleToggleIgnoreAsset = (symbol: string) => {
    try {
      if (ignoredAssetsList.includes(symbol)) {
        removeIgnoreMutation.mutate(symbol);
      } else {
        addIgnoreMutation.mutate(symbol);
      }
    } catch (error) {
      console.error('Error toggling asset ignored status:', error);
    }
  };

  return (
    <ProtectedRoute>
      <Layout title="Portfolio">
        <div className="py-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="card-title">Your Assets</h2>
                <div className="form-control">
                  <label className="label cursor-pointer gap-2">
                    <span className="label-text">Show ignored assets</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={showIgnoredAssets}
                      onChange={() => setShowIgnoredAssets(!showIgnoredAssets)}
                    />
                  </label>
                </div>
              </div>
              
              <AssetList 
                assets={assets}
                isLoading={isLoadingPortfolio || isLoadingIgnored}
                onIgnoreAsset={handleToggleIgnoreAsset}
                showIgnoredAssets={showIgnoredAssets}
                ignoredAssets={ignoredAssetsList}
              />
              
              <div className="mt-6">
                <div className="alert alert-info">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">Missing assets?</h3>
                    <div className="text-xs">
                      Connect exchanges or add blockchain wallets to see all your assets. 
                      You can also manually add assets that aren't tracked automatically.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Portfolio;
