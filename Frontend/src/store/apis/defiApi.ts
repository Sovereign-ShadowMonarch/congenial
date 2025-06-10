import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../../utils/api';

// Define DeFi protocol types
export interface DeFiProtocol {
  id: string;
  name: string;
  icon?: string;
  chains: string[];
  supported_actions: string[];
  active: boolean;
}

export interface DeFiPosition {
  id: string;
  protocol: string;
  position_type: 'lending' | 'borrowing' | 'liquidity' | 'staking' | 'yield' | 'vault';
  position_details: {
    supplied_assets?: Array<{
      asset: string;
      symbol: string;
      amount: string;
      value_usd: string;
    }>;
    borrowed_assets?: Array<{
      asset: string;
      symbol: string;
      amount: string;
      value_usd: string;
    }>;
    liquidity_assets?: Array<{
      asset: string;
      symbol: string;
      amount: string;
      value_usd: string;
      share?: string;
    }>;
  };
  rewards: Array<{
    asset: string;
    symbol: string;
    amount: string;
    value_usd: string;
    claimable: boolean;
  }>;
  apr?: string;
  apy?: string;
  health_factor?: string;
  liquidation_threshold?: string;
  impermanent_loss?: string;
  created_at: number;
  last_updated: number;
  value_usd: string;
  chain: string;
  address: string;
}

export interface DeFiStats {
  total_value_locked: string;
  total_supplied: string;
  total_borrowed: string;
  total_rewards_value: string;
  best_yield: {
    protocol: string;
    apy: string;
    asset: string;
  };
  protocol_distribution: Array<{
    protocol: string;
    value_usd: string;
    percentage: number;
  }>;
}

// Define DeFi API endpoints
export const defiApi = createApi({
  reducerPath: 'defiApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['DeFiPosition', 'Statistics'],
  endpoints: (builder) => ({
    // Get all supported DeFi protocols
    getProtocols: builder.query<DeFiProtocol[], void>({
      query: () => 'defi/protocols',
      providesTags: ['DeFiPosition'],
    }),
    
    // Get all user DeFi positions
    getPositions: builder.query<DeFiPosition[], void>({
      query: () => 'defi/positions',
      providesTags: ['DeFiPosition'],
    }),
    
    // Get positions for a specific protocol
    getProtocolPositions: builder.query<DeFiPosition[], string>({
      query: (protocolId) => `defi/protocols/${protocolId}/positions`,
      providesTags: (result, error, protocolId) => [
        { type: 'DeFiPosition', id: protocolId },
        'DeFiPosition',
      ],
    }),
    
    // Get detailed stats for a specific position
    getPositionDetails: builder.query<DeFiPosition, { protocolId: string, positionId: string }>({
      query: ({ protocolId, positionId }) => `defi/protocols/${protocolId}/positions/${positionId}`,
      providesTags: (result, error, { positionId }) => [
        { type: 'DeFiPosition', id: positionId },
        'DeFiPosition',
      ],
    }),
    
    // Get aggregated DeFi statistics
    getDeFiStats: builder.query<DeFiStats, void>({
      query: () => 'defi/stats',
      providesTags: ['DeFiPosition', 'Statistics'],
    }),
    
    // Claim rewards from a position
    claimRewards: builder.mutation<{ task_id: number }, { protocolId: string, positionId: string, rewardAsset: string }>({
      query: ({ protocolId, positionId, rewardAsset }) => ({
        url: `defi/protocols/${protocolId}/positions/${positionId}/claim`,
        method: 'POST',
        body: { asset: rewardAsset },
      }),
      // Don't invalidate immediately as this is an async operation
    }),
    
    // Add a custom DeFi position manually
    addCustomPosition: builder.mutation<DeFiPosition, { protocolId: string, position: Partial<DeFiPosition> }>({
      query: ({ protocolId, position }) => ({
        url: `defi/protocols/${protocolId}/positions`,
        method: 'PUT',
        body: position,
      }),
      invalidatesTags: ['DeFiPosition'],
    }),
    
    // Refresh a specific position
    refreshPosition: builder.mutation<{ task_id: number }, { protocolId: string, positionId: string }>({
      query: ({ protocolId, positionId }) => ({
        url: `defi/protocols/${protocolId}/positions/${positionId}/refresh`,
        method: 'POST',
      }),
    }),
    
    // Get risk assessment for a position
    getPositionRisk: builder.query<{ risk_score: number, factors: Array<{ factor: string, impact: number, description: string }> }, { protocolId: string, positionId: string }>({
      query: ({ protocolId, positionId }) => `defi/protocols/${protocolId}/positions/${positionId}/risk`,
      providesTags: (result, error, { positionId }) => [
        { type: 'DeFiPosition', id: `risk_${positionId}` },
        'DeFiPosition',
      ],
    }),
  }),
  // No need for overrideExisting in standalone API
});

// Export hooks for usage in components with type assertion to handle TypeScript complexity
export const {
  useGetProtocolsQuery,
  useGetPositionsQuery,
  useGetProtocolPositionsQuery,
  useGetPositionDetailsQuery,
  useGetDeFiStatsQuery,
  useClaimRewardsMutation,
  useAddCustomPositionMutation,
  useRefreshPositionMutation,
  useGetPositionRiskQuery,
} = defiApi as any;
