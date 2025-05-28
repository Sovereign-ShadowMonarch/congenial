import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { defiApi } from '@/api/defi';
import { 
  ArrowPathIcon, 
  ExclamationCircleIcon,
  ArrowTrendingUpIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

// Protocol tabs
const protocols = [
  { id: 'makerdao', name: 'MakerDAO', icon: 'M' },
  { id: 'aave', name: 'Aave', icon: 'A' },
  { id: 'compound', name: 'Compound', icon: 'C' },
  { id: 'uniswap', name: 'Uniswap', icon: 'U' },
  { id: 'yearn', name: 'Yearn', icon: 'Y' },
  { id: 'balancer', name: 'Balancer', icon: 'B' },
];

const DefiPage: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState('makerdao');
  
  // Handle protocol change
  const handleProtocolChange = (protocol: string) => {
    setSelectedProtocol(protocol);
  };

  // MakerDAO specific queries
  const { 
    data: makerDSRBalance, 
    isLoading: isLoadingMakerDSR,
    refetch: refetchMakerDSR
  } = useQuery({
    queryKey: ['makerDAO', 'dsrBalance'],
    queryFn: () => defiApi.makerDAO.getDSRBalance(),
    enabled: selectedProtocol === 'makerdao',
    staleTime: 60 * 1000, // 1 minute
  });

  const { 
    data: makerVaults, 
    isLoading: isLoadingMakerVaults,
    refetch: refetchMakerVaults
  } = useQuery({
    queryKey: ['makerDAO', 'vaults'],
    queryFn: () => defiApi.makerDAO.getVaults(),
    enabled: selectedProtocol === 'makerdao',
    staleTime: 60 * 1000, // 1 minute
  });

  // Aave specific queries
  const { 
    data: aaveBalances, 
    isLoading: isLoadingAave,
    refetch: refetchAave
  } = useQuery({
    queryKey: ['aave', 'balances'],
    queryFn: () => defiApi.aave.getBalances(),
    enabled: selectedProtocol === 'aave',
    staleTime: 60 * 1000, // 1 minute
  });

  // Compound specific queries
  const { 
    data: compoundBalances, 
    isLoading: isLoadingCompound,
    refetch: refetchCompound
  } = useQuery({
    queryKey: ['compound', 'balances'],
    queryFn: () => defiApi.compound.getBalances(),
    enabled: selectedProtocol === 'compound',
    staleTime: 60 * 1000, // 1 minute
  });

  // Uniswap specific queries
  const { 
    data: uniswapBalances, 
    isLoading: isLoadingUniswap,
    refetch: refetchUniswap
  } = useQuery({
    queryKey: ['uniswap', 'balances'],
    queryFn: () => defiApi.uniswap.getBalances(),
    enabled: selectedProtocol === 'uniswap',
    staleTime: 60 * 1000, // 1 minute
  });

  // Yearn specific queries
  const { 
    data: yearnBalances, 
    isLoading: isLoadingYearn,
    refetch: refetchYearn
  } = useQuery({
    queryKey: ['yearn', 'balances'],
    queryFn: () => defiApi.yearn.getVaultBalances(),
    enabled: selectedProtocol === 'yearn',
    staleTime: 60 * 1000, // 1 minute
  });

  // Balancer specific queries
  const { 
    data: balancerBalances, 
    isLoading: isLoadingBalancer,
    refetch: refetchBalancer
  } = useQuery({
    queryKey: ['balancer', 'balances'],
    queryFn: () => defiApi.balancer.getBalances(),
    enabled: selectedProtocol === 'balancer',
    staleTime: 60 * 1000, // 1 minute
  });

  // Handle refresh for current protocol
  const handleRefresh = () => {
    switch (selectedProtocol) {
      case 'makerdao':
        refetchMakerDSR();
        refetchMakerVaults();
        break;
      case 'aave':
        refetchAave();
        break;
      case 'compound':
        refetchCompound();
        break;
      case 'uniswap':
        refetchUniswap();
        break;
      case 'yearn':
        refetchYearn();
        break;
      case 'balancer':
        refetchBalancer();
        break;
      default:
        break;
    }
  };

  // Check if current protocol is loading
  const isLoading = () => {
    switch (selectedProtocol) {
      case 'makerdao':
        return isLoadingMakerDSR || isLoadingMakerVaults;
      case 'aave':
        return isLoadingAave;
      case 'compound':
        return isLoadingCompound;
      case 'uniswap':
        return isLoadingUniswap;
      case 'yearn':
        return isLoadingYearn;
      case 'balancer':
        return isLoadingBalancer;
      default:
        return false;
    }
  };

  // Format currency value
  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(typeof value === 'string' ? parseFloat(value) : value);
  };

  // Render MakerDAO content
  const renderMakerDAO = () => {
    if (!makerDSRBalance || !makerVaults) {
      return (
        <div className="alert">
          <ExclamationCircleIcon className="h-6 w-6" />
          <span>No MakerDAO data found. Connect an Ethereum wallet to view your MakerDAO positions.</span>
        </div>
      );
    }

    return (
      <div>
        {/* DSR (Dai Savings Rate) */}
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h3 className="card-title">Dai Savings Rate (DSR)</h3>
            <div className="stat">
              <div className="stat-title">Current DSR</div>
              <div className="stat-value">{(parseFloat(makerDSRBalance.current_dsr) * 100).toFixed(2)}%</div>
              <div className="stat-desc">Annual yield on DAI deposits</div>
            </div>
            
            <div className="divider">Your Deposits</div>
            
            {Object.keys(makerDSRBalance.balances).length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Address</th>
                      <th>Amount</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(makerDSRBalance.balances).map(([address, balance]: [string, any]) => (
                      <tr key={address} className="hover">
                        <td>
                          <div className="font-mono text-xs truncate max-w-xs">
                            {address}
                          </div>
                        </td>
                        <td>{parseFloat(balance.amount).toFixed(2)} DAI</td>
                        <td>{formatCurrency(balance.usd_value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert">
                <InformationCircleIcon className="h-6 w-6" />
                <span>You don't have any DAI in the DSR. Deposit DAI to earn yield.</span>
              </div>
            )}
          </div>
        </div>

        {/* Vaults */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h3 className="card-title">MakerDAO Vaults</h3>
            
            {makerVaults.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Vault ID</th>
                      <th>Collateral</th>
                      <th>Debt</th>
                      <th>Ratio</th>
                      <th>Liquidation Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {makerVaults.map((vault: any) => (
                      <tr key={vault.identifier} className="hover">
                        <td>{vault.identifier}</td>
                        <td>
                          <div className="flex flex-col">
                            <span>{parseFloat(vault.collateral_amount).toFixed(4)} {vault.collateral_asset}</span>
                            <span className="text-xs opacity-70">{formatCurrency(vault.collateral_usd_value)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col">
                            <span>{parseFloat(vault.debt_value).toFixed(2)} DAI</span>
                            <span className="text-xs opacity-70">{formatCurrency(vault.debt_usd_value)}</span>
                          </div>
                        </td>
                        <td>
                          <div className={`badge ${
                            parseFloat(vault.collateralization_ratio || '0') > parseFloat(vault.liquidation_ratio) * 1.5
                              ? 'badge-success'
                              : parseFloat(vault.collateralization_ratio || '0') > parseFloat(vault.liquidation_ratio) * 1.2
                              ? 'badge-warning'
                              : 'badge-error'
                          }`}>
                            {vault.collateralization_ratio 
                              ? `${parseFloat(vault.collateralization_ratio).toFixed(2)}%` 
                              : 'N/A'}
                          </div>
                        </td>
                        <td>
                          {vault.liquidation_price 
                            ? `$${parseFloat(vault.liquidation_price).toFixed(2)}` 
                            : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="alert">
                <InformationCircleIcon className="h-6 w-6" />
                <span>You don't have any active MakerDAO vaults.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Aave content
  const renderAave = () => {
    if (!aaveBalances || aaveBalances.length === 0) {
      return (
        <div className="alert">
          <ExclamationCircleIcon className="h-6 w-6" />
          <span>No Aave data found. Connect an Ethereum wallet to view your Aave positions.</span>
        </div>
      );
    }

    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Aave Positions</h3>
          
          {aaveBalances.some(account => account.balances.length > 0) ? (
            <>
              {aaveBalances.map((account) => (
                <div key={account.address} className="mb-6">
                  <h4 className="font-semibold mb-2">
                    Address: <span className="font-mono text-xs">{account.address}</span>
                  </h4>
                  
                  {account.balances.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>Asset</th>
                            <th>Balance</th>
                            <th>Value</th>
                            <th>APY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {account.balances.map((balance, index) => (
                            <tr key={index} className="hover">
                              <td>
                                <div className="flex flex-col">
                                  <span>{balance.asset.symbol}</span>
                                  <span className="text-xs opacity-70">{balance.asset.name}</span>
                                </div>
                              </td>
                              <td>{parseFloat(balance.balance.amount).toFixed(6)}</td>
                              <td>{formatCurrency(balance.balance.usd_value)}</td>
                              <td>
                                {balance.apy ? (
                                  <div className="flex items-center">
                                    <ArrowTrendingUpIcon className="h-4 w-4 text-success mr-1" />
                                    <span>{(parseFloat(balance.apy) * 100).toFixed(2)}%</span>
                                  </div>
                                ) : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert">
                      <InformationCircleIcon className="h-6 w-6" />
                      <span>No Aave positions for this address.</span>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="alert">
              <InformationCircleIcon className="h-6 w-6" />
              <span>You don't have any active Aave positions.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render Compound content
  const renderCompound = () => {
    if (!compoundBalances || compoundBalances.length === 0) {
      return (
        <div className="alert">
          <ExclamationCircleIcon className="h-6 w-6" />
          <span>No Compound data found. Connect an Ethereum wallet to view your Compound positions.</span>
        </div>
      );
    }

    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">Compound Positions</h3>
          
          {compoundBalances.some(account => account.balances.length > 0) ? (
            <>
              {compoundBalances.map((account) => (
                <div key={account.address} className="mb-6">
                  <h4 className="font-semibold mb-2">
                    Address: <span className="font-mono text-xs">{account.address}</span>
                  </h4>
                  
                  {account.balances.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="table w-full">
                        <thead>
                          <tr>
                            <th>Asset</th>
                            <th>Balance</th>
                            <th>Value</th>
                            <th>APY</th>
                          </tr>
                        </thead>
                        <tbody>
                          {account.balances.map((balance, index) => (
                            <tr key={index} className="hover">
                              <td>{balance.asset}</td>
                              <td>{parseFloat(balance.balance.amount).toFixed(6)}</td>
                              <td>{formatCurrency(balance.balance.usd_value)}</td>
                              <td>
                                {balance.apy ? (
                                  <div className="flex items-center">
                                    <ArrowTrendingUpIcon className="h-4 w-4 text-success mr-1" />
                                    <span>{(parseFloat(balance.apy) * 100).toFixed(2)}%</span>
                                  </div>
                                ) : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="alert">
                      <InformationCircleIcon className="h-6 w-6" />
                      <span>No Compound positions for this address.</span>
                    </div>
                  )}
                </div>
              ))}
            </>
          ) : (
            <div className="alert">
              <InformationCircleIcon className="h-6 w-6" />
              <span>You don't have any active Compound positions.</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render other protocols - simplified placeholders
  const renderOtherProtocol = () => {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h3 className="card-title">{protocols.find(p => p.id === selectedProtocol)?.name} Positions</h3>
          
          <div className="alert">
            <InformationCircleIcon className="h-6 w-6" />
            <span>Connect your Ethereum wallet to view your {protocols.find(p => p.id === selectedProtocol)?.name} positions.</span>
          </div>
        </div>
      </div>
    );
  };

  // Render content based on selected protocol
  const renderProtocolContent = () => {
    if (isLoading()) {
      return (
        <div className="flex justify-center py-10">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      );
    }

    switch (selectedProtocol) {
      case 'makerdao':
        return renderMakerDAO();
      case 'aave':
        return renderAave();
      case 'compound':
        return renderCompound();
      case 'uniswap':
      case 'yearn':
      case 'balancer':
        return renderOtherProtocol();
      default:
        return null;
    }
  };

  return (
    <ProtectedRoute>
      <Layout title="DeFi">
        <div className="py-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-2xl font-bold">DeFi Protocols</h2>
            <button 
              className="btn btn-sm mt-2 sm:mt-0"
              onClick={handleRefresh}
            >
              <ArrowPathIcon className="h-5 w-5" />
              Refresh
            </button>
          </div>

          {/* Protocol Tabs */}
          <div className="tabs mb-6">
            {protocols.map((protocol) => (
              <a
                key={protocol.id}
                className={`tab tab-bordered ${selectedProtocol === protocol.id ? 'tab-active' : ''}`}
                onClick={() => handleProtocolChange(protocol.id)}
              >
                <span className="mr-2">{protocol.icon}</span>
                {protocol.name}
              </a>
            ))}
          </div>

          {renderProtocolContent()}
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default DefiPage;
