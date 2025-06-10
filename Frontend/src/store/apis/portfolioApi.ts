import baseApi from './baseApi';

// Define types for portfolio data
export interface PortfolioSummary {
  total_value_usd: string;
  total_pnl_24h: string;
  total_pnl_percentage_24h: string;
  asset_count: number;
  last_updated: number;
}

export interface ValueDistribution {
  asset: string;
  symbol: string;
  amount: string;
  value_usd: string;
  percentage: number;
  color?: string;
}

export interface AssetAllocation {
  symbol: string;
  name: string;
  quantity: number;
  valueUsd: number;
  percentage: number;
  color?: string;
}

export interface PortfolioAllocationResponse {
  assets: AssetAllocation[];
  lastUpdated: number;
}

export interface NetValueStatistics {
  times: number[];  // Unix timestamps
  data: string[];   // Net value in USD at each timestamp
}

export interface PerformanceData {
  portfolio: Array<{
    timestamp: number;
    value: number;
  }>;
  comparisons?: {
    btc?: Array<{
      timestamp: number;
      value: number;
    }>;
    eth?: Array<{
      timestamp: number;
      value: number;
    }>;
    sp500?: Array<{
      timestamp: number;
      value: number;
    }>;
  };
  performanceSummary: {
    startValue: number;
    endValue: number;
    highValue: number;
    lowValue: number;
    changeValue: number;
    changePercent: number;
  };
}

// Define portfolio API endpoints
export const portfolioApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPortfolioSummary: builder.query<PortfolioSummary, void>({
      query: () => 'portfolio/summary',
      providesTags: ['Balance', 'Statistics'],
      // Handling null response safely
      transformResponse: (response: any) => {
        if (!response || !response.result) {
          return {
            total_value_usd: '0',
            total_pnl_24h: '0',
            total_pnl_percentage_24h: '0%',
            asset_count: 0,
            last_updated: Date.now(),
          };
        }
        return response.result;
      },
    }),
    
    // Add endpoint for syncing portfolio data with external sources
    syncPortfolioData: builder.mutation<{ success: boolean, message: string }, void>({
      query: () => ({
        url: 'portfolio/sync',
        method: 'POST',
      }),
      invalidatesTags: ['Balance', 'Statistics', 'Asset'],
    }),
    
    getValueDistribution: builder.query<ValueDistribution[], void>({  
      query: () => 'portfolio/distribution',
      providesTags: ['Balance', 'Asset'],
      // Group and format the distribution data
      transformResponse: (response: ValueDistribution[]) => {
        const colorPalette = [
          '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', 
          '#8B5CF6', '#6366F1', '#14B8A6', '#F43F5E', '#F97316',
          '#84CC16', '#9333EA', '#064E3B', '#78350F', '#0C4A6E'
        ];
        
        return response.map((item, index: number) => ({
          ...item,
          color: colorPalette[index % colorPalette.length]
        }));
      },
    }),
    
    getNetValueStatistics: builder.query<NetValueStatistics, void>({
      query: () => 'portfolio/history',
      providesTags: ['Statistics'],
      // Ensure we have valid data arrays
      transformResponse: (response: any) => {
        if (!response || !response.times || !response.data) {
          return {
            times: [],
            data: [],
          };
        }
        return response;
      },
    }),
    
    // Add endpoint for getting portfolio allocation data
    getPortfolioAllocation: builder.query<PortfolioAllocationResponse, void>({
      query: () => 'portfolio/allocation',
      providesTags: ['Asset', 'Balance'],
      transformResponse: (response: any): PortfolioAllocationResponse => {
        // Default empty response
        if (!response || !response.assets || !Array.isArray(response.assets)) {
          return {
            assets: [],
            lastUpdated: Date.now()
          };
        }
        
        // Generate colors for the assets
        const colorPalette = [
          '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EC4899', 
          '#8B5CF6', '#6366F1', '#14B8A6', '#F43F5E', '#F97316',
          '#84CC16', '#9333EA', '#064E3B', '#78350F', '#0C4A6E'
        ];
        
        const assets = response.assets.map((asset: any, index: number) => ({
          symbol: asset.symbol || 'UNKNOWN',
          name: asset.name || asset.symbol || 'Unknown Asset',
          quantity: parseFloat(asset.quantity || '0'),
          valueUsd: parseFloat(asset.value_usd || '0'),
          percentage: parseFloat(asset.percentage || '0'),
          color: colorPalette[index % colorPalette.length]
        }));
        
        return {
          assets,
          lastUpdated: response.last_updated || Date.now()
        };
      },
    }),
    
    getPortfolioPerformance: builder.query<PerformanceData, { startTime: number; granularity: string }>({  
      query: (params: { startTime: number; granularity: string }) => `portfolio/performance?start_time=${params.startTime}&granularity=${params.granularity}`,
      providesTags: ['Statistics'],
      // Ensure we have valid data structure with proper typing
      transformResponse: (response: any): PerformanceData => {
        if (!response || !response.portfolio || !Array.isArray(response.portfolio)) {
          return {
            portfolio: [],
            performanceSummary: {
              startValue: 0,
              endValue: 0,
              highValue: 0,
              lowValue: 0,
              changeValue: 0,
              changePercent: 0
            }
          };
        }
        return response;
      },
    }),
    
    // Add endpoint for generating portfolio reports
    generatePortfolioReport: builder.mutation<{ task_id: number }, { format: string, timeRange: string }>({  
      query: (params: { format: string, timeRange: string }) => ({
        url: 'portfolio/reports/generate',
        method: 'POST',
        body: params
      }),
    }),
  }),
  
  // No need for overrideExisting in standalone API
});


// Export hooks for usage in components with type assertion to handle TypeScript complexity
export const {
  useGetPortfolioSummaryQuery,
  useGetValueDistributionQuery,
  useGetNetValueStatisticsQuery,
  useGetPortfolioAllocationQuery,
  useGetPortfolioPerformanceQuery,
  useSyncPortfolioDataMutation,
  useGeneratePortfolioReportMutation
} = portfolioApi as any;
