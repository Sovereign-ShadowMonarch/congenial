import React, { useState, useEffect, useMemo } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  TimeScale,
  TooltipItem,
  ChartOptions,
  ChartDataset
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import { useGetPortfolioPerformanceQuery, PerformanceData } from '../../store/apis/portfolioApi';

// Register required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  TimeScale,
  Title,
  Tooltip,
  Legend
);

// Available time ranges
type TimeRange = '1D' | '7D' | '30D' | '90D' | '1Y' | 'ALL';

// Define interface for comparison data points
interface ComparisonDataPoint {
  timestamp: string | number;
  value: number;
}

// Define interface for our chart dataset that includes all required properties and borderDash
interface CustomChartDataset {
  label: string;
  data: any;
  borderColor: string;
  backgroundColor: string;
  tension: number;
  pointRadius: number;
  pointHoverRadius: number;
  fill: boolean;
  borderWidth: number;
  yAxisID: string;
  borderDash?: number[];
}

interface PerformanceGraphProps {
  className?: string;
}

const PerformanceGraph: React.FC<PerformanceGraphProps> = ({ className }) => {
  // Time range state and options
  const [timeRange, setTimeRange] = useState<TimeRange>('30D');
  const [showComparison, setShowComparison] = useState(false);

  // Calculate start timestamp based on selected time range
  const startTimestamp = useMemo(() => {
    const now = new Date();
    
    switch(timeRange) {
      case '1D':
        return new Date(now.setDate(now.getDate() - 1)).getTime();
      case '7D':
        return new Date(now.setDate(now.getDate() - 7)).getTime();
      case '30D':
        return new Date(now.setMonth(now.getMonth() - 1)).getTime();
      case '90D':
        return new Date(now.setMonth(now.getMonth() - 3)).getTime();
      case '1Y':
        return new Date(now.setFullYear(now.getFullYear() - 1)).getTime();
      case 'ALL':
        return 0; // All available data
      default:
        return new Date(now.setMonth(now.getMonth() - 1)).getTime();
    }
  }, [timeRange]);
  
  // Query performance data with the selected time range
  const { 
    data, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useGetPortfolioPerformanceQuery({
    startTime: startTimestamp,
    granularity: timeRange === '1D' ? 'hourly' : 
                 timeRange === '7D' ? 'daily' : 
                 timeRange === '30D' ? 'daily' : 
                 'weekly'
  });

  // Refetch data when time range changes
  useEffect(() => {
    refetch();
  }, [timeRange, refetch]);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!data || !data.portfolio || data.portfolio.length === 0) {
      return {
        datasets: [{
          label: 'Portfolio Value',
          data: [],
          borderColor: '#4F46E5',
          backgroundColor: 'rgba(79, 70, 229, 0.1)',
          fill: true,
          cubicInterpolationMode: 'monotone' as const,
          tension: 0.4
        }]
      };
    }

    const chartDatasets = [
      {
        label: 'Portfolio Value',
        data: data.portfolio.map((item: { timestamp: string | number | Date; value: number }) => ({
          x: new Date(item.timestamp),
          y: item.value
        })),
        borderColor: '#6366F1', // Indigo
        backgroundColor: 'rgba(99, 102, 241, 0.5)', // Indigo with opacity
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        fill: false,
        borderWidth: 2,
        yAxisID: 'y'
      }
    ];

    // Add comparison datasets if enabled
    if (showComparison && data.comparisons) {
      if (data.comparisons.btc) {
        chartDatasets.push({
          label: 'BTC',
          data: data.comparisons.btc.map((item: ComparisonDataPoint) => ({
            x: new Date(item.timestamp),
            y: item.value
          })),
          borderColor: '#F59E0B', // Amber
          backgroundColor: 'rgba(245, 158, 11, 0.5)', // Amber with opacity
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3,
          fill: false,
          borderWidth: 2,
          yAxisID: 'yPercentage'
        } as CustomChartDataset);
      }
      
      if (data.comparisons.eth) {
        chartDatasets.push({
          label: 'ETH',
          data: data.comparisons.eth.map((item: { timestamp: string | number; value: number }) => ({
            x: new Date(item.timestamp),
            y: item.value
          })),
          borderColor: '#10B981', // Emerald
          backgroundColor: 'rgba(16, 185, 129, 0.5)', // Emerald with opacity
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3,
          fill: false,
          borderWidth: 2,
          yAxisID: 'yPercentage'
        } as CustomChartDataset);
      }
      
      if (data.comparisons.sp500) {
        chartDatasets.push({
          label: 'S&P 500',
          data: data.comparisons.sp500.map((item: ComparisonDataPoint) => ({
            x: new Date(item.timestamp),
            y: item.value
          })),
          borderColor: '#EF4444', // Red
          backgroundColor: 'rgba(239, 68, 68, 0.5)', // Red with opacity
          borderDash: [5, 5],
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 3,
          fill: false,
          borderWidth: 2,
          yAxisID: 'yPercentage'
        } as CustomChartDataset);
      }
    }

    return {
      datasets: chartDatasets
    };
  }, [data, showComparison]);

  // Chart options
  const chartOptions = useMemo((): ChartOptions<'line'> => {
    const isPositive = data && data.performanceSummary && data.performanceSummary.changePercent >= 0;
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index' as const,
      },
      elements: {
        line: {
          tension: 0.4
        }
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            unit: timeRange === '1D' ? 'hour' as const : 
                  timeRange === '7D' ? 'day' as const : 
                  timeRange === '30D' ? 'day' as const : 
                  timeRange === '90D' ? 'week' as const : 
                  'month' as const,
            tooltipFormat: timeRange === '1D' ? 'p' : 'MMM d, yyyy',
            displayFormats: {
              hour: 'ha',
              day: 'MMM d',
              week: 'MMM d',
              month: 'MMM yyyy'
            }
          },
          grid: {
            display: false
          }
        },
        y: {
          position: 'left' as const,
          title: {
            display: true,
            text: 'Value (USD)'
          },
          grid: {
            color: 'rgba(156, 163, 175, 0.1)' // Gray with opacity
          },
          ticks: {
            callback: function(this: any, value: string | number) {
              return '$' + Number(value).toLocaleString();
            }
          }
        },
        yPercentage: {
          position: 'right' as const,
          title: {
            display: showComparison,
            text: 'Relative Performance (%)'
          },
          grid: {
            display: false
          },
          ticks: {
            callback: function(this: any, value: string | number) {
              return value + '%';
            }
          },
          min: showComparison ? undefined : 0,
          display: showComparison
        }
      },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            boxWidth: 12,
            padding: 15,
            usePointStyle: true,
          }
        },
        tooltip: {
          callbacks: {
            label: function(context: TooltipItem<'line'>) {
              const value = context.raw && typeof context.raw === 'object' && 'y' in context.raw ? 
                (context.raw.y as number) : 0;
              const yAxisID = context.dataset.yAxisID;
              
              if (yAxisID === 'yPercentage') {
                return `${context.dataset.label}: ${value.toFixed(2)}%`;
              } else {
                return `${context.dataset.label}: $${value.toLocaleString()}`;
              }
            }
          }
        }
      }
    };
  }, [data, timeRange, showComparison]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 ${className}`}>
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Portfolio Performance</h3>
          <div className="animate-pulse w-48 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="h-80 flex items-center justify-center animate-pulse">
          <svg className="w-24 h-24 text-gray-200 dark:text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Portfolio Performance</h3>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          <p className="font-medium">Failed to load performance data</p>
          <p className="text-sm mt-1">
            {(error as any)?.data?.message || (error as any)?.message || 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.portfolio || data.portfolio.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Portfolio Performance</h3>
        <div className="flex flex-col items-center justify-center h-80 p-6">
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Not enough historical data to display performance graph.
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-center mt-2">
            Continue tracking your portfolio to see performance over time.
          </p>
        </div>
      </div>
    );
  }

  const isPositiveChange = data.performanceSummary?.changePercent >= 0;

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 ${className}`}>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:items-center sm:justify-between mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Portfolio Performance</h3>
          {data.performanceSummary && (
            <div className="mt-1 flex items-center">
              <span 
                className={`text-sm font-medium ${
                  isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositiveChange ? '+' : ''}
                {data.performanceSummary.changePercent.toFixed(2)}%
              </span>
              <span className="mx-2 text-gray-500 dark:text-gray-400">|</span>
              <span 
                className={`text-sm font-medium ${
                  isPositiveChange ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {isPositiveChange ? '+' : ''}
                ${data.performanceSummary.changeValue.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
          <div className="inline-flex rounded-md shadow-sm">
            {(['1D', '7D', '30D', '90D', '1Y', 'ALL'] as TimeRange[]).map((range, index) => (
              <button
                key={range}
                type="button"
                className={`px-3 py-2 text-xs font-medium
                  ${index === 0 ? 'rounded-l-md' : ''} 
                  ${index === 5 ? 'rounded-r-md' : ''}
                  ${timeRange === range
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  } border`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          
          <button
            type="button"
            className={`px-3 py-2 text-xs font-medium rounded-md border
              ${showComparison
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            onClick={() => setShowComparison(!showComparison)}
          >
            {showComparison ? 'Hide Comparison' : 'Compare'}
          </button>
        </div>
      </div>

      <div className="h-80">
        {chartData && <Line options={chartOptions} data={chartData} />}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Start Value</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            ${data.performanceSummary?.startValue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">End Value</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            ${data.performanceSummary?.endValue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Highest Value</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            ${data.performanceSummary?.highValue.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lowest Value</p>
          <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-100">
            ${data.performanceSummary?.lowValue.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PerformanceGraph;
