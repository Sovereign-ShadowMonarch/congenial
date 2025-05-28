import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { transactionsApi } from '@/api/transactions';
import { 
  CalendarIcon, 
  FunnelIcon, 
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

// Define transaction types
type Trade = {
  trade_id: string;
  timestamp: number;
  location: string;
  base_asset: string;
  quote_asset: string;
  trade_type: 'buy' | 'sell';
  amount: string;
  rate: string;
  fee?: string;
  fee_currency?: string;
  link?: string;
  notes?: string;
};

type AssetMovement = {
  identifier: string;
  timestamp: number;
  location: string;
  asset: string;
  amount: string;
  category: string;
  fee?: string;
  fee_asset?: string;
  transaction_id?: string;
  address?: string;
  link?: string;
};

type LedgerAction = {
  identifier: number;
  timestamp: number;
  location: string;
  amount: string;
  action_type: string;
  asset: string;
  rate?: string;
  rate_asset?: string;
  notes?: string;
  link?: string;
};

// Type guard functions
const isTrade = (transaction: any): transaction is Trade => {
  return 'trade_id' in transaction && 'trade_type' in transaction;
};

const isAssetMovement = (transaction: any): transaction is AssetMovement => {
  return 'identifier' in transaction && 'category' in transaction;
};

const isLedgerAction = (transaction: any): transaction is LedgerAction => {
  return 'identifier' in transaction && 'action_type' in transaction;
};

// Transaction type options
const tabs = [
  { id: 'trades', name: 'Trades' },
  { id: 'movements', name: 'Movements' },
  { id: 'ledger', name: 'Ledger Actions' }
];

const TransactionsPage: React.FC = () => {
  const router = useRouter();
  const { tab } = router.query;
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });
  const [page, setPage] = useState(1);
  const limit = 20;

  // Make sure tab is valid, default to 'trades'
  const currentTab = tabs.find(t => t.id === tab) ? tab as string : 'trades';

  // Change tab handler
  const handleTabChange = (tabId: string) => {
    router.push(`/transactions/${tabId}`);
  };

  // Format date for API calls
  const formatDateForApi = (date: Date): number => {
    return Math.floor(date.getTime() / 1000);
  };

  // Fetch transactions based on current tab
  const {
    data: transactions,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['transactions', currentTab, dateRange, page],
    queryFn: async () => {
      const params = {
        from_timestamp: formatDateForApi(dateRange.from),
        to_timestamp: formatDateForApi(dateRange.to),
        limit,
        offset: (page - 1) * limit,
      };

      switch (currentTab) {
        case 'trades':
          return transactionsApi.getTrades(params);
        case 'movements':
          return transactionsApi.getAssetMovements(params);
        case 'ledger':
          return transactionsApi.getLedgerActions(params);
        default:
          return transactionsApi.getTrades(params);
      }
    },
    enabled: !!currentTab,
    staleTime: 60 * 1000, // 1 minute
  });

  // Handle refresh
  const handleRefresh = () => {
    refetch();
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // Render trades table
  const renderTradesTable = () => {
    const entries = (transactions?.entries || []) as Trade[];

    return (
      <table className="table w-full">
        <thead>
          <tr>
            <th>Time</th>
            <th>Type</th>
            <th>Pair</th>
            <th>Amount</th>
            <th>Rate</th>
            <th>Fee</th>
            <th>Location</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-10">No trades found for the selected period</td>
            </tr>
          ) : (
            entries.map((trade) => (
              <tr key={trade.trade_id} className="hover">
                <td>{new Date(trade.timestamp * 1000).toLocaleString()}</td>
                <td>
                  <div className={`badge ${trade.trade_type === 'buy' ? 'badge-success' : 'badge-error'}`}>
                    {trade.trade_type.toUpperCase()}
                  </div>
                </td>
                <td>{trade.base_asset}/{trade.quote_asset}</td>
                <td>{parseFloat(trade.amount).toFixed(8)}</td>
                <td>{trade.rate ? parseFloat(trade.rate).toFixed(8) : '-'}</td>
                <td>{trade.fee ? `${parseFloat(trade.fee).toFixed(8)} ${trade.fee_currency || ''}` : '-'}</td>
                <td>{trade.location}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  };

  // Render movements table
  const renderMovementsTable = () => {
    const entries = (transactions?.entries || []) as AssetMovement[];

    return (
      <table className="table w-full">
        <thead>
          <tr>
            <th>Time</th>
            <th>Category</th>
            <th>Asset</th>
            <th>Amount</th>
            <th>Fee</th>
            <th>Location</th>
            <th>Transaction ID</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-10">No movements found for the selected period</td>
            </tr>
          ) : (
            entries.map((movement) => (
              <tr key={movement.identifier} className="hover">
                <td>{new Date(movement.timestamp * 1000).toLocaleString()}</td>
                <td>
                  <div className={`badge ${movement.category === 'deposit' ? 'badge-success' : 'badge-warning'}`}>
                    {movement.category.toUpperCase()}
                  </div>
                </td>
                <td>{movement.asset}</td>
                <td>{parseFloat(movement.amount).toFixed(8)}</td>
                <td>{movement.fee ? `${parseFloat(movement.fee).toFixed(8)} ${movement.fee_asset || ''}` : '-'}</td>
                <td>{movement.location}</td>
                <td>
                  {movement.transaction_id ? (
                    <div className="truncate max-w-xs" title={movement.transaction_id}>
                      {movement.transaction_id.substring(0, 10)}...
                    </div>
                  ) : '-'}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  };

  // Render ledger actions table
  const renderLedgerTable = () => {
    const entries = (transactions?.entries || []) as LedgerAction[];

    return (
      <table className="table w-full">
        <thead>
          <tr>
            <th>Time</th>
            <th>Type</th>
            <th>Asset</th>
            <th>Amount</th>
            <th>Location</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-10">No ledger actions found for the selected period</td>
            </tr>
          ) : (
            entries.map((action) => (
              <tr key={action.identifier} className="hover">
                <td>{new Date(action.timestamp * 1000).toLocaleString()}</td>
                <td>
                  <div className="badge badge-info">
                    {action.action_type}
                  </div>
                </td>
                <td>{action.asset}</td>
                <td>{parseFloat(action.amount).toFixed(8)}</td>
                <td>{action.location}</td>
                <td>{action.notes || '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    );
  };

  // Render the appropriate table based on the current tab
  const renderTransactionsTable = () => {
    if (!transactions || !transactions.entries) {
      return null;
    }

    switch (currentTab) {
      case 'trades':
        return renderTradesTable();
      case 'movements':
        return renderMovementsTable();
      case 'ledger':
        return renderLedgerTable();
      default:
        return renderTradesTable();
    }
  };

  // Render pagination
  const renderPagination = () => {
    const totalEntries = transactions?.entries_total || 0;
    const totalPages = Math.ceil(totalEntries / limit);

    if (totalPages <= 1) {
      return null;
    }

    return (
      <div className="flex justify-center mt-4">
        <div className="join">
          <button
            className="join-item btn"
            disabled={page === 1}
            onClick={() => handlePageChange(page - 1)}
          >
            «
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              className={`join-item btn ${page === index + 1 ? 'btn-active' : ''}`}
              onClick={() => handlePageChange(index + 1)}
            >
              {index + 1}
            </button>
          ))}
          <button
            className="join-item btn"
            disabled={page === totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            »
          </button>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <Layout title="Transactions">
        <div className="py-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="card-title">Transaction History</h2>
                <div className="flex items-center space-x-2">
                  <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-sm">
                      <CalendarIcon className="h-5 w-5 mr-2" />
                      Date Range
                    </label>
                    <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li>
                        <a onClick={() => setDateRange({
                          from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                          to: new Date()
                        })}>Last 7 days</a>
                      </li>
                      <li>
                        <a onClick={() => setDateRange({
                          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                          to: new Date()
                        })}>Last 30 days</a>
                      </li>
                      <li>
                        <a onClick={() => setDateRange({
                          from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
                          to: new Date()
                        })}>Last 90 days</a>
                      </li>
                      <li>
                        <a onClick={() => setDateRange({
                          from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                          to: new Date()
                        })}>Last year</a>
                      </li>
                    </ul>
                  </div>
                  <button className="btn btn-sm" onClick={handleRefresh}>
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  {currentTab === 'ledger' && (
                    <button className="btn btn-sm btn-primary">
                      Add Ledger Action
                    </button>
                  )}
                </div>
              </div>

              <div className="tabs mb-6">
                {tabs.map((tabItem) => (
                  <a
                    key={tabItem.id}
                    className={`tab tab-bordered ${currentTab === tabItem.id ? 'tab-active' : ''}`}
                    onClick={() => handleTabChange(tabItem.id)}
                  >
                    {tabItem.name}
                  </a>
                ))}
              </div>

              <div className="alert mb-4">
                <span>
                  Showing transactions from{' '}
                  <strong>{dateRange.from.toLocaleDateString()}</strong> to{' '}
                  <strong>{dateRange.to.toLocaleDateString()}</strong>
                </span>
              </div>

              <div className="overflow-x-auto">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <span className="loading loading-spinner loading-lg"></span>
                  </div>
                ) : (
                  renderTransactionsTable()
                )}
              </div>

              {renderPagination()}
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default TransactionsPage;
