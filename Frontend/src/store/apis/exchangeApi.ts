import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../../utils/api';

// Define exchange types
export interface Exchange {
  name: string;
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string;
  isConnected: boolean;
  lastSynced?: number;
  syncStatus?: 'idle' | 'syncing' | 'error';
}

export interface ExchangeBalance {
  asset: string;
  symbol: string;
  amount: string;
  value_usd: string;
  price_usd: string;
}

export interface ExchangeBalances {
  [exchange: string]: {
    balances: ExchangeBalance[];
    total_value_usd: string;
    last_updated: number;
  };
}

export interface SyncStatus {
  [exchange: string]: {
    status: 'idle' | 'syncing' | 'error' | 'success';
    progress?: number;
    message?: string;
    last_synced?: number;
  };
}

// Define exchange API endpoints
export const exchangeApi = createApi({
  reducerPath: 'exchangeApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Exchange', 'Balance'],
  endpoints: (builder) => ({
    // Get all connected exchanges
    getExchanges: builder.query<string[], void>({
      query: () => 'exchanges',
      providesTags: ['Exchange'],
    }),
    
    // Connect a new exchange
    connectExchange: builder.mutation<boolean, Exchange>({
      query: (exchange) => ({
        url: 'exchanges',
        method: 'PUT',
        body: {
          name: exchange.name,
          api_key: exchange.apiKey,
          api_secret: exchange.apiSecret,
          passphrase: exchange.passphrase,
        },
      }),
      invalidatesTags: ['Exchange'],
    }),
    
    // Disconnect an exchange
    disconnectExchange: builder.mutation<boolean, string>({
      query: (exchangeName) => ({
        url: 'exchanges',
        method: 'DELETE',
        body: {
          name: exchangeName,
        },
      }),
      invalidatesTags: ['Exchange', 'Balance'],
    }),
    
    // Get balances for a specific exchange
    getExchangeBalances: builder.query<{ balances: ExchangeBalance[], total_value_usd: string }, string>({
      query: (exchangeName) => `exchanges/balances/${exchangeName}`,
      providesTags: (result, error, exchangeName) => [
        { type: 'Balance', id: exchangeName },
        'Balance',
      ],
    }),
    
    // Get balances for all exchanges
    getAllExchangeBalances: builder.query<ExchangeBalances, void>({
      query: () => 'exchanges/balances',
      providesTags: ['Balance', 'Exchange'],
      // Implement polling for real-time updates
      keepUnusedDataFor: 60, // seconds
    }),
    
    // Sync an exchange manually
    syncExchange: builder.mutation<{ task_id: number }, string>({
      query: (exchangeName) => ({
        url: `exchanges/sync/${exchangeName}`,
        method: 'POST',
      }),
      // Don't invalidate tags immediately as sync happens asynchronously
    }),
    
    // Get exchange rates
    getExchangeRates: builder.query<Record<string, number>, string[]>({
      query: (currencies) => ({
        url: 'exchangerates',
        method: 'GET',
        params: { currencies: currencies.join(',') },
      }),
      // Keep rates fresh
      keepUnusedDataFor: 300, // 5 minutes
    }),
  }),
  // No need for overrideExisting in standalone API
});

// Export hooks for usage in components with type assertion to handle TypeScript complexity
export const {
  useGetExchangesQuery,
  useConnectExchangeMutation,
  useDisconnectExchangeMutation,
  useGetExchangeBalancesQuery,
  useGetAllExchangeBalancesQuery,
  useSyncExchangeMutation,
  useGetExchangeRatesQuery,
} = exchangeApi as any;
