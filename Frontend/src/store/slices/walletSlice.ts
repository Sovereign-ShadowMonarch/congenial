import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BlockchainAccount } from '../apis/walletApi';

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  ensName: string | null;
  chainId: number | null;
  balance: string;
  connectorType: string | null;
  accounts: BlockchainAccount[];
  trackingAddresses: Array<{
    address: string;
    blockchain: string;
    label?: string;
    isConnectedWallet: boolean;
  }>;
  error: string | null;
  supportedChains: Array<{
    id: number;
    name: string;
    network: string;
    icon?: string;
  }>;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  ensName: null,
  chainId: null,
  balance: '0',
  connectorType: null,
  accounts: [],
  trackingAddresses: [],
  error: null,
  supportedChains: [
    { id: 1, name: 'Ethereum', network: 'mainnet' },
    { id: 137, name: 'Polygon', network: 'polygon' },
    { id: 10, name: 'Optimism', network: 'optimism' },
    { id: 42161, name: 'Arbitrum One', network: 'arbitrum' },
    { id: 43114, name: 'Avalanche', network: 'avalanche' },
    { id: 56, name: 'BNB Smart Chain', network: 'bsc' },
  ],
};

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWalletConnected: (
      state,
      action: PayloadAction<{
        address: string;
        chainId: number;
        balance: string;
        connectorType: string;
        ensName?: string;
      }>
    ) => {
      const { address, chainId, balance, connectorType, ensName } = action.payload;
      state.isConnected = true;
      state.address = address;
      state.chainId = chainId;
      state.balance = balance;
      state.connectorType = connectorType;
      state.ensName = ensName || null;
      state.error = null;
      
      // Add connected wallet to tracking addresses if not already there
      const existingWalletIndex = state.trackingAddresses.findIndex(
        (a) => a.address.toLowerCase() === address.toLowerCase() && a.isConnectedWallet
      );
      
      if (existingWalletIndex === -1) {
        state.trackingAddresses.push({
          address,
          blockchain: getBlockchainFromChainId(chainId),
          label: ensName || `Wallet ${state.trackingAddresses.length + 1}`,
          isConnectedWallet: true,
        });
      }
    },
    
    setWalletDisconnected: (state) => {
      state.isConnected = false;
      state.address = null;
      state.chainId = null;
      state.balance = '0';
      state.connectorType = null;
      state.ensName = null;
      
      // Remove connected wallet status but keep tracking addresses
      state.trackingAddresses = state.trackingAddresses.map(addr => ({
        ...addr,
        isConnectedWallet: false,
      }));
    },
    
    updateChainId: (state, action: PayloadAction<number>) => {
      state.chainId = action.payload;
      
      // Update blockchain for connected wallet address
      if (state.address) {
        const connectedWalletIndex = state.trackingAddresses.findIndex(
          (a) => a.address.toLowerCase() === state.address!.toLowerCase() && a.isConnectedWallet
        );
        
        if (connectedWalletIndex !== -1) {
          state.trackingAddresses[connectedWalletIndex].blockchain = getBlockchainFromChainId(action.payload);
        }
      }
    },
    
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    
    setAccounts: (state, action: PayloadAction<BlockchainAccount[]>) => {
      state.accounts = action.payload;
      
      // Sync tracked addresses with accounts
      const trackingMap = new Map(
        state.trackingAddresses.map((addr) => [
          `${addr.blockchain.toLowerCase()}:${addr.address.toLowerCase()}`,
          addr,
        ])
      );
      
      action.payload.forEach((account) => {
        const key = `${account.blockchain.toLowerCase()}:${account.address.toLowerCase()}`;
        if (!trackingMap.has(key)) {
          state.trackingAddresses.push({
            address: account.address,
            blockchain: account.blockchain,
            label: account.label,
            isConnectedWallet: false,
          });
        }
      });
    },
    
    addTrackingAddress: (
      state,
      action: PayloadAction<{
        address: string;
        blockchain: string;
        label?: string;
      }>
    ) => {
      const { address, blockchain, label } = action.payload;
      const normalizedAddress = address.toLowerCase();
      
      // Check if this address is already being tracked
      const exists = state.trackingAddresses.some(
        (addr) =>
          addr.address.toLowerCase() === normalizedAddress &&
          addr.blockchain.toLowerCase() === blockchain.toLowerCase()
      );
      
      if (!exists) {
        state.trackingAddresses.push({
          address,
          blockchain,
          label: label || `Address ${state.trackingAddresses.length + 1}`,
          isConnectedWallet: false,
        });
      }
    },
    
    removeTrackingAddress: (
      state,
      action: PayloadAction<{
        address: string;
        blockchain: string;
      }>
    ) => {
      const { address, blockchain } = action.payload;
      const normalizedAddress = address.toLowerCase();
      
      state.trackingAddresses = state.trackingAddresses.filter(
        (addr) =>
          !(
            addr.address.toLowerCase() === normalizedAddress &&
            addr.blockchain.toLowerCase() === blockchain.toLowerCase()
          )
      );
    },
    
    updateAddressLabel: (
      state,
      action: PayloadAction<{
        address: string;
        blockchain: string;
        label: string;
      }>
    ) => {
      const { address, blockchain, label } = action.payload;
      const normalizedAddress = address.toLowerCase();
      
      const addressIndex = state.trackingAddresses.findIndex(
        (addr) =>
          addr.address.toLowerCase() === normalizedAddress &&
          addr.blockchain.toLowerCase() === blockchain.toLowerCase()
      );
      
      if (addressIndex !== -1) {
        state.trackingAddresses[addressIndex].label = label;
      }
    },
    
    setWalletError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    clearWalletError: (state) => {
      state.error = null;
    },
  },
});

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

export const {
  setWalletConnected,
  setWalletDisconnected,
  updateChainId,
  updateBalance,
  setAccounts,
  addTrackingAddress,
  removeTrackingAddress,
  updateAddressLabel,
  setWalletError,
  clearWalletError,
} = walletSlice.actions;

export default walletSlice.reducer;
