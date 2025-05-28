import api from './client';
import { z } from 'zod';

// DeFi protocol schemas
const MakerDAODSRBalanceSchema = z.object({
  current_dsr: z.string(),
  balances: z.record(z.object({
    amount: z.string(),
    usd_value: z.string(),
  })),
});

const MakerDAOVaultSchema = z.object({
  identifier: z.number(),
  collateral_type: z.string(),
  owner: z.string(),
  collateral_asset: z.string(),
  collateral_amount: z.string(),
  collateral_usd_value: z.string(),
  debt_value: z.string(),
  debt_usd_value: z.string(),
  collateralization_ratio: z.string().nullable(),
  liquidation_ratio: z.string(),
  liquidation_price: z.string().nullable(),
  stability_fee: z.string(),
});

const AaveBalanceSchema = z.object({
  address: z.string(),
  balances: z.array(z.object({
    asset: z.object({
      identifier: z.string(),
      name: z.string(),
      symbol: z.string(),
    }),
    balance: z.object({
      amount: z.string(),
      usd_value: z.string(),
    }),
    apy: z.string().optional(),
  })),
});

const CompoundBalanceSchema = z.object({
  address: z.string(),
  balances: z.array(z.object({
    asset: z.string(),
    balance: z.object({
      amount: z.string(),
      usd_value: z.string(),
    }),
    apy: z.string().optional(),
  })),
});

const UniswapBalanceSchema = z.object({
  address: z.string(),
  assets: z.array(z.object({
    asset: z.string(),
    total_amount: z.string(),
    usd_value: z.string(),
  })),
});

const YearnVaultBalanceSchema = z.object({
  address: z.string(),
  vaults: z.array(z.object({
    vault_address: z.string(),
    vault_name: z.string(),
    vault_symbol: z.string(),
    underlying_asset: z.string(),
    vault_balance: z.object({
      amount: z.string(),
      usd_value: z.string(),
    }),
    underlying_balance: z.object({
      amount: z.string(),
      usd_value: z.string(),
    }),
    apy: z.string().optional(),
  })),
});

export const defiApi = {
  // MakerDAO
  makerDAO: {
    getDSRBalance: async () => {
      try {
        const response = await api.get('/blockchains/ETH/modules/makerdao/dsrbalance');
        return MakerDAODSRBalanceSchema.parse(response.data.result);
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getDSRHistory: async () => {
      try {
        const response = await api.get('/blockchains/ETH/modules/makerdao/dsrhistory');
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getVaults: async () => {
      try {
        const response = await api.get('/blockchains/ETH/modules/makerdao/vaults');
        return z.array(MakerDAOVaultSchema).parse(response.data.result);
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getVaultDetails: async (vaultId: number) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/makerdao/vaultdetails', {
          params: { vault_id: vaultId },
        });
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },
  },

  // Aave
  aave: {
    getBalances: async (addresses?: string[]) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/aave/balances', {
          params: addresses ? { addresses: addresses.join(',') } : undefined,
        });
        return z.array(AaveBalanceSchema).parse(response.data.result);
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getHistory: async (addresses?: string[], fromTimestamp?: number, toTimestamp?: number) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/aave/history', {
          params: {
            addresses: addresses?.join(','),
            from_timestamp: fromTimestamp,
            to_timestamp: toTimestamp,
          },
        });
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },
  },

  // Compound
  compound: {
    getBalances: async (addresses?: string[]) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/compound/balances', {
          params: addresses ? { addresses: addresses.join(',') } : undefined,
        });
        return z.array(CompoundBalanceSchema).parse(response.data.result);
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getHistory: async (addresses?: string[], fromTimestamp?: number, toTimestamp?: number) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/compound/history', {
          params: {
            addresses: addresses?.join(','),
            from_timestamp: fromTimestamp,
            to_timestamp: toTimestamp,
          },
        });
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },
  },

  // Uniswap
  uniswap: {
    getBalances: async (addresses?: string[]) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/uniswap/balances', {
          params: addresses ? { addresses: addresses.join(',') } : undefined,
        });
        return z.array(UniswapBalanceSchema).parse(response.data.result);
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getTrades: async (addresses?: string[], fromTimestamp?: number, toTimestamp?: number) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/uniswap/history/trades', {
          params: {
            addresses: addresses?.join(','),
            from_timestamp: fromTimestamp,
            to_timestamp: toTimestamp,
          },
        });
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getEvents: async (addresses?: string[], fromTimestamp?: number, toTimestamp?: number) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/uniswap/history/events', {
          params: {
            addresses: addresses?.join(','),
            from_timestamp: fromTimestamp,
            to_timestamp: toTimestamp,
          },
        });
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },
  },

  // Yearn
  yearn: {
    getVaultBalances: async (addresses?: string[]) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/yearn/vaults/balances', {
          params: addresses ? { addresses: addresses.join(',') } : undefined,
        });
        return z.array(YearnVaultBalanceSchema).parse(response.data.result);
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getVaultHistory: async (addresses?: string[], fromTimestamp?: number, toTimestamp?: number) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/yearn/vaults/history', {
          params: {
            addresses: addresses?.join(','),
            from_timestamp: fromTimestamp,
            to_timestamp: toTimestamp,
          },
        });
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },
  },

  // Balancer
  balancer: {
    getBalances: async (addresses?: string[]) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/balancer/balances', {
          params: addresses ? { addresses: addresses.join(',') } : undefined,
        });
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getEvents: async (addresses?: string[], fromTimestamp?: number, toTimestamp?: number) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/balancer/history/events', {
          params: {
            addresses: addresses?.join(','),
            from_timestamp: fromTimestamp,
            to_timestamp: toTimestamp,
          },
        });
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },

    getTrades: async (addresses?: string[], fromTimestamp?: number, toTimestamp?: number) => {
      try {
        const response = await api.get('/blockchains/ETH/modules/balancer/history/trades', {
          params: {
            addresses: addresses?.join(','),
            from_timestamp: fromTimestamp,
            to_timestamp: toTimestamp,
          },
        });
        return response.data.result;
      } catch (error: any) {
        throw error.response?.data || error;
      }
    },
  },
};
