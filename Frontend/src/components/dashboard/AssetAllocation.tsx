import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface AssetAllocationItem {
  asset: string;
  symbol: string;
  value: number;
  percentage: number;
  color?: string;
}

interface AssetAllocationProps {
  isLoading: boolean;
  data?: AssetAllocationItem[];
}

// Default colors for pie chart segments
const DEFAULT_COLORS = [
  '#3b82f6', // blue-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#f97316', // orange-500
  '#14b8a6', // teal-500
  '#6366f1', // indigo-500
  '#a855f7', // purple-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
];

const AssetAllocation: React.FC<AssetAllocationProps> = ({
  isLoading,
  data = []
}) => {
  const [chartData, setChartData] = useState<ChartData<'doughnut'>>({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [],
        borderColor: [],
        borderWidth: 1,
        hoverOffset: 10
      }
    ]
  });
  
  // Configuration options for Chart.js
  const chartOptions: ChartOptions<'doughnut'> = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed.toLocaleString('en-US', {
              style: 'currency',
              currency: 'USD',
            });
            const percentage = context.dataset.data[context.dataIndex] as number;
            return `${label}: ${value} (${percentage.toFixed(2)}%)`;
          }
        }
      }
    },
    cutout: '65%',
    responsive: true,
    maintainAspectRatio: false,
  };
  
  // Helper function to assign colors to assets
  const assignColorsToAssets = (allocations: AssetAllocationItem[]): AssetAllocationItem[] => {
    return allocations.map((item, index) => ({
      ...item,
      color: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
    }));
  };
  
  // Process chart data when the allocation data changes
  useEffect(() => {
    if (!isLoading && data && data.length > 0) {
      const coloredData = assignColorsToAssets(data);
      
      setChartData({
        labels: coloredData.map(item => item.symbol),
        datasets: [
          {
            data: coloredData.map(item => item.percentage),
            backgroundColor: coloredData.map(item => item.color),
            borderColor: coloredData.map(item => item.color ? 
              item.color.replace(')', ', 0.8)').replace('rgb', 'rgba') : 
              'rgba(0, 0, 0, 0.1)'
            ),
            borderWidth: 1,
            hoverOffset: 10
          }
        ]
      });
    }
  }, [isLoading, data]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="h-48 w-48 rounded-full animate-pulse bg-gray-200 dark:bg-gray-700"></div>
      </div>
    );
  }
  
  // No data state
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No asset allocation data available.
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
          Connect exchanges or add transactions to see your asset distribution.
        </p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-64">
      <div className="relative h-full">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: item.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
            />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {item.symbol}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetAllocation;
