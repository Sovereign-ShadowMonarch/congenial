import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../../utils/api';

// Define blockchain and wallet types
export interface BlockchainAccount {
  address: string;
  blockchain: string;
  label?: string;
  tags?: string[];
  created_at: number;
  last_updated: number;
}

export interface WalletBalance {
  asset: string;
  symbol: string;
  amount: string;
  value_usd: string;
  price_usd: string;
  address: string;
  blockchain: string;
}

export interface BlockchainBalances {
  total_value_usd: string;
  balances: WalletBalance[];
  last_updated: number;
}

export interface AddressRequest {
  address: string;
  label?: string;
  tags?: string[];
}

// Define wallet API endpoints
export const walletApi = createApi({
  reducerPath: 'walletApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['BlockchainAccount', 'Balance'],
  endpoints: (builder) => ({
    // Get all tracked blockchain accounts
    getBlockchainAccounts: builder.query<BlockchainAccount[], void>({
      query: () => 'blockchains/accounts',
      providesTags: ['BlockchainAccount'],
    }),
    
    // Add a new blockchain address
    addBlockchainAddress: builder.mutation<BlockchainAccount, { blockchain: string, request: AddressRequest }>({
      query: ({ blockchain, request }) => ({
        url: `blockchains/${blockchain}`,
        method: 'PUT',
        body: request,
      }),
      invalidatesTags: ['BlockchainAccount'],
    }),
    
    // Remove a blockchain address
    removeBlockchainAddress: builder.mutation<boolean, { blockchain: string, address: string }>({
      query: ({ blockchain, address }) => ({
        url: `blockchains/${blockchain}/${address}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['BlockchainAccount'],
    }),
    
    // Get balances for a specific blockchain
    getBlockchainBalances: builder.query<BlockchainBalances, string>({
      query: (blockchain) => `blockchains/${blockchain}/balances`,
      providesTags: (result, error, blockchain) => [
        { type: 'Balance', id: `blockchain_${blockchain}` },
        'Balance',
      ],
    }),
    
    // Get balances for a specific address
    getAddressBalances: builder.query<WalletBalance[], { blockchain: string, address: string }>({
      query: ({ blockchain, address }) => `blockchains/${blockchain}/${address}/balances`,
      providesTags: (result, error, { blockchain, address }) => [
        { type: 'Balance', id: `address_${address}` },
        'Balance',
      ],
    }),
    
    // Get all blockchain balances (aggregated)
    getAllBlockchainBalances: builder.query<{ [blockchain: string]: BlockchainBalances }, void>({
      query: () => 'blockchains/balances',
      providesTags: ['Balance', 'BlockchainAccount'],
    }),
    
    // Update address label or tags
    updateAddressDetails: builder.mutation<BlockchainAccount, { blockchain: string, address: string, label?: string, tags?: string[] }>({
      query: ({ blockchain, address, ...data }) => ({
        url: `blockchains/${blockchain}/${address}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['BlockchainAccount'],
    }),
    
    // Sync blockchain address manually
    syncBlockchainAddress: builder.mutation<{ task_id: number }, { blockchain: string, address: string }>({
      query: ({ blockchain, address }) => ({
        url: `blockchains/${blockchain}/${address}/sync`,
        method: 'POST',
      }),
    }),
    
    // Bulk import addresses
    bulkImportAddresses: builder.mutation<{ added: number, failed: number }, { blockchain: string, addresses: AddressRequest[] }>({
      query: ({ blockchain, addresses }) => ({
        url: `blockchains/${blockchain}/bulk`,
        method: 'POST',
        body: { addresses },
      }),
      invalidatesTags: ['BlockchainAccount'],
    }),
  }),
  // No need for overrideExisting in standalone API
});

// Export hooks for usage in components with type assertion to handle TypeScript complexity
export const {
  useGetBlockchainAccountsQuery,
  useAddBlockchainAddressMutation,
  useRemoveBlockchainAddressMutation,
  useGetBlockchainBalancesQuery,
  useGetAddressBalancesQuery,
  useGetAllBlockchainBalancesQuery,
  useUpdateAddressDetailsMutation,
  useSyncBlockchainAddressMutation,
  useBulkImportAddressesMutation,
} = walletApi as any;
