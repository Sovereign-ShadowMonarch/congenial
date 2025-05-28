import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AssetDistributionItem {
  asset: string;
  percentage: string;
  usd_value: string;
}

interface AssetAllocationChartProps {
  distribution: AssetDistributionItem[];
  isLoading?: boolean;
}

// Array of colors for the pie chart sections
const COLORS = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#6366F1', // indigo-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#14B8A6', // teal-500
  '#F97316', // orange-500
  '#06B6D4', // cyan-500
];

const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({ 
  distribution, 
  isLoading = false 
}) => {
  // Process the data for the pie chart
  const chartData = useMemo(() => {
    // Take top 9 assets and group the rest as "Others"
    let result = [];
    let otherValue = 0;
    let otherPercentage = 0;

    distribution.forEach((item, index) => {
      const value = parseFloat(item.usd_value);
      const percentage = parseFloat(item.percentage);

      if (index < 9) {
        result.push({
          name: item.asset,
          value,
          percentage,
        });
      } else {
        otherValue += value;
        otherPercentage += percentage;
      }
    });

    // Add "Others" category if there are more than 9 assets
    if (otherValue > 0) {
      result.push({
        name: 'Others',
        value: otherValue,
        percentage: otherPercentage,
      });
    }

    return result;
  }, [distribution]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="card bg-base-100 shadow-xl p-2">
          <div className="font-bold">{data.name}</div>
          <div>
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 2,
            }).format(data.value)}
          </div>
          <div>{data.percentage.toFixed(2)}%</div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">Asset Allocation</h2>
          <div className="animate-pulse flex flex-col items-center justify-center h-64">
            <div className="rounded-full bg-base-200 h-48 w-48"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Asset Allocation</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocationChart;
