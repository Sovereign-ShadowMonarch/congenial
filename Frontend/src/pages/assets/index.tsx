import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { assetsApi } from '@/api/assets';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ArrowPathIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

// Form schema for adding Ethereum tokens
const addTokenSchema = z.object({
  address: z.string().min(1, 'Token address is required'),
  name: z.string().min(1, 'Token name is required'),
  symbol: z.string().min(1, 'Token symbol is required'),
  decimals: z.number().min(0).max(18),
  coingecko: z.string().optional(),
  cryptocompare: z.string().optional(),
  protocol: z.string().optional(),
});

type AddTokenFormData = z.infer<typeof addTokenSchema>;

const AssetsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showIgnoredAssets, setShowIgnoredAssets] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddTokenFormData>({
    resolver: zodResolver(addTokenSchema),
    defaultValues: {
      address: '',
      name: '',
      symbol: '',
      decimals: 18,
      coingecko: '',
      cryptocompare: '',
      protocol: '',
    },
  });

  // Fetch all assets
  const { 
    data: allAssets, 
    isLoading: isLoadingAssets,
    refetch: refetchAssets
  } = useQuery({
    queryKey: ['allAssets'],
    queryFn: assetsApi.getAllAssets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch ignored assets
  const { 
    data: ignoredAssets, 
    isLoading: isLoadingIgnored,
    refetch: refetchIgnored
  } = useQuery({
    queryKey: ['ignoredAssets'],
    queryFn: assetsApi.getIgnoredAssets,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add Ethereum token mutation
  const addTokenMutation = useMutation({
    mutationFn: assetsApi.addEthereumToken,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAssets'] });
      setIsModalOpen(false);
      reset();
      setSuccessMessage('Ethereum token added successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to add Ethereum token');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Add to ignored assets mutation
  const addIgnoreMutation = useMutation({
    mutationFn: (symbol: string) => assetsApi.addIgnoredAssets([symbol]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ignoredAssets'] });
      setSuccessMessage('Asset added to ignored list');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to add asset to ignored list');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Remove from ignored assets mutation
  const removeIgnoreMutation = useMutation({
    mutationFn: (symbol: string) => assetsApi.removeIgnoredAssets([symbol]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ignoredAssets'] });
      setSuccessMessage('Asset removed from ignored list');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to remove asset from ignored list');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Submit handler for adding Ethereum token
  const onSubmit = async (data: AddTokenFormData) => {
    setErrorMessage(null);
    try {
      await addTokenMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in mutation callbacks
    }
  };

  // Handle toggling ignore status for an asset
  const handleToggleIgnore = async (symbol: string) => {
    try {
      const ignoredList = ignoredAssets?.result || [];
      if (ignoredList.includes(symbol)) {
        await removeIgnoreMutation.mutateAsync(symbol);
      } else {
        await addIgnoreMutation.mutateAsync(symbol);
      }
    } catch (error) {
      // Error is handled in mutation callbacks
    }
  };

  // Filter and sort assets based on search term and ignored status
  const filteredAssets = React.useMemo(() => {
    if (!allAssets) return [];

    const assetsArray = Object.entries(allAssets).map(([symbol, assetData]: [string, any]) => ({
      symbol,
      ...assetData,
    }));

    return assetsArray.filter(asset => {
      const matchesSearch = 
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || 
        asset.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const ignoredList = ignoredAssets?.result || [];
      const isIgnored = ignoredList.includes(asset.symbol);

      return matchesSearch && (showIgnoredAssets || !isIgnored);
    }).sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [allAssets, searchTerm, ignoredAssets, showIgnoredAssets]);

  return (
    <ProtectedRoute>
      <Layout title="Assets">
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
                <h2 className="card-title">Assets</h2>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-sm"
                    onClick={() => {
                      refetchAssets();
                      refetchIgnored();
                    }}
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Add Token
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <div className="relative w-full max-w-xs">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-base-content/50" />
                  </div>
                  <input 
                    type="text" 
                    className="input input-bordered w-full pl-10"
                    placeholder="Search assets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer gap-2">
                    <span className="label-text">Show ignored assets</span>
                    <input 
                      type="checkbox" 
                      className="toggle toggle-primary" 
                      checked={showIgnoredAssets}
                      onChange={() => setShowIgnoredAssets(!showIgnoredAssets)}
                    />
                  </label>
                </div>
              </div>

              {isLoadingAssets || isLoadingIgnored ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Symbol</th>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssets.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-10">
                            {searchTerm ? 'No assets matching your search' : 'No assets found'}
                          </td>
                        </tr>
                      ) : (
                        filteredAssets.map((asset) => {
                          const ignoredList = ignoredAssets?.result || [];
                          const isIgnored = ignoredList.includes(asset.symbol);
                          
                          return (
                            <tr key={asset.symbol} className={`hover ${isIgnored ? 'opacity-60' : ''}`}>
                              <td className="font-bold">{asset.symbol}</td>
                              <td>{asset.name}</td>
                              <td>
                                <div className="badge badge-outline">
                                  {asset.asset_type || 'Standard'}
                                </div>
                              </td>
                              <td>
                                {isIgnored ? (
                                  <div className="badge badge-warning">Ignored</div>
                                ) : (
                                  <div className="badge badge-success">Tracked</div>
                                )}
                              </td>
                              <td>
                                <button 
                                  className={`btn btn-sm ${isIgnored ? 'btn-success' : 'btn-warning'}`}
                                  onClick={() => handleToggleIgnore(asset.symbol)}
                                >
                                  {isIgnored ? (
                                    <>
                                      <CheckCircleIcon className="h-5 w-5 mr-1" />
                                      Unignore
                                    </>
                                  ) : (
                                    <>
                                      <XCircleIcon className="h-5 w-5 mr-1" />
                                      Ignore
                                    </>
                                  )}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Token Modal */}
        <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Custom Ethereum Token</h3>
            <p className="py-4">
              Enter the details of the ERC-20 token you want to track.
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Token Address</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.address ? 'input-error' : ''}`}
                  placeholder="0x..."
                  {...register('address')}
                />
                {errors.address && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.address.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Token Name</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                  placeholder="e.g., Uniswap"
                  {...register('name')}
                />
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Token Symbol</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.symbol ? 'input-error' : ''}`}
                  placeholder="e.g., UNI"
                  {...register('symbol')}
                />
                {errors.symbol && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.symbol.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Decimals</span>
                </label>
                <input
                  type="number"
                  className={`input input-bordered w-full ${errors.decimals ? 'input-error' : ''}`}
                  placeholder="18"
                  {...register('decimals', { valueAsNumber: true })}
                />
                {errors.decimals && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.decimals.message}</span>
                  </label>
                )}
              </div>

              <div className="divider">Optional Fields</div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">CoinGecko ID</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g., uniswap"
                  {...register('coingecko')}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">CryptoCompare ID</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g., UNI"
                  {...register('cryptocompare')}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Protocol</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="e.g., uniswap"
                  {...register('protocol')}
                />
              </div>

              <div className="modal-action">
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setIsModalOpen(false);
                    reset();
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Token'}
                </button>
              </div>
            </form>
          </div>
          <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}></div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default AssetsPage;
