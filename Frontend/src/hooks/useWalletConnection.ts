import { useCallback, useEffect } from 'react';
import { useAccount, useBalance, useConnect, useDisconnect, useEnsName, useNetwork, useSwitchNetwork } from 'wagmi';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setWalletConnected, 
  setWalletDisconnected, 
  updateBalance, 
  updateChainId, 
  setWalletError, 
  clearWalletError 
} from '@/store/slices/walletSlice';
import { addTrackingAddress, removeTrackingAddress } from '@/store/slices/walletSlice';
import { walletApi } from '@/store/apis/walletApi';
import type { RootState } from '@/store';

/**
 * Custom hook for wallet connections that integrates with Redux store
 * and provides simplified interface for components
 */
export const useWalletConnection = () => {
  const dispatch = useDispatch();
  const walletState = useSelector((state: RootState) => state.wallet);
  
  // Wagmi hooks
  const { address, connector, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const { connect, connectors, isPending: isConnecting, error: connectError } = useConnect();
  const { disconnect } = useDisconnect();
  const { chain } = useNetwork();
  const { chains, switchNetwork } = useSwitchNetwork();
  const { data: balanceData } = useBalance({
    address,
    watch: true,
  });

  const [addBlockchainAddress] = walletApi.useAddBlockchainAddressMutation();
  const [removeBlockchainAddress] = walletApi.useRemoveBlockchainAddressMutation();
  
  // Sync wallet state with Redux
  useEffect(() => {
    if (isConnected && address && chain) {
      dispatch(setWalletConnected({
        address,
        chainId: chain.id,
        balance: balanceData?.formatted || '0',
        connectorType: connector?.id || 'unknown',
        ensName: ensName || undefined,
      }));
      
      // Track connected wallet in backend
      if (address) {
        const blockchain = getBlockchainFromChainId(chain.id);
        addBlockchainAddress({
          blockchain,
          request: {
            address,
            label: ensName || `Connected Wallet (${connector?.id || 'wallet'})`,
            tags: ['connected-wallet'],
          },
        }).catch(err => {
          console.error('Failed to track wallet address:', err);
        });
      }
    } else if (!isConnected && walletState.isConnected) {
      dispatch(setWalletDisconnected());
    }
  }, [isConnected, address, chain, connector, ensName, balanceData?.formatted]);
  
  // Track balance changes
  useEffect(() => {
    if (balanceData && isConnected) {
      dispatch(updateBalance(balanceData.formatted));
    }
  }, [balanceData, isConnected]);
  
  // Track chain changes
  useEffect(() => {
    if (chain && isConnected) {
      dispatch(updateChainId(chain.id));
    }
  }, [chain, isConnected]);
  
  // Track connection errors
  useEffect(() => {
    if (connectError) {
      dispatch(setWalletError(connectError.message));
    } else {
      dispatch(clearWalletError());
    }
  }, [connectError]);
  
  // Connect wallet function that handles tracking
  const connectWallet = useCallback((connectorId: string) => {
    const targetConnector = connectors.find(c => c.id === connectorId);
    if (targetConnector) {
      connect({ connector: targetConnector });
    } else {
      dispatch(setWalletError(`Connector ${connectorId} not found`));
    }
  }, [connectors, connect]);
  
  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    disconnect();
  }, [disconnect]);
  
  // Track a new address manually
  const trackAddress = useCallback(async (address: string, blockchain: string, label?: string) => {
    try {
      await addBlockchainAddress({
        blockchain,
        request: { address, label, tags: ['manually-tracked'] }
      }).unwrap();
      
      dispatch(addTrackingAddress({ address, blockchain, label }));
      return true;
    } catch (error) {
      console.error('Failed to track address:', error);
      return false;
    }
  }, [addBlockchainAddress]);
  
  // Remove tracked address
  const untrackAddress = useCallback(async (address: string, blockchain: string) => {
    try {
      await removeBlockchainAddress({ blockchain, address }).unwrap();
      dispatch(removeTrackingAddress({ address, blockchain }));
      return true;
    } catch (error) {
      console.error('Failed to untrack address:', error);
      return false;
    }
  }, [removeBlockchainAddress]);

  return {
    // Current state
    isConnected: walletState.isConnected,
    address: walletState.address,
    ensName: walletState.ensName,
    chainId: walletState.chainId,
    balance: walletState.balance,
    connectorType: walletState.connectorType,
    error: walletState.error,
    supportedChains: walletState.supportedChains,
    trackingAddresses: walletState.trackingAddresses,
    
    // Connection status
    isConnecting,
    
    // Functions
    connectWallet,
    disconnectWallet,
    switchNetwork,
    trackAddress,
    untrackAddress,
    
    // Wagmi direct access
    connectors,
    chains,
  };
};

// Helper function to map chain ID to blockchain name
function getBlockchainFromChainId(chainId: number): string {
  const chainMap: Record<number, string> = {
    1: 'ethereum',
    137: 'polygon',
    10: 'optimism',
    42161: 'arbitrum',
    43114: 'avalanche',
    56: 'bsc',
  };
  
  return chainMap[chainId] || 'ethereum';
}

export default useWalletConnection;
