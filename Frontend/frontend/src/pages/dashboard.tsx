import React from 'react';
import { useQuery } from '@tanstack/react-query';
import Layout from '@/components/Layout/Layout';
import NetWorthCard from '@/components/dashboard/NetWorthCard';
import AssetAllocationChart from '@/components/dashboard/AssetAllocationChart';
import PerformanceChart from '@/components/dashboard/PerformanceChart';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import { portfolioApi } from '@/api/portfolio';
import { assetsApi } from '@/api/assets';

const Dashboard: React.FC = () => {
  // Fetch portfolio summary
  const { data: portfolioSummary, isLoading: isLoadingPortfolio } = useQuery({
    queryKey: ['portfolioSummary'],
    queryFn: () => portfolioApi.getPortfolioSummary(),
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch value distribution for asset allocation chart
  const { data: valueDistribution, isLoading: isLoadingDistribution } = useQuery({
    queryKey: ['valueDistribution'],
    queryFn: () => portfolioApi.getValueDistribution('asset'),
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch net value statistics for performance chart
  const { data: netValueStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['netValueStatistics'],
    queryFn: () => portfolioApi.getNetValueStatistics(),
    staleTime: 60 * 1000, // 1 minute
  });

  // Prepare data for performance chart
  const performanceData = React.useMemo(() => {
    if (!netValueStats || !netValueStats.times) {
      return [];
    }

    return netValueStats.times.map((time, index) => ({
      time,
      value: parseFloat(netValueStats.data[index] || '0'),
    }));
  }, [netValueStats]);

  // Extract values from portfolio summary
  const netWorth = portfolioSummary?.result?.total_value_usd || 0;
  const change24h = portfolioSummary?.result?.total_pnl_24h || 0;
  const distribution = valueDistribution?.distribution || [];

  return (
    <ProtectedRoute>
      <Layout title="Dashboard">
        <div className="py-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Net Worth Card */}
            <div className="lg:col-span-1">
              <NetWorthCard
                netWorth={netWorth}
                change24h={change24h}
                isLoading={isLoadingPortfolio}
              />
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Recent Activity</h2>
                  <div className="overflow-x-auto">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Asset</th>
                          <th>Amount</th>
                          <th>Value</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* Placeholder for recent transactions - would be fetched in a real implementation */}
                        <tr className="hover">
                          <td>{new Date().toLocaleDateString()}</td>
                          <td>
                            <div className="badge badge-success">Buy</div>
                          </td>
                          <td>BTC</td>
                          <td>0.25</td>
                          <td>$12,500</td>
                        </tr>
                        <tr className="hover">
                          <td>{new Date(Date.now() - 86400000).toLocaleDateString()}</td>
                          <td>
                            <div className="badge badge-error">Sell</div>
                          </td>
                          <td>ETH</td>
                          <td>2.5</td>
                          <td>$6,000</td>
                        </tr>
                        <tr className="hover">
                          <td>{new Date(Date.now() - 172800000).toLocaleDateString()}</td>
                          <td>
                            <div className="badge badge-info">Transfer</div>
                          </td>
                          <td>SOL</td>
                          <td>50</td>
                          <td>$6,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="card-actions justify-end mt-4">
                    <button className="btn btn-primary btn-sm">View All Transactions</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Asset Allocation Chart */}
            <div>
              <AssetAllocationChart
                distribution={distribution}
                isLoading={isLoadingDistribution}
              />
            </div>

            {/* Performance Chart */}
            <div>
              <PerformanceChart
                data={performanceData}
                isLoading={isLoadingStats}
              />
            </div>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  );
};

export default Dashboard;
