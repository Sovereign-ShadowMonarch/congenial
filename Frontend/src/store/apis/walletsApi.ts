import baseApi from './baseApi';

export interface WalletBalance {
  asset: string;
  amount: number;
  value_usd?: number;
}

export interface Wallet {
  id: string;
  address: string;
  name: string;
  network: string;
  type: string; 
  is_read_only: boolean;
  added_at: number;
  last_sync: number;
  balances: WalletBalance[];
}

interface GetWalletsResponse {
  wallets: Wallet[];
}

interface AddWalletRequest {
  address: string;
  name?: string;
  network: string;
  private_key?: string; // Only for non-read-only wallets
}

interface AddWalletResponse {
  wallet: Wallet;
}

interface UpdateWalletRequest {
  wallet_id: string;
  name?: string;
  is_read_only?: boolean;
}

interface UpdateWalletResponse {
  wallet: Wallet;
}

interface RemoveWalletRequest {
  wallet_id: string;
}

interface RemoveWalletResponse {
  success: boolean;
}

interface SyncWalletRequest {
  wallet_id: string;
}

interface SyncWalletResponse {
  wallet: Wallet;
  last_sync: number;
}

// Inject wallet API endpoints into the base API
export const walletsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWallets: builder.query<GetWalletsResponse, void>({
      query: () => ({
        url: '/wallets',
        method: 'GET',
      }),
      providesTags: ['Wallet']
    }),
    
    getWallet: builder.query<Wallet, string>({
      query: (walletId) => ({
        url: `/wallets/${walletId}`,
        method: 'GET',
      }),
      providesTags: (result, error, arg) => [{ type: 'Wallet', id: arg }]
    }),
    
    addWallet: builder.mutation<AddWalletResponse, AddWalletRequest>({
      query: (wallet) => ({
        url: '/wallets',
        method: 'POST',
        body: wallet
      }),
      invalidatesTags: ['Wallet']
    }),
    
    updateWallet: builder.mutation<UpdateWalletResponse, UpdateWalletRequest>({
      query: ({ wallet_id, ...data }) => ({
        url: `/wallets/${wallet_id}`,
        method: 'PATCH',
        body: data
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Wallet', id: arg.wallet_id }]
    }),
    
    removeWallet: builder.mutation<RemoveWalletResponse, RemoveWalletRequest>({
      query: ({ wallet_id }) => ({
        url: `/wallets/${wallet_id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Wallet', id: arg.wallet_id }]
    }),
    
    syncWallet: builder.mutation<SyncWalletResponse, SyncWalletRequest>({
      query: ({ wallet_id }) => ({
        url: `/wallets/${wallet_id}/sync`,
        method: 'POST'
      }),
      invalidatesTags: (result, error, arg) => [{ type: 'Wallet', id: arg.wallet_id }]
    }),
  }),
});

// Export generated hooks for use in components
export const {
  useGetWalletsQuery,
  useGetWalletQuery,
  useAddWalletMutation,
  useUpdateWalletMutation,
  useRemoveWalletMutation,
  useSyncWalletMutation
} = walletsApi;
