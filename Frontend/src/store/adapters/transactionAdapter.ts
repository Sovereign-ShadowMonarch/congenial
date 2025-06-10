import { createEntityAdapter } from '@reduxjs/toolkit';
import { Transaction } from '../apis/transactionsApi';

/**
 * Entity adapter for normalizing transaction data in Redux.
 * Provides methods for CRUD operations on transactions.
 */
export const transactionAdapter = createEntityAdapter<Transaction>({
  // Use transaction id as the primary key
  selectId: (transaction) => transaction.id,
  
  // Sort transactions by timestamp (newest first)
  sortComparer: (a, b) => b.timestamp - a.timestamp,
});

// Pre-defined selectors for transaction entities
export const transactionSelectors = transactionAdapter.getSelectors();

/**
 * Initial state for the transaction entities
 * Used to initialize transaction slice state
 */
export const initialTransactionsState = transactionAdapter.getInitialState({
  // Additional state properties can be added here
  loading: false,
  filterApplied: false,
  filters: {
    startTime: undefined,
    endTime: undefined,
    types: [],
    assets: [],
    locations: [],
    tags: [],
  },
});

/**
 * Add a pagination selector to get paginated transactions
 */
export const selectPaginatedTransactions = (
  state: ReturnType<typeof initialTransactionsState>,
  { page, pageSize }: { page: number; pageSize: number }
) => {
  const start = page * pageSize;
  const end = start + pageSize;
  
  return Object.values(state.entities)
    .filter(Boolean)
    .sort((a, b) => b!.timestamp - a!.timestamp)
    .slice(start, end);
};
