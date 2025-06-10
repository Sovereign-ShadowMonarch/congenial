import React from 'react';
// Import Next.js Link component
import Link from 'next/link';
import { useGetTransactionsQuery, Transaction } from '../../store/apis/transactionsApi';

// Use a simplified transaction interface that extracts what we need from the API's Transaction type
interface DisplayTransaction {
  id: string;
  timestamp: number;
  type: string;
  asset: string;
  amount: string;
  location?: string;
  notes?: string;
}

interface RecentTransactionsProps {
  limit?: number;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  limit = 5
}) => {
  // Fetch recent transactions with limit
  const { 
    data, 
    isLoading, 
    error 
  } = useGetTransactionsQuery({
    limit,
    offset: 0,
    sortBy: 'timestamp',
    sortDirection: 'desc'
  });
  
  // Transform API data to display format
  const transformTransactions = (transactions: Transaction[]): DisplayTransaction[] => {
    return transactions.map(tx => ({
      id: tx.id,
      timestamp: tx.timestamp,
      type: tx.type,
      asset: tx.to_asset || tx.from_asset,
      amount: tx.type === 'buy' || tx.type === 'income' || tx.type === 'staking' || tx.type === 'mining' || tx.type === 'airdrop' ? 
        tx.to_amount : tx.from_amount,
      location: tx.location,
      notes: tx.notes
    }));
  };
  
  // Format timestamp to readable date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Format amounts with asset symbol
  const formatAmount = (amount: string, asset: string): string => {
    const numAmount = parseFloat(amount);
    const formatted = Math.abs(numAmount).toLocaleString('en-US', {
      maximumFractionDigits: 8,
      minimumFractionDigits: numAmount % 1 === 0 ? 0 : 2
    });
    return `${numAmount >= 0 ? '+' : '-'} ${formatted} ${asset}`;
  };
  
  // Get transaction type badge color and text
  const getTypeBadge = (type: string) => {
    const typeStyles: Record<string, { bg: string, text: string }> = {
      buy: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
      sell: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300' },
      deposit: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
      withdrawal: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-800 dark:text-orange-300' },
      staking: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300' },
      reward: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300' },
      transfer: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300' },
    };
    
    const style = typeStyles[type.toLowerCase()] || typeStyles.transfer;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
        {type}
      </span>
    );
  };
  
  // Will use Link component for navigation instead of navigate function
  
  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(limit)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
              <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          <p className="font-medium">Failed to load recent transactions</p>
          <p className="text-sm mt-1">
            {(error as any)?.data?.message || (error as any)?.message || 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }
  
  // No data state
  if (!data || !data.transactions || data.transactions.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 dark:text-gray-400">No recent transactions found.</p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
          Add transactions to see your recent activity
        </p>
      </div>
    );
  }
  
  return (
    <div className="overflow-hidden">
      <div className="flow-root">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {data?.transactions && transformTransactions(data.transactions).map((transaction) => (
            <li key={transaction.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition cursor-pointer">
              <Link href={`/transactions/${transaction.id}`}>
                <a className="block">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      {getTypeBadge(transaction.type)}
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatAmount(transaction.amount, transaction.asset)}
                        </p>
                        {transaction.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.location}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(transaction.timestamp)}
                    </span>
                  </div>
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-center pt-5">
        <Link 
          href="/transactions"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          View all transactions
        </Link>
      </div>
    </div>
  );
};

export default RecentTransactions;
