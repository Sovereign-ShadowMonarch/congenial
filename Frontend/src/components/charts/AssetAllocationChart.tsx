import React, { useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, ChartData } from 'chart.js';
import { ValueDistribution } from '@/store/apis/portfolioApi';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

// Register required ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface AssetAllocationChartProps {
  data: ValueDistribution[];
  height?: number;
  showLegend?: boolean;
  className?: string;
}

/**
 * Displays asset allocation data in a doughnut chart
 * Optimized for performance and visual consistency
 */
export const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
  data,
  height = 250,
  showLegend = true,
  className = '',
}) => {
  // Get current currency from redux store
  const { currency } = useSelector((state: RootState) => state.ui);
  
  // Format data for chart display
  const chartData = useMemo(() => {
    // Ensure we have data to display
    if (!data || data.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            data: [1],
            backgroundColor: ['#E5E7EB'],
            borderColor: ['#F3F4F6'],
            borderWidth: 1,
            hoverOffset: 4,
          },
        ],
      };
    }
    
    // Get top assets (show top 5, group the rest as "Others")
    const TOP_ASSETS_COUNT = 5;
    const sortedData = [...data].sort((a, b) => parseFloat(b.value) - parseFloat(a.value));
    
    let chartData: ChartData<'doughnut'>;
    
    // Standard palette for consistent branding
    const colorPalette = [
      '#4F46E5', // Indigo-600
      '#8B5CF6', // Violet-500
      '#EC4899', // Pink-500
      '#F43F5E', // Rose-500
      '#10B981', // Emerald-500
      '#6B7280', // Gray-500 (for Others)
    ];
    
    if (sortedData.length > TOP_ASSETS_COUNT) {
      // Show top assets and group others
      const topAssets = sortedData.slice(0, TOP_ASSETS_COUNT);
      const otherAssets = sortedData.slice(TOP_ASSETS_COUNT);
      
      // Calculate total for "Others" category
      const othersValue = otherAssets.reduce((sum, asset) => sum + parseFloat(asset.value), 0);
      
      chartData = {
        labels: [...topAssets.map(asset => asset.name), 'Others'],
        datasets: [
          {
            data: [...topAssets.map(asset => parseFloat(asset.value)), othersValue],
            backgroundColor: colorPalette,
            borderColor: '#F3F4F6',
            borderWidth: 1,
            hoverOffset: 4,
          },
        ],
      };
    } else {
      // Show all assets if 5 or fewer
      chartData = {
        labels: sortedData.map(asset => asset.name),
        datasets: [
          {
            data: sortedData.map(asset => parseFloat(asset.value)),
            backgroundColor: colorPalette.slice(0, sortedData.length),
            borderColor: '#F3F4F6',
            borderWidth: 1,
            hoverOffset: 4,
          },
        ],
      };
    }
    
    return chartData;
  }, [data]);

  // Currency symbol mapping
  const getCurrencySymbol = (currencyCode: string): string => {
    switch(currencyCode) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'BTC': return '₿';
      case 'ETH': return 'Ξ';
      default: return '$';
    }
  };

  // Chart configuration options
  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
          },
          padding: 16,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleFont: {
          size: 13,
          family: 'Inter, system-ui, sans-serif',
        },
        bodyFont: {
          size: 12,
          family: 'Inter, system-ui, sans-serif',
        },
        padding: 12,
        cornerRadius: 6,
        displayColors: true,
        callbacks: {
          label: (context: any) => {
            // Safe access to context data with defaults
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0) || 1;
            const percentage = ((value / total) * 100).toFixed(1);
            const currencySymbol = getCurrencySymbol(currency);
            
            // Ensure formatting works in all locales
            return `${context.label}: ${currencySymbol}${value.toLocaleString()} (${percentage}%)`;
          },
        },
      },
    },
    cutout: '70%', // Doughnut hole size
    animation: {
      animateScale: true,
      animateRotate: true
    },
  }), [showLegend, currency]);

  // Render loading state if no data
  if (!data) {
    return (
      <div className={`w-full h-${height} flex items-center justify-center ${className}`}>
        <div className="text-gray-400">Loading allocation data...</div>
      </div>
    );
  }

  return (
    <div className={`w-full relative ${className}`} style={{ height: `${height}px` }}>
      <Doughnut data={chartData} options={options} />
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
          No allocation data available
        </div>
      )}
    </div>
  );
};

export default AssetAllocationChart;
