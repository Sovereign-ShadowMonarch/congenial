import api from './client';
import { z } from 'zod';

// Response schemas
const AssetSchema = z.object({
  asset_type: z.string(),
  name: z.string(),
  symbol: z.string(),
  started: z.number().optional(),
  swapped_for: z.string().optional(),
  ethereum_address: z.string().optional(),
  decimals: z.number().optional(),
  cryptocompare: z.string().optional(),
  coingecko: z.string().optional(),
  protocol: z.string().optional(),
});

const AssetPriceSchema = z.object({
  asset: z.string(),
  price: z.string(),
  usd_price: z.string().optional(),
});

const HistoricalPriceSchema = z.object({
  assets_price: z.array(AssetPriceSchema),
  target_asset: z.string(),
  timestamp: z.number(),
});

export const assetsApi = {
  // Get all assets
  getAllAssets: async () => {
    try {
      const response = await api.get('/assets/all');
      return z.record(AssetSchema).parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get owned assets
  getOwnedAssets: async () => {
    try {
      const response = await api.get('/assets');
      return z.array(z.string()).parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get current asset prices
  getCurrentPrices: async (assets: string[], targetAsset = 'USD', ignoreCache = false, asyncQuery = false) => {
    try {
      const response = await api.get('/assets/prices/current', {
        params: {
          assets: assets.join(','),
          target_asset: targetAsset,
          ignore_cache: ignoreCache,
          async_query: asyncQuery,
        },
      });
      return z.object({
        assets: z.record(AssetPriceSchema),
        target_asset: z.string(),
        oracles_used: z.array(z.string()),
      }).parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get historical asset prices
  getHistoricalPrices: async (assetsTimestamp: Array<[string, number]>, targetAsset = 'USD', asyncQuery = false) => {
    try {
      const response = await api.post('/assets/prices/historical', {
        assets_timestamp: assetsTimestamp,
        target_asset: targetAsset,
        async_query: asyncQuery,
      });
      return z.array(HistoricalPriceSchema).parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get ignored assets
  getIgnoredAssets: async () => {
    try {
      const response = await api.get('/assets/ignored');
      return z.array(z.string()).parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Add ignored assets
  addIgnoredAssets: async (assets: string[]) => {
    try {
      const response = await api.put('/assets/ignored', { assets });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Remove ignored assets
  removeIgnoredAssets: async (assets: string[]) => {
    try {
      const response = await api.delete('/assets/ignored', {
        data: { assets },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Add custom Ethereum token
  addEthereumToken: async (tokenData: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    coingecko?: string;
    cryptocompare?: string;
    protocol?: string;
    underlying_tokens?: Array<{ address: string; weight: string }>;
  }) => {
    try {
      const response = await api.put('/assets/ethereum', tokenData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Edit custom Ethereum token
  editEthereumToken: async (tokenData: {
    address: string;
    name?: string;
    symbol?: string;
    decimals?: number;
    coingecko?: string;
    cryptocompare?: string;
    protocol?: string;
    underlying_tokens?: Array<{ address: string; weight: string }>;
  }) => {
    try {
      const response = await api.patch('/assets/ethereum', tokenData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Delete custom Ethereum token
  deleteEthereumToken: async (address: string) => {
    try {
      const response = await api.delete('/assets/ethereum', {
        data: { address },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
