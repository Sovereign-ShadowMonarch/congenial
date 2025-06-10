import { createApi } from '@reduxjs/toolkit/query/react';
import { createBaseQuery } from '../../utils/api';

// Define report types
export interface ReportOptions {
  format: 'pdf' | 'csv' | 'json';
  timeRange: 'day' | 'week' | 'month' | 'quarter' | 'year' | 'all';
  includeAssets?: boolean;
  includeTransactions?: boolean;
  includeTaxes?: boolean;
  includePerformance?: boolean;
  fromTimestamp?: number;
  toTimestamp?: number;
}

export interface ReportResult {
  task_id?: number;
  download_url?: string;
  report_id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: number;
}

export interface PerformanceMetrics {
  total_return: string;
  total_return_percentage: string;
  annualized_return: string;
  volatility: string;
  sharpe_ratio: string;
  max_drawdown: string;
  best_day: {
    date: string;
    return_percentage: string;
  };
  worst_day: {
    date: string;
    return_percentage: string;
  };
}

export interface RiskAssessment {
  portfolio_risk_score: number;
  risk_breakdown: {
    volatility_risk: number;
    concentration_risk: number;
    liquidity_risk: number;
    market_correlation: number;
  };
  suggested_actions: string[];
}

// Define reporting API endpoints
export const reportingApi = createApi({
  reducerPath: 'reportingApi',
  baseQuery: createBaseQuery(),
  tagTypes: ['Statistics', 'Report'],
  endpoints: (builder) => ({
    // Generate a portfolio report
    generateReport: builder.mutation<ReportResult, ReportOptions>({
      query: (options) => ({
        url: 'reports/generate',
        method: 'POST',
        body: options,
      }),
    }),
    
    // Get report status
    getReportStatus: builder.query<ReportResult, string>({
      query: (reportId) => `reports/${reportId}`,
    }),
    
    // Get list of generated reports
    getReportHistory: builder.query<ReportResult[], void>({
      query: () => 'reports/history',
      providesTags: ['Statistics'],
    }),
    
    // Calculate performance metrics
    getPerformanceMetrics: builder.query<PerformanceMetrics, { timeRange: string }>({
      query: ({ timeRange }) => `analytics/performance?timeRange=${timeRange}`,
      providesTags: ['Statistics'],
    }),
    
    // Get risk assessment
    getRiskAssessment: builder.query<RiskAssessment, void>({
      query: () => 'analytics/risk',
      providesTags: ['Statistics'],
    }),
    
    // Get asset correlation matrix
    getAssetCorrelation: builder.query<Record<string, Record<string, number>>, { assets: string[] }>({
      query: ({ assets }) => ({
        url: 'analytics/correlation',
        method: 'GET',
        params: { assets: assets.join(',') },
      }),
      providesTags: ['Statistics'],
    }),
    
    // Get portfolio allocation efficiency
    getAllocationEfficiency: builder.query<{ efficiency_score: number, suggestions: string[] }, void>({
      query: () => 'analytics/allocation-efficiency',
      providesTags: ['Statistics'],
    }),
    
    // Schedule recurring report
    scheduleRecurringReport: builder.mutation<{ schedule_id: string }, { frequency: 'daily' | 'weekly' | 'monthly', options: ReportOptions, email?: string }>({
      query: (params) => ({
        url: 'reports/schedule',
        method: 'POST',
        body: params,
      }),
    }),
    
    // Cancel recurring report schedule
    cancelReportSchedule: builder.mutation<boolean, string>({
      query: (scheduleId) => ({
        url: `reports/schedule/${scheduleId}`,
        method: 'DELETE',
      }),
    }),
  }),

});

// Export hooks for usage in components with type assertion to handle TypeScript complexity
export const {
  useGenerateReportMutation,
  useGetReportStatusQuery,
  useGetReportPerformanceMetricsQuery,
  useDownloadReportQuery,
  useGetAvailableReportsQuery,
  useDeleteReportMutation,
  useExportTaxReportMutation,
  useGetRiskAssessmentQuery,
  useGeneratePnLReportMutation,
  useGetPortfolioStatisticsQuery
} = reportingApi as any;  // Type assertion to avoid TypeScript errors
