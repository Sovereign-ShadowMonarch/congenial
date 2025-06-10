import React from 'react';
import Link from 'next/link';
import { 
  PlusCircleIcon, 
  ArrowPathIcon, 
  WalletIcon, 
  ChartBarSquareIcon,
  ArrowRightCircleIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface QuickActionsProps {
  className?: string;
  onSync?: () => void;
  onAddTransaction?: () => void;
  onConnectExchange?: () => void;
  onImportWallet?: () => void;
  onGenerateReport?: () => void;
  isSyncing?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  className,
  onSync,
  onAddTransaction,
  onConnectExchange,
  onImportWallet,
  onGenerateReport,
  isSyncing = false
}) => {
  const actions = [
    {
      name: 'Add Transaction',
      icon: <PlusCircleIcon className="h-6 w-6" />,
      description: 'Record a new transaction',
      onClick: onAddTransaction,
      link: onAddTransaction ? undefined : '/transactions/new',
      color: 'bg-blue-500 dark:bg-blue-600'
    },
    {
      name: 'Connect Exchange',
      icon: <CurrencyDollarIcon className="h-6 w-6" />,
      description: 'Add an exchange API connection',
      onClick: onConnectExchange,
      link: onConnectExchange ? undefined : '/settings/exchanges',
      color: 'bg-purple-500 dark:bg-purple-600'
    },
    {
      name: 'Import Wallet',
      icon: <WalletIcon className="h-6 w-6" />,
      description: 'Add a blockchain wallet address',
      onClick: onImportWallet,
      link: onImportWallet ? undefined : '/settings/wallets',
      color: 'bg-green-500 dark:bg-green-600'
    },
    {
      name: 'Generate Report',
      icon: <ChartBarSquareIcon className="h-6 w-6" />,
      description: 'Create tax or performance reports',
      onClick: onGenerateReport,
      link: onGenerateReport ? undefined : '/reports',
      color: 'bg-amber-500 dark:bg-amber-600'
    },
    {
      name: 'Sync All Data',
      icon: <ArrowPathIcon className={`h-6 w-6 ${isSyncing ? 'animate-spin' : ''}`} />,
      description: isSyncing ? 'Sync in progress...' : 'Update all data sources',
      onClick: onSync,
      disabled: isSyncing,
      color: 'bg-indigo-500 dark:bg-indigo-600'
    }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg ${className}`}>
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Quick Actions</h3>
      </div>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {actions.map((action) => {
          if (action.onClick || action.disabled) {
            // Button variant
            return (
              <button
                key={action.name}
                onClick={action.onClick}
                disabled={action.disabled}
                type="button"
                className={`w-full flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400 ${action.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md ${action.color} text-white`}>
                  {action.icon}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {action.name}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
                {!action.disabled && (
                  <div className="ml-4">
                    <ArrowRightCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </button>
            );
          } else {
            // Link variant
            return (
              <Link
                key={action.name}
                href={action.link as string}
                className="w-full flex items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-400 cursor-pointer"
              >
                <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-md ${action.color} text-white`}>
                  {action.icon}
                </div>
                <div className="ml-4 flex-1">
                  <h4 className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {action.name}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {action.description}
                  </p>
                </div>
                <div className="ml-4">
                  <ArrowRightCircleIcon className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>
              </Link>
            );
          }
        })}
      </div>
    </div>
  );
};

export default QuickActions;
