import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../../utils/apiUtils';

// Define transaction types
export interface Transaction {
  id: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'transfer' | 'swap' | 'income' | 'expense' | 'staking' | 'mining' | 'airdrop' | 'gift';
  from_asset: string;
  from_amount: string;
  to_asset: string;
  to_amount: string;
  fee_asset?: string;
  fee_amount?: string;
  rate?: string;
  rate_currency?: string;
  location?: string;
  notes?: string;
  tags?: string[];
  is_cost_basis_calculated: boolean;
  realized_pnl?: string;
  cost_basis?: string;
  trade_value_usd?: string;
}

export interface TransactionFilters {
  startTime?: number;
  endTime?: number;
  types?: string[];
  assets?: string[];
  locations?: string[];
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface TransactionStats {
  total_trades: number;
  buy_count: number;
  sell_count: number;
  total_volume_usd: string;
  avg_trade_size_usd: string;
  total_fees_usd: string;
  most_traded_asset: {
    asset: string;
    symbol: string;
    volume_usd: string;
  };
  best_performing_trade: {
    id: string;
    pnl_usd: string;
    pnl_percentage: string;
  };
}

export interface CsvImportResult {
  imported: number;
  failed: number;
  errors?: string[];
}

// Define transactions API endpoints
export const transactionsApi = createApi({
  reducerPath: 'transactionsApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Trade', 'Transaction', 'Balance', 'Statistics'],
  endpoints: (builder) => ({
    // Get all transactions with optional filtering
    getTransactions: builder.query<{ transactions: Transaction[], total_count: number }, TransactionFilters | undefined>({
      query: (filters = {}) => ({
        url: 'trades',
        method: 'GET',
        params: filters,
      }),
      providesTags: ['Trade', 'Transaction'],
    }),
    
    // Get a single transaction by ID
    getTransaction: builder.query<Transaction, string>({
      query: (id) => `trades/${id}`,
      providesTags: (result, error, id) => [{ type: 'Trade', id }],
    }),
    
    // Add a new transaction
    addTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (transaction) => ({
        url: 'trades',
        method: 'PUT',
        body: transaction,
      }),
      invalidatesTags: ['Trade', 'Transaction', 'Balance', 'Statistics'],
    }),
    
    // Update an existing transaction
    updateTransaction: builder.mutation<Transaction, { id: string, transaction: Partial<Transaction> }>({
      query: ({ id, transaction }) => ({
        url: `trades/${id}`,
        method: 'PATCH',
        body: transaction,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Trade', id },
        'Trade',
        'Transaction',
        'Balance',
        'Statistics',
      ],
    }),
    
    // Delete a transaction
    deleteTransaction: builder.mutation<boolean, string>({
      query: (id) => ({
        url: `trades/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Trade', 'Transaction', 'Balance', 'Statistics'],
    }),
    
    // Import transactions from CSV
    importTransactionsCsv: builder.mutation<CsvImportResult, { format: string, data: string }>({
      query: ({ format, data }) => ({
        url: 'trades/import',
        method: 'POST',
        body: { format, data },
      }),
      invalidatesTags: ['Trade', 'Transaction', 'Balance', 'Statistics'],
    }),
    
    // Export transactions to CSV
    exportTransactionsCsv: builder.query<string, TransactionFilters | undefined>({
      query: (filters = {}) => ({
        url: 'trades/export',
        method: 'GET',
        params: { ...filters, format: 'csv' },
        responseHandler: 'text',
      }),
    }),
    
    // Get transaction statistics
    getTransactionStats: builder.query<TransactionStats, void>({
      query: () => 'trades/stats',
      providesTags: ['Statistics', 'Trade'],
    }),
    
    // Get common tags used in transactions
    getTransactionTags: builder.query<string[], void>({
      query: () => 'trades/tags',
      providesTags: ['Trade'],
    }),
    
    // Bulk delete transactions
    bulkDeleteTransactions: builder.mutation<{ deleted: number }, string[]>({
      query: (ids) => ({
        url: 'trades/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: ['Trade', 'Transaction', 'Balance', 'Statistics'],
    }),
  }),
  // No need for overrideExisting in standalone API
});

// Export hooks for usage in components with type assertion to handle TypeScript complexity
export const {
  useGetTransactionsQuery,
  useGetTransactionQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useImportTransactionsCsvMutation,
  useExportTransactionsCsvQuery,
  useGetTransactionStatsQuery,
  useGetTransactionTagsQuery,
  useBulkDeleteTransactionsMutation,
} = transactionsApi as any;
