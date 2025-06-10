import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../../utils/api';

// Define asset types
export interface Asset {
  id: string;
  symbol: string;
  name: string;
  type: 'cryptocurrency' | 'token' | 'fiat' | 'commodity';
  coingecko_id?: string;
  cryptocompare_id?: string;
  address?: string;
  decimals?: number;
  chain?: string;
  icon?: string;
  is_erc20?: boolean;
  is_stablecoin?: boolean;
}

export interface AssetPrice {
  price_usd: string;
  change_24h_percent: string;
  market_cap_usd?: string;
  volume_24h_usd?: string;
  high_24h_usd?: string;
  low_24h_usd?: string;
  last_updated: number;
}

export interface AssetHistory {
  times: number[];  // Unix timestamps
  prices: string[];  // Price in USD at each timestamp
}

// Define assets API endpoints
export const assetsApi = createApi({
  reducerPath: 'assetsApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Asset', 'Price'],
  endpoints: (builder) => ({
    // Get all supported assets
    getAllAssets: builder.query<Asset[], void>({
      query: () => 'assets',
      providesTags: ['Asset'],
      // Keep data fresh for a longer time as asset list doesn't change often
      keepUnusedDataFor: 3600, // 1 hour
    }),
    
    // Search assets
    searchAssets: builder.query<Asset[], string>({
      query: (query) => `assets/search?q=${encodeURIComponent(query)}`,
      providesTags: ['Asset'],
    }),
    
    // Get current price for a specific asset
    getAssetPrice: builder.query<AssetPrice, string>({
      query: (assetId) => `assets/${assetId}/price`,
      providesTags: (result, error, assetId) => [
        { type: 'Price', id: assetId },
        'Price',
      ],
      // Keep price data fresh
      keepUnusedDataFor: 60, // 1 minute
    }),
    
    // Get historical price data for a specific asset
    getAssetHistory: builder.query<AssetHistory, { assetId: string, timeframe: string }>({
      query: ({ assetId, timeframe }) => `assets/${assetId}/history?timeframe=${timeframe}`,
      providesTags: (result, error, { assetId }) => [
        { type: 'Price', id: `history_${assetId}` },
        'Price',
      ],
      // Historical data doesn't change often for older timeframes
      keepUnusedDataFor: 600, // 10 minutes
    }),
    
    // Get current prices for multiple assets at once
    getMultipleAssetPrices: builder.query<Record<string, AssetPrice>, string[]>({
      query: (assetIds) => ({
        url: 'assets/prices',
        method: 'POST',
        body: { assets: assetIds },
      }),
      providesTags: (result, error, assetIds) => [
        ...assetIds.map(id => ({ type: 'Price' as const, id })),
        'Price',
      ],
      keepUnusedDataFor: 60, // 1 minute
    }),
    
    // Add a custom asset
    addCustomAsset: builder.mutation<Asset, Partial<Asset>>({
      query: (asset) => ({
        url: 'assets/custom',
        method: 'PUT',
        body: asset,
      }),
      invalidatesTags: ['Asset'],
    }),
    
    // Update a custom asset
    updateCustomAsset: builder.mutation<Asset, { id: string, asset: Partial<Asset> }>({
      query: ({ id, asset }) => ({
        url: `assets/custom/${id}`,
        method: 'PATCH',
        body: asset,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Asset', id },
        'Asset',
      ],
    }),
    
    // Get detailed asset metadata
    getAssetDetails: builder.query<Asset & { description?: string, links?: Record<string, string> }, string>({
      query: (assetId) => `assets/${assetId}/details`,
      providesTags: (result, error, assetId) => [
        { type: 'Asset', id: assetId },
        'Asset',
      ],
    }),
    
    // Get market data for a specific asset
    getAssetMarketData: builder.query<{
      pairs: Array<{ exchange: string, pair: string, volume_24h_usd: string }>,
      total_volume_24h_usd: string,
      num_exchanges: number
    }, string>({
      query: (assetId) => `assets/${assetId}/markets`,
      providesTags: (result, error, assetId) => [
        { type: 'Price', id: `markets_${assetId}` },
        'Price',
      ],
    }),
  }),
  // No need for overrideExisting in standalone API
});

// Export hooks for usage in components with type assertion to handle TypeScript complexity
export const {
  useGetAllAssetsQuery,
  useSearchAssetsQuery,
  useGetAssetPriceQuery,
  useGetAssetHistoryQuery,
  useGetMultipleAssetPricesQuery,
  useAddCustomAssetMutation,
  useUpdateCustomAssetMutation,
  useGetAssetDetailsQuery,
  useGetAssetMarketDataQuery,
} = assetsApi as any;
