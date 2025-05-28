import api from './client';
import { z } from 'zod';

// Response schemas
const TradeSchema = z.object({
  trade_id: z.string(),
  timestamp: z.number(),
  location: z.string(),
  base_asset: z.string(),
  quote_asset: z.string(),
  trade_type: z.enum(['buy', 'sell']),
  amount: z.string(),
  rate: z.string(),
  fee: z.string().optional(),
  fee_currency: z.string().optional(),
  link: z.string().optional(),
  notes: z.string().optional(),
});

const AssetMovementSchema = z.object({
  identifier: z.string(),
  location: z.string(),
  category: z.string(),
  address: z.string().optional(),
  transaction_id: z.string().optional(),
  timestamp: z.number(),
  asset: z.string(),
  amount: z.string(),
  fee_asset: z.string().optional(),
  fee: z.string().optional(),
  link: z.string().optional(),
});

const LedgerActionSchema = z.object({
  identifier: z.number(),
  timestamp: z.number(),
  action_type: z.string(),
  location: z.string(),
  amount: z.string(),
  asset: z.string(),
  rate: z.string().optional(),
  rate_asset: z.string().optional(),
  link: z.string().optional(),
  notes: z.string().optional(),
});

export const transactionsApi = {
  // Get trades
  getTrades: async (params?: {
    from_timestamp?: number;
    to_timestamp?: number;
    location?: string;
    base_asset?: string;
    quote_asset?: string;
    trade_type?: 'buy' | 'sell';
    limit?: number;
    offset?: number;
    order_by_attributes?: string[];
    ascending?: boolean[];
  }) => {
    try {
      const response = await api.get('/trades', { params });
      return {
        entries: z.array(TradeSchema).parse(response.data.result.entries),
        entries_found: response.data.result.entries_found,
        entries_limit: response.data.result.entries_limit,
        entries_total: response.data.result.entries_total,
      };
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Add trade
  addTrade: async (trade: Omit<z.infer<typeof TradeSchema>, 'trade_id'>) => {
    try {
      const response = await api.put('/trades', trade);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Edit trade
  editTrade: async (trade: z.infer<typeof TradeSchema>) => {
    try {
      const response = await api.patch('/trades', trade);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Delete trades
  deleteTrades: async (tradeIds: string[]) => {
    try {
      const response = await api.delete('/trades', {
        data: { trades_ids: tradeIds },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get asset movements
  getAssetMovements: async (params?: {
    from_timestamp?: number;
    to_timestamp?: number;
    location?: string;
    asset?: string;
    limit?: number;
    offset?: number;
    order_by_attributes?: string[];
    ascending?: boolean[];
  }) => {
    try {
      const response = await api.get('/asset_movements', { params });
      return {
        entries: z.array(AssetMovementSchema).parse(response.data.result.entries),
        entries_found: response.data.result.entries_found,
        entries_limit: response.data.result.entries_limit,
        entries_total: response.data.result.entries_total,
      };
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get ledger actions
  getLedgerActions: async (params?: {
    from_timestamp?: number;
    to_timestamp?: number;
    location?: string;
    asset?: string;
    action_type?: string;
    limit?: number;
    offset?: number;
    order_by_attributes?: string[];
    ascending?: boolean[];
  }) => {
    try {
      const response = await api.get('/ledgeractions', { params });
      return {
        entries: z.array(LedgerActionSchema).parse(response.data.result.entries),
        entries_found: response.data.result.entries_found,
        entries_limit: response.data.result.entries_limit,
        entries_total: response.data.result.entries_total,
      };
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Add ledger action
  addLedgerAction: async (action: Omit<z.infer<typeof LedgerActionSchema>, 'identifier'>) => {
    try {
      const response = await api.put('/ledgeractions', action);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Edit ledger action
  editLedgerAction: async (action: z.infer<typeof LedgerActionSchema>) => {
    try {
      const response = await api.patch('/ledgeractions', action);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Delete ledger actions
  deleteLedgerActions: async (identifiers: number[]) => {
    try {
      const response = await api.delete('/ledgeractions', {
        data: { identifiers },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get Ethereum transactions
  getEthereumTransactions: async (address: string, params?: {
    from_timestamp?: number;
    to_timestamp?: number;
    limit?: number;
    offset?: number;
  }) => {
    try {
      const response = await api.get(`/blockchains/ETH/transactions/${address}`, { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
