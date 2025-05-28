import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';

interface PerformanceChartProps {
  data: Array<{ time: number; value: number }>;
  isLoading?: boolean;
}

type TimeRange = '1W' | '1M' | '3M' | '1Y' | 'ALL';

const PerformanceChart: React.FC<PerformanceChartProps> = ({ 
  data,
  isLoading = false 
}) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');

  // Filter data based on selected time range
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) {
      return [];
    }

    const now = Date.now();
    let startTime: number;

    switch (timeRange) {
      case '1W':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '1M':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '3M':
        startTime = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case '1Y':
        startTime = now - 365 * 24 * 60 * 60 * 1000;
        break;
      case 'ALL':
      default:
        return data;
    }

    return data.filter(point => point.time >= startTime);
  }, [data, timeRange]);

  // Format chart data
  const chartData = React.useMemo(() => {
    return filteredData.map(point => ({
      date: new Date(point.time * 1000).toLocaleDateString(),
      value: point.value,
      timestamp: point.time,
    }));
  }, [filteredData]);

  // Format tooltip values
  const formatValue = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card bg-base-100 shadow-xl p-2">
          <p className="font-bold">{label}</p>
          <p className="text-primary">
            {formatValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="flex justify-between items-center mb-4">
            <h2 className="card-title">Portfolio Performance</h2>
            <div className="animate-pulse bg-base-200 h-8 w-48 rounded"></div>
          </div>
          <div className="animate-pulse flex flex-col space-y-4 h-64">
            <div className="h-full bg-base-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title">Portfolio Performance</h2>
          <div className="btn-group">
            {(['1W', '1M', '3M', '1Y', 'ALL'] as TimeRange[]).map(range => (
              <button
                key={range}
                className={`btn btn-sm ${timeRange === range ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTimeRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis 
                dataKey="date"
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis 
                tickFormatter={formatValue}
                width={80}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;
