import api from './client';
import { z } from 'zod';

// Response schemas
const AssetBalanceSchema = z.object({
  amount: z.string(),
  usd_value: z.string(),
  asset: z.string(),
  percentage_of_net_value: z.string(),
});

const BalancesResponseSchema = z.object({
  assets: z.record(z.record(AssetBalanceSchema)),
  liabilities: z.record(z.record(AssetBalanceSchema)),
  location: z.string().optional(),
});

const NetValueSchema = z.object({
  times: z.array(z.number()),
  data: z.array(z.string()),
});

const ValueDistributionSchema = z.object({
  distribution: z.array(z.object({
    asset: z.string(),
    percentage: z.string(),
    usd_value: z.string(),
  })),
  by: z.string(),
});

export const portfolioApi = {
  // Get all balances
  getAllBalances: async (saveData = false, asyncQuery = false, ignoreCache = false) => {
    try {
      const response = await api.get('/balances/', {
        params: {
          save_data: saveData,
          async_query: asyncQuery,
          ignore_cache: ignoreCache,
        },
      });
      return BalancesResponseSchema.parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get exchange balances
  getExchangeBalances: async (exchangeName: string, asyncQuery = false, ignoreCache = false) => {
    try {
      const response = await api.get(`/exchanges/balances/${exchangeName}`, {
        params: {
          async_query: asyncQuery,
          ignore_cache: ignoreCache,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get blockchain balances
  getBlockchainBalances: async (blockchain: string, asyncQuery = false, ignoreCache = false) => {
    try {
      const response = await api.get(`/balances/blockchains/${blockchain}`, {
        params: {
          async_query: asyncQuery,
          ignore_cache: ignoreCache,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get DeFi balances
  getDefiBalances: async (asyncQuery = false) => {
    try {
      const response = await api.get('/blockchains/ETH/defi', {
        params: {
          async_query: asyncQuery,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get net value statistics
  getNetValueStatistics: async () => {
    try {
      const response = await api.get('/statistics/netvalue');
      return NetValueSchema.parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get value distribution
  getValueDistribution: async (distributionBy: 'asset' | 'location' = 'asset') => {
    try {
      const response = await api.get('/statistics/value_distribution', {
        params: {
          distribution_by: distributionBy,
        },
      });
      return ValueDistributionSchema.parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Create balance snapshot
  createBalanceSnapshot: async () => {
    try {
      const response = await api.post('/balances/snapshot');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get portfolio summary
  getPortfolioSummary: async () => {
    try {
      const response = await api.get('/portfolio');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
