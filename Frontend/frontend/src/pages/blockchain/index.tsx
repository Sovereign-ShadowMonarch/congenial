import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { blockchainApi } from '@/api/blockchain';
import { 
  PlusIcon, 
  XMarkIcon, 
  ArrowPathIcon, 
  ExclamationCircleIcon,
  TagIcon
} from '@heroicons/react/24/outline';

// Form schema for adding blockchain accounts
const addAccountSchema = z.object({
  blockchain: z.string().min(1, 'Blockchain is required'),
  address: z.string().min(1, 'Address is required'),
  label: z.string().optional(),
});

type AddAccountFormData = z.infer<typeof addAccountSchema>;

// Form schema for adding bitcoin xpub
const addXpubSchema = z.object({
  xpub: z.string().min(1, 'Xpub is required'),
  derivation_path: z.string().optional(),
  label: z.string().optional(),
});

type AddXpubFormData = z.infer<typeof addXpubSchema>;

// List of supported blockchains
const supportedBlockchains = [
  { id: 'ETH', name: 'Ethereum', icon: '⟠' },
  { id: 'BTC', name: 'Bitcoin', icon: '₿' },
  { id: 'SOL', name: 'Solana', icon: 'S' },
  { id: 'DOT', name: 'Polkadot', icon: '◇' },
  { id: 'ADA', name: 'Cardano', icon: '₳' },
  { id: 'MATIC', name: 'Polygon', icon: 'P' },
];

const BlockchainPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedChain, setSelectedChain] = useState('ETH');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isXpubModalOpen, setIsXpubModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // React Hook Form setup for accounts
  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    reset: resetAccountForm,
    formState: { errors: accountErrors, isSubmitting: isSubmittingAccount },
  } = useForm<AddAccountFormData>({
    resolver: zodResolver(addAccountSchema),
    defaultValues: {
      blockchain: selectedChain,
      address: '',
      label: '',
    },
  });

  // React Hook Form setup for xpub
  const {
    register: registerXpub,
    handleSubmit: handleSubmitXpub,
    reset: resetXpubForm,
    formState: { errors: xpubErrors, isSubmitting: isSubmittingXpub },
  } = useForm<AddXpubFormData>({
    resolver: zodResolver(addXpubSchema),
    defaultValues: {
      xpub: '',
      derivation_path: "m/44'/0'/0'",
      label: '',
    },
  });

  // Fetch blockchain accounts
  const { 
    data: accounts, 
    isLoading: isLoadingAccounts,
    refetch: refetchAccounts
  } = useQuery({
    queryKey: ['blockchainAccounts', selectedChain],
    queryFn: () => blockchainApi.getBlockchainAccounts(selectedChain),
    staleTime: 60 * 1000, // 1 minute
  });

  // Add blockchain account mutation
  const addAccountMutation = useMutation({
    mutationFn: (data: AddAccountFormData) => 
      blockchainApi.addBlockchainAccounts(data.blockchain, [
        { address: data.address, label: data.label }
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockchainAccounts', selectedChain] });
      setIsAccountModalOpen(false);
      resetAccountForm();
      setSuccessMessage('Blockchain account added successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to add blockchain account');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Remove blockchain account mutation
  const removeAccountMutation = useMutation({
    mutationFn: ({ blockchain, address }: { blockchain: string; address: string }) => 
      blockchainApi.removeBlockchainAccounts(blockchain, [address], false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockchainAccounts', selectedChain] });
      setSuccessMessage('Blockchain account removed successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to remove blockchain account');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Add xpub mutation
  const addXpubMutation = useMutation({
    mutationFn: (data: AddXpubFormData) => 
      blockchainApi.addBitcoinXpub({
        xpub: data.xpub,
        derivation_path: data.derivation_path,
        label: data.label,
      }, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockchainAccounts', 'BTC'] });
      setIsXpubModalOpen(false);
      resetXpubForm();
      setSuccessMessage('Bitcoin xpub added successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to add Bitcoin xpub');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Remove xpub mutation
  const removeXpubMutation = useMutation({
    mutationFn: ({ xpub, derivation_path }: { xpub: string; derivation_path?: string }) => 
      blockchainApi.deleteBitcoinXpub([{ xpub, derivation_path }], false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockchainAccounts', 'BTC'] });
      setSuccessMessage('Bitcoin xpub removed successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to remove Bitcoin xpub');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Submit handler for adding blockchain account
  const onSubmitAccount = async (data: AddAccountFormData) => {
    setErrorMessage(null);
    try {
      await addAccountMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in mutation callbacks
    }
  };

  // Submit handler for adding xpub
  const onSubmitXpub = async (data: AddXpubFormData) => {
    setErrorMessage(null);
    try {
      await addXpubMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in mutation callbacks
    }
  };

  // Handle removing blockchain account
  const handleRemoveAccount = async (blockchain: string, address: string) => {
    if (confirm(`Are you sure you want to remove the address "${address}"?`)) {
      try {
        await removeAccountMutation.mutateAsync({ blockchain, address });
      } catch (error) {
        // Error is handled in mutation callbacks
      }
    }
  };

  // Handle removing xpub
  const handleRemoveXpub = async (xpub: string, derivation_path?: string) => {
    if (confirm(`Are you sure you want to remove this xpub?`)) {
      try {
        await removeXpubMutation.mutateAsync({ xpub, derivation_path });
      } catch (error) {
        // Error is handled in mutation callbacks
      }
    }
  };

  // Handle chain change
  const handleChainChange = (chain: string) => {
    setSelectedChain(chain);
  };

  // Render blockchain accounts
  const renderAccounts = () => {
    if (isLoadingAccounts) {
      return (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      );
    }

    // For Bitcoin, handle special case with xpubs
    if (selectedChain === 'BTC' && accounts) {
      const btcAccounts = Array.isArray(accounts) ? accounts : accounts.standalone || [];
      const xpubs = !Array.isArray(accounts) && accounts.xpubs ? accounts.xpubs : [];

      return (
        <div>
          {/* Standalone Bitcoin Addresses */}
          <h3 className="text-lg font-bold mt-4 mb-2">Bitcoin Addresses</h3>
          {btcAccounts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Address</th>
                    <th>Label</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {btcAccounts.map((account: any) => (
                    <tr key={account.address} className="hover">
                      <td>
                        <div className="font-mono text-xs truncate max-w-xs">
                          {account.address}
                        </div>
                      </td>
                      <td>{account.label || '-'}</td>
                      <td>
                        <button 
                          className="btn btn-error btn-sm"
                          onClick={() => handleRemoveAccount('BTC', account.address)}
                        >
                          <XMarkIcon className="h-5 w-5 mr-1" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert">
              <ExclamationCircleIcon className="h-6 w-6" />
              <span>No Bitcoin addresses added yet.</span>
            </div>
          )}

          {/* Bitcoin xPubs */}
          <div className="flex justify-between items-center mt-8 mb-2">
            <h3 className="text-lg font-bold">Bitcoin xPubs</h3>
            <button 
              className="btn btn-sm btn-primary"
              onClick={() => setIsXpubModalOpen(true)}
            >
              <PlusIcon className="h-5 w-5 mr-1" />
              Add xPub
            </button>
          </div>
          
          {xpubs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>xPub</th>
                    <th>Derivation Path</th>
                    <th>Label</th>
                    <th>Addresses</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {xpubs.map((xpub: any) => (
                    <tr key={xpub.xpub} className="hover">
                      <td>
                        <div className="font-mono text-xs truncate max-w-xs">
                          {xpub.xpub.substring(0, 15)}...{xpub.xpub.substring(xpub.xpub.length - 8)}
                        </div>
                      </td>
                      <td>{xpub.derivation_path || '-'}</td>
                      <td>{xpub.label || '-'}</td>
                      <td>{xpub.addresses ? xpub.addresses.length : 0} addresses</td>
                      <td>
                        <button 
                          className="btn btn-error btn-sm"
                          onClick={() => handleRemoveXpub(xpub.xpub, xpub.derivation_path)}
                        >
                          <XMarkIcon className="h-5 w-5 mr-1" />
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert">
              <ExclamationCircleIcon className="h-6 w-6" />
              <span>No Bitcoin xPubs added yet.</span>
            </div>
          )}
        </div>
      );
    }

    // For other blockchains, render accounts directly
    const chainAccounts = Array.isArray(accounts) ? accounts : [];
    
    if (chainAccounts.length === 0) {
      return (
        <div className="alert">
          <ExclamationCircleIcon className="h-6 w-6" />
          <span>No {supportedBlockchains.find(chain => chain.id === selectedChain)?.name} addresses added yet.</span>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Address</th>
              <th>Label</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {chainAccounts.map((account: any) => (
              <tr key={account.address} className="hover">
                <td>
                  <div className="font-mono text-xs truncate max-w-xs">
                    {account.address}
                  </div>
                </td>
                <td>{account.label || '-'}</td>
                <td>
                  <button 
                    className="btn btn-error btn-sm"
                    onClick={() => handleRemoveAccount(selectedChain, account.address)}
                  >
                    <XMarkIcon className="h-5 w-5 mr-1" />
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <Layout title="Blockchain">
        <div className="py-6">
          {/* Success and Error Messages */}
          {successMessage && (
            <div className="alert alert-success mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{successMessage}</span>
            </div>
          )}
          
          {errorMessage && (
            <div className="alert alert-error mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="card-title">Blockchain Accounts</h2>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-sm"
                    onClick={() => refetchAccounts()}
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setIsAccountModalOpen(true)}
                  >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Add Address
                  </button>
                </div>
              </div>

              {/* Blockchain Tabs */}
              <div className="tabs mb-6">
                {supportedBlockchains.map((chain) => (
                  <a
                    key={chain.id}
                    className={`tab tab-bordered ${selectedChain === chain.id ? 'tab-active' : ''}`}
                    onClick={() => handleChainChange(chain.id)}
                  >
                    <span className="mr-2">{chain.icon}</span>
                    {chain.name}
                  </a>
                ))}
              </div>

              {renderAccounts()}
            </div>
          </div>
        </div>

        {/* Add Account Modal */}
        <div className={`modal ${isAccountModalOpen ? 'modal-open' : ''}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Blockchain Address</h3>
            <p className="py-4">
              Enter a blockchain address to track. Make sure you enter the correct address 
              format for the selected blockchain.
            </p>
            
            <form onSubmit={handleSubmitAccount(onSubmitAccount)}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Blockchain</span>
                </label>
                <select 
                  className={`select select-bordered w-full ${accountErrors.blockchain ? 'select-error' : ''}`}
                  {...registerAccount('blockchain')}
                >
                  {supportedBlockchains.map((chain) => (
                    <option key={chain.id} value={chain.id}>
                      {chain.name}
                    </option>
                  ))}
                </select>
                {accountErrors.blockchain && (
                  <label className="label">
                    <span className="label-text-alt text-error">{accountErrors.blockchain.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Address</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${accountErrors.address ? 'input-error' : ''}`}
                  placeholder="Enter blockchain address"
                  {...registerAccount('address')}
                />
                {accountErrors.address && (
                  <label className="label">
                    <span className="label-text-alt text-error">{accountErrors.address.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Label (optional)</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-base-300 bg-base-200 text-base-content">
                    <TagIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    className="input input-bordered flex-1 rounded-l-none"
                    placeholder="e.g., 'Hardware Wallet', 'Exchange Withdrawal'"
                    {...registerAccount('label')}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setIsAccountModalOpen(false);
                    resetAccountForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isSubmittingAccount ? 'loading' : ''}`}
                  disabled={isSubmittingAccount}
                >
                  {isSubmittingAccount ? 'Adding...' : 'Add Address'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setIsAccountModalOpen(false)}></div>
        </div>

        {/* Add xPub Modal */}
        <div className={`modal ${isXpubModalOpen ? 'modal-open' : ''}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Bitcoin xPub</h3>
            <p className="py-4">
              Enter an extended public key (xPub, yPub, or zPub) to track multiple Bitcoin addresses 
              using a single key.
            </p>
            
            <form onSubmit={handleSubmitXpub(onSubmitXpub)}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Extended Public Key</span>
                </label>
                <textarea
                  className={`textarea textarea-bordered w-full h-24 ${xpubErrors.xpub ? 'textarea-error' : ''}`}
                  placeholder="Enter your xPub, yPub, or zPub"
                  {...registerXpub('xpub')}
                />
                {xpubErrors.xpub && (
                  <label className="label">
                    <span className="label-text-alt text-error">{xpubErrors.xpub.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Derivation Path</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g., m/44'/0'/0'"
                  {...registerXpub('derivation_path')}
                />
                <label className="label">
                  <span className="label-text-alt">Standard BIP44 path is m/44'/0'/0'</span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Label (optional)</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-base-300 bg-base-200 text-base-content">
                    <TagIcon className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    className="input input-bordered flex-1 rounded-l-none"
                    placeholder="e.g., 'Ledger Wallet', 'Trezor'"
                    {...registerXpub('label')}
                  />
                </div>
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setIsXpubModalOpen(false);
                    resetXpubForm();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isSubmittingXpub ? 'loading' : ''}`}
                  disabled={isSubmittingXpub}
                >
                  {isSubmittingXpub ? 'Adding...' : 'Add xPub'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setIsXpubModalOpen(false)}></div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default BlockchainPage;
