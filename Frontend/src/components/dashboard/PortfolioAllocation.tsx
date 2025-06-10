import React, { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, TooltipItem } from 'chart.js';
import { useGetPortfolioAllocationQuery, PortfolioAllocationResponse } from '../../store/apis/portfolioApi';

// Register required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PortfolioAllocationProps {
  className?: string;
}

type ViewMode = 'value' | 'quantity';

const PortfolioAllocation: React.FC<PortfolioAllocationProps> = ({ className }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('value');
  
  const { 
    data, 
    isLoading, 
    isError, 
    error 
  } = useGetPortfolioAllocationQuery();

  // Generate chart data from API response
  const generateChartData = () => {
    if (!data || !data.assets || data.assets.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
            borderColor: [],
            borderWidth: 1,
          },
        ],
      };
    }

    // Get top assets (limiting to 8 for visibility) and group the rest as "Others"
    const assets = [...data.assets].sort((a, b) => 
      viewMode === 'value' 
        ? b.valueUsd - a.valueUsd 
        : b.quantity - a.quantity
    );

    const topAssets = assets.slice(0, 8);
    const otherAssets = assets.slice(8);

    let labels = topAssets.map(asset => asset.symbol);
    let values = topAssets.map(asset => 
      viewMode === 'value' ? asset.valueUsd : asset.quantity
    );
    let backgroundColors = topAssets.map(asset => asset.color || getRandomColor(asset.symbol));
    
    // Add "Others" category if there are more than 8 assets
    if (otherAssets.length > 0) {
      labels.push('Others');
      const otherValue = otherAssets.reduce(
        (sum, asset) => sum + (viewMode === 'value' ? asset.valueUsd : asset.quantity), 
        0
      );
      values.push(otherValue);
      backgroundColors.push('#CBD5E0'); // Gray for "Others"
    }

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: backgroundColors,
          borderColor: backgroundColors.map(color => adjustBrightness(color, -0.1)),
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          padding: 15,
          font: {
            size: 11,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: TooltipItem<'pie'>) {
            const value = context.parsed as number;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            if(viewMode === 'value') {
              return `${context.label}: $${value.toLocaleString()} (${percentage}%)`;
            } else {
              return `${context.label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      }
    },
  };

  // Helper function to generate random color based on string
  function getRandomColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }

  // Helper function to adjust color brightness
  function adjustBrightness(hex: string, factor: number): string {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = Math.round(r * (1 + factor));
    g = Math.round(g * (1 + factor));
    b = Math.round(b * (1 + factor));

    r = Math.max(0, Math.min(255, r));
    g = Math.max(0, Math.min(255, g));
    b = Math.max(0, Math.min(255, b));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 ${className}`}>
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Portfolio Allocation</h3>
          <div className="animate-pulse w-24 h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="flex items-center justify-center h-64 animate-pulse">
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
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Portfolio Allocation</h3>
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 text-red-700 dark:text-red-300">
          <p className="font-medium">Failed to load allocation data</p>
          <p className="text-sm mt-1">
            {(error as any)?.data?.message || (error as any)?.message || 'Unknown error occurred'}
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (!data || !data.assets || data.assets.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Portfolio Allocation</h3>
        <div className="flex flex-col items-center justify-center h-64 p-6">
          <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 text-center">
            No assets to display. Add assets to see your portfolio allocation.
          </p>
        </div>
      </div>
    );
  }

  const chartData = generateChartData();

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2 sm:mb-0">Portfolio Allocation</h3>
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              viewMode === 'value'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => setViewMode('value')}
          >
            Value
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-r border-b ${
              viewMode === 'quantity'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            onClick={() => setViewMode('quantity')}
          >
            Quantity
          </button>
        </div>
      </div>

      <div className="h-64 lg:h-80">
        <Pie data={chartData} options={chartOptions} />
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <span>Total Assets: {data.assets.length}</span>
          <span>Last Updated: {new Date(data.lastUpdated).toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAllocation;
