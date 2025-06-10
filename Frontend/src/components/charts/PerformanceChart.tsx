import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';
import { format } from 'date-fns';

// Register required ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PerformanceChartProps {
  times: number[]; // Timestamps in milliseconds
  values: string[]; // Portfolio values as strings
  height?: number;
  showLegend?: boolean;
  className?: string;
  isLoading?: boolean;
}

/**
 * Displays portfolio performance data in a line chart with area fill
 */
export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  times,
  values,
  height = 300,
  showLegend = false,
  className = '',
  isLoading = false,
}) => {
  // Get current timeRange and currency from Redux store
  const { timeRange, currency } = useSelector((state: RootState) => state.ui);
  
  // Currency symbol based on selected currency
  const currencySymbol = useMemo(() => {
    switch(currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      default: return '$';
    }
  }, [currency]);
  
  // Format timestamp for X-axis display
  const formatTime = (timestamp: number): string => {
    // Different formatting based on time range
    if (timeRange === '1d') {
      return format(new Date(timestamp), 'HH:mm');
    } else if (timeRange === '7d') {
      return format(new Date(timestamp), 'EEE');
    } else if (timeRange === '30d' || timeRange === '90d') {
      return format(new Date(timestamp), 'MMM d');
    } else {
      return format(new Date(timestamp), 'MMM yyyy');
    }
  };
  
  // Format data for the chart
  const chartData = useMemo(() => {
    // Handle empty data case
    if (!times?.length || !values?.length || times.length !== values.length) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Portfolio Value',
            data: [],
            borderColor: '#4F46E5', // Indigo-600
            backgroundColor: 'rgba(79, 70, 229, 0.1)', // Indigo-600 with opacity
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.4, // Smooth curve
            fill: true,
          },
        ],
      };
    }
    
    // Calculate a representative number of points to display based on time range
    // This prevents overcrowding the chart with too many points
    const maxPoints = 50;
    const step = times.length > maxPoints ? Math.floor(times.length / maxPoints) : 1;
    
    // Sample the data to reduce point density
    const sampledLabels: string[] = [];
    const sampledValues: number[] = [];
    
    for (let i = 0; i < times.length; i += step) {
      sampledLabels.push(formatTime(times[i]));
      sampledValues.push(parseFloat(values[i]));
    }
    
    // Ensure we include the last point for a complete view
    if ((times.length - 1) % step !== 0) {
      const lastIndex = times.length - 1;
      sampledLabels.push(formatTime(times[lastIndex]));
      sampledValues.push(parseFloat(values[lastIndex]));
    }
    
    return {
      labels: sampledLabels,
      datasets: [
        {
          label: 'Portfolio Value',
          data: sampledValues,
          borderColor: '#4F46E5', // Indigo-600
          backgroundColor: 'rgba(79, 70, 229, 0.1)', // Indigo-600 with opacity
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: 0.4, // Smooth curve
          fill: true,
        },
      ],
    };
  }, [times, values, timeRange]);
  
  // Chart options
  const options = useMemo<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point: {
        radius: 0, // Hide points by default
      },
    },
    plugins: {
      legend: {
        display: showLegend,
        position: 'top',
      },
      tooltip: {
        displayColors: false,
        backgroundColor: 'rgba(17, 24, 39, 0.8)', // gray-900 with opacity
        titleFont: {
          size: 13,
          family: 'Inter, system-ui, sans-serif',
        },
        bodyFont: {
          size: 12,
          family: 'Inter, system-ui, sans-serif',
        },
        padding: 10,
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            // Get the timestamp from original data
            const index = items[0].dataIndex * (times.length > 50 ? Math.floor(times.length / 50) : 1);
            if (index < times.length) {
              // Format the timestamp depending on timeRange
              return format(new Date(times[index]), 'PPpp');
            }
            return '';
          },
          label: (context) => {
            return `${currencySymbol}${context.parsed.y.toLocaleString(undefined, { 
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}`;
          },
        },
      },
      filler: {
        propagate: true, // Important for area charts
      },
    },
    hover: {
      mode: 'nearest',
      intersect: false,
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8, // Limit number of ticks to avoid overcrowding
          font: {
            size: 10,
            family: 'Inter, system-ui, sans-serif',
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.6)', // slate-200 with opacity
        },
        ticks: {
          // Include a currency symbol in the ticks
          callback: function(value) {
            return currencySymbol + value.toLocaleString();
          },
          font: {
            size: 10,
            family: 'Inter, system-ui, sans-serif',
          },
        },
        // Ensure y-axis always starts from 0
        // But only if the minimum value is greater than 0
        // This helps to see trend clearly without distortion
        suggestedMin: Math.min(...chartData.datasets[0].data) * 0.9,
      },
    },
    animations: {
      radius: {
        duration: 400,
        easing: 'linear',
      },
    },
  }), [times, timeRange, showLegend, currencySymbol, chartData.datasets]);

  // Show a loading state if data is being fetched
  if (isLoading) {
    return (
      <div className={`w-full h-${height} flex items-center justify-center ${className}`}>
        <div className="flex flex-col items-center space-y-2">
          <svg className="animate-spin h-6 w-6 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-sm text-gray-500">Loading performance data...</span>
        </div>
      </div>
    );
  }

  // Show empty state if no data is available
  if (!times?.length || !values?.length) {
    return (
      <div className={`w-full h-${height} flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium">No performance data</h3>
          <p className="mt-1 text-sm text-gray-500">Start tracking your portfolio to see performance data.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`w-full ${className}`} style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} height={height} />
    </div>
  );
};

export default PerformanceChart;
