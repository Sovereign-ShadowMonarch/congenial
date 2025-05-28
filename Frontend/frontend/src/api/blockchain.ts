import api from './client';
import { z } from 'zod';

// Response schemas
const BlockchainAccountSchema = z.object({
  address: z.string(),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const XpubSchema = z.object({
  xpub: z.string(),
  derivation_path: z.string().optional(),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

const XpubDataSchema = z.object({
  xpub: z.string(),
  derivation_path: z.string().optional(),
  label: z.string().optional(),
  tags: z.array(z.string()).optional(),
  addresses: z.array(z.object({
    address: z.string(),
    user_index: z.number(),
    derived_index: z.number(),
  })).optional(),
});

export const blockchainApi = {
  // Get blockchain accounts
  getBlockchainAccounts: async (blockchain: string) => {
    try {
      const response = await api.get(`/blockchains/${blockchain}`);
      if (blockchain === 'BTC' && response.data.result.xpubs) {
        return {
          standalone: z.array(BlockchainAccountSchema).parse(response.data.result.standalone || []),
          xpubs: z.array(XpubDataSchema).parse(response.data.result.xpubs || []),
        };
      }
      return z.array(BlockchainAccountSchema).parse(response.data.result);
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Add blockchain accounts
  addBlockchainAccounts: async (blockchain: string, accounts: Array<{
    address: string;
    label?: string;
    tags?: string[];
  }>) => {
    try {
      const response = await api.put(`/blockchains/${blockchain}`, {
        accounts,
        async_query: false,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Edit blockchain accounts
  editBlockchainAccounts: async (blockchain: string, accounts: Array<{
    address: string;
    label?: string;
    tags?: string[];
  }>) => {
    try {
      const response = await api.patch(`/blockchains/${blockchain}`, {
        accounts,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Remove blockchain accounts
  removeBlockchainAccounts: async (blockchain: string, accounts: string[], asyncQuery = false) => {
    try {
      const response = await api.delete(`/blockchains/${blockchain}`, {
        data: {
          accounts,
          async_query: asyncQuery,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Add Bitcoin xpub
  addBitcoinXpub: async (xpubData: {
    xpub: string;
    derivation_path?: string;
    label?: string;
    tags?: string[];
  }, asyncQuery = false) => {
    try {
      const response = await api.put('/blockchains/BTC/xpub', {
        ...xpubData,
        async_query: asyncQuery,
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Edit Bitcoin xpub
  editBitcoinXpub: async (xpubData: {
    xpub: string;
    derivation_path?: string;
    label?: string;
    tags?: string[];
  }) => {
    try {
      const response = await api.patch('/blockchains/BTC/xpub', xpubData);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Delete Bitcoin xpub
  deleteBitcoinXpub: async (xpubs: Array<{
    xpub: string;
    derivation_path?: string;
  }>, asyncQuery = false) => {
    try {
      const response = await api.delete('/blockchains/BTC/xpub', {
        data: {
          xpubs,
          async_query: asyncQuery,
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },

  // Get supported blockchains
  getSupportedBlockchains: async () => {
    try {
      const response = await api.get('/blockchains/supported');
      return response.data.result;
    } catch (error: any) {
      throw error.response?.data || error;
    }
  },
};
