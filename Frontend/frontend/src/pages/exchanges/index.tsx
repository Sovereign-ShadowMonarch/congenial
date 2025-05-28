import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { exchangesApi } from '@/api/exchanges';
import { 
  PlusIcon, 
  XMarkIcon, 
  ArrowPathIcon, 
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

// Form schema for adding exchanges
const addExchangeSchema = z.object({
  name: z.string().min(1, 'Exchange name is required'),
  api_key: z.string().min(1, 'API key is required'),
  api_secret: z.string().min(1, 'API secret is required'),
  passphrase: z.string().optional(),
});

type AddExchangeFormData = z.infer<typeof addExchangeSchema>;

const ExchangesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddExchangeFormData>({
    resolver: zodResolver(addExchangeSchema),
    defaultValues: {
      name: '',
      api_key: '',
      api_secret: '',
      passphrase: '',
    },
  });

  // Fetch exchanges
  const { 
    data: exchanges, 
    isLoading: isLoadingExchanges,
    refetch: refetchExchanges
  } = useQuery({
    queryKey: ['exchanges'],
    queryFn: exchangesApi.getExchanges,
    staleTime: 60 * 1000, // 1 minute
  });

  // Add exchange mutation
  const addExchangeMutation = useMutation({
    mutationFn: exchangesApi.addExchange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      setIsModalOpen(false);
      reset();
      setSuccessMessage('Exchange added successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to add exchange');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Remove exchange mutation
  const removeExchangeMutation = useMutation({
    mutationFn: exchangesApi.removeExchange,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exchanges'] });
      setSuccessMessage('Exchange removed successfully');
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: any) => {
      setErrorMessage(error.message || 'Failed to remove exchange');
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Submit handler for adding exchange
  const onSubmit = async (data: AddExchangeFormData) => {
    setErrorMessage(null);
    try {
      await addExchangeMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in mutation callbacks
    }
  };

  // Handle removing exchange
  const handleRemoveExchange = async (name: string) => {
    if (confirm(`Are you sure you want to remove the exchange "${name}"?`)) {
      try {
        await removeExchangeMutation.mutateAsync(name);
      } catch (error) {
        // Error is handled in mutation callbacks
      }
    }
  };

  // Exchange logos mapping (simplified with just a few)
  const exchangeLogos: Record<string, string> = {
    binance: 'https://cryptologos.cc/logos/binance-coin-bnb-logo.png',
    coinbase: 'https://cryptologos.cc/logos/coinbase-coin-usdc-logo.png',
    kraken: 'https://cryptologos.cc/logos/kraken-krak-logo.png',
    ftx: 'https://cryptologos.cc/logos/ftx-token-ftt-logo.png',
    gemini: 'https://cryptologos.cc/logos/gemini-dollar-gusd-logo.png',
    kucoin: 'https://cryptologos.cc/logos/kucoin-token-kcs-logo.png',
  };

  return (
    <ProtectedRoute>
      <Layout title="Exchanges">
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
                <h2 className="card-title">Connected Exchanges</h2>
                <div className="flex gap-2">
                  <button 
                    className="btn btn-sm"
                    onClick={() => refetchExchanges()}
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <PlusIcon className="h-5 w-5 mr-1" />
                    Add Exchange
                  </button>
                </div>
              </div>

              {isLoadingExchanges ? (
                <div className="flex justify-center py-10">
                  <span className="loading loading-spinner loading-lg"></span>
                </div>
              ) : exchanges && exchanges.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Exchange</th>
                        <th>Status</th>
                        <th>API Key</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exchanges.map((exchange) => (
                        <tr key={exchange.name} className="hover">
                          <td>
                            <div className="flex items-center space-x-3">
                              {exchangeLogos[exchange.name.toLowerCase()] ? (
                                <div className="avatar">
                                  <div className="mask mask-squircle w-10 h-10">
                                    <img src={exchangeLogos[exchange.name.toLowerCase()]} alt={exchange.name} />
                                  </div>
                                </div>
                              ) : (
                                <div className="avatar placeholder">
                                  <div className="bg-primary text-primary-content mask mask-squircle w-10 h-10">
                                    <span>{exchange.name.substring(0, 2).toUpperCase()}</span>
                                  </div>
                                </div>
                              )}
                              <div>
                                <div className="font-bold">{exchange.name}</div>
                                <div className="text-sm opacity-50">{exchange.location}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            {exchange.connected ? (
                              <div className="badge badge-success">Connected</div>
                            ) : (
                              <div className="badge badge-warning">Disconnected</div>
                            )}
                          </td>
                          <td>
                            <div className="flex items-center">
                              <span className="font-mono bg-base-200 px-2 py-1 rounded text-xs">
                                {showSecrets ? 'API key visible (hover)' : '*******************'}
                              </span>
                              <button 
                                className="btn btn-ghost btn-xs ml-2" 
                                onClick={() => setShowSecrets(!showSecrets)}
                              >
                                {showSecrets ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                              </button>
                            </div>
                          </td>
                          <td>
                            <button 
                              className="btn btn-error btn-sm"
                              onClick={() => handleRemoveExchange(exchange.name)}
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
                  <span>No exchanges connected yet. Add an exchange to track your balances.</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Exchange Modal */}
        <div className={`modal ${isModalOpen ? 'modal-open' : ''}`}>
          <div className="modal-box">
            <h3 className="font-bold text-lg">Add Exchange</h3>
            <p className="py-4">
              Enter your exchange API credentials. Make sure to set the appropriate permissions 
              (read-only is recommended for security).
            </p>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Exchange</span>
                </label>
                <select 
                  className={`select select-bordered w-full ${errors.name ? 'select-error' : ''}`}
                  {...register('name')}
                >
                  <option value="">Select an exchange</option>
                  <option value="binance">Binance</option>
                  <option value="coinbase">Coinbase</option>
                  <option value="kraken">Kraken</option>
                  <option value="kucoin">KuCoin</option>
                  <option value="ftx">FTX</option>
                  <option value="gemini">Gemini</option>
                </select>
                {errors.name && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.name.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">API Key</span>
                </label>
                <input
                  type="text"
                  className={`input input-bordered w-full ${errors.api_key ? 'input-error' : ''}`}
                  placeholder="Enter your API key"
                  {...register('api_key')}
                />
                {errors.api_key && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.api_key.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">API Secret</span>
                </label>
                <input
                  type="password"
                  className={`input input-bordered w-full ${errors.api_secret ? 'input-error' : ''}`}
                  placeholder="Enter your API secret"
                  {...register('api_secret')}
                />
                {errors.api_secret && (
                  <label className="label">
                    <span className="label-text-alt text-error">{errors.api_secret.message}</span>
                  </label>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Passphrase (if required)</span>
                </label>
                <input
                  type="password"
                  className="input input-bordered w-full"
                  placeholder="Enter passphrase (optional)"
                  {...register('passphrase')}
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
                  {isSubmitting ? 'Adding...' : 'Add Exchange'}
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

export default ExchangesPage;
