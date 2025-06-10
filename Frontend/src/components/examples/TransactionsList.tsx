import React, { useState } from 'react';
import { useGetTransactionsQuery, useDeleteTransactionMutation, Transaction as ApiTransaction } from '../../store/apis/transactionsApi';
import { useOptimisticMutation, usePaginatedQuery } from '../../utils/apiHooks';

// Extended transaction interface for component use with additional properties
interface Transaction extends ApiTransaction {
  base_asset: string;
  amount: number;
  location?: string;
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

interface TransactionsListProps {
  initialFilters?: {
    startTime?: number;
    endTime?: number;
    assetId?: string;
    type?: string;
  };
}

export const TransactionsList: React.FC<TransactionsListProps> = ({ initialFilters = {} }) => {
  // State for filters and pagination
  const [filters, setFilters] = useState(initialFilters);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState({ field: 'timestamp', direction: 'desc' as 'asc' | 'desc' });

  // Use the paginated query hook with our filters
  const {
    data,
    isLoading,
    error,
    pagination: { page, nextPage, prevPage, goToPage, changeLimit }
  } = usePaginatedQuery(useGetTransactionsQuery, {
    ...filters,
    limit: pageSize,
    page: 0,
    sortBy: sortBy.field,
    sortDirection: sortBy.direction
  });

  // Setup optimistic mutation for delete
  const [deleteTransaction] = useDeleteTransactionMutation();

  // Optimistic transaction deletion
  const [optimisticDeleteTransaction, deleteResult] = useOptimisticMutation<boolean, string>(
    deleteTransaction,
    // Optimistic update handler
    (transactionId) => {
      // We could implement optimistic UI updates here
      console.log(`Optimistically deleting transaction ${transactionId}`);
    },
    // Success handler
    (result, transactionId) => {
      console.log(`Successfully deleted transaction ${transactionId}`);
    },
    // Error handler
    (error, transactionId) => {
      console.error(`Failed to delete transaction ${transactionId}:`, error);
    }
  );

  // Handle delete action
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      optimisticDeleteTransaction(id);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      ...newFilters
    }));
    goToPage(0); // Reset to first page when filters change
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    setSortBy(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  if (isLoading) return <div className="p-4">Loading transactions...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {(error as any).message || 'Failed to load transactions'}</div>;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      {/* Filter controls */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Transactions</h2>
        
        <div className="flex items-center gap-4">
          <select
            className="form-select rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            value={pageSize}
            onChange={e => changeLimit(Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size} per page</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Transaction table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('timestamp')}
              >
                Date
                {sortBy.field === 'timestamp' && (
                  <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('type')}
              >
                Type
                {sortBy.field === 'type' && (
                  <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('base_asset')}
              >
                Asset
                {sortBy.field === 'base_asset' && (
                  <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('amount')}
              >
                Amount
                {sortBy.field === 'amount' && (
                  <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSortChange('location')}
              >
                Location
                {sortBy.field === 'location' && (
                  <span className="ml-1">{sortBy.direction === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data?.transactions?.map((transaction: Transaction) => (
              <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(transaction.timestamp * 1000).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {transaction.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {transaction.base_asset}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {transaction.amount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {transaction.location}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900 dark:hover:text-red-400 ml-4"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {data?.transactions?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-300">
                  No transactions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination controls */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={prevPage}
            disabled={page === 0}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={nextPage}
            disabled={!data?.has_next}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{data?.transactions?.length > 0 ? page * pageSize + 1 : 0}</span> to{' '}
              <span className="font-medium">{page * pageSize + (data?.transactions?.length || 0)}</span> of{' '}
              <span className="font-medium">{data?.total || 0}</span> results
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={prevPage}
                disabled={page === 0}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <span className="sr-only">Previous</span>
                &larr;
              </button>
              
              <button
                onClick={nextPage}
                disabled={!data?.has_next}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50"
              >
                <span className="sr-only">Next</span>
                &rarr;
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsList;
