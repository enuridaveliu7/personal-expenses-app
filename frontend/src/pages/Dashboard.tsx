import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BalanceSummary, ChartData } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, DollarSign, Receipt} from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [balance, setBalance] = useState<BalanceSummary | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [balanceRes, chartRes, statsRes] = await Promise.all([
        api.get('/dashboard/balance'),
        api.get('/dashboard/charts'),
        api.get('/dashboard/statistics'),
      ]);

      setBalance(balanceRes.data.data);
      setChartData(chartRes.data.data);
      setStatistics(statsRes.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  const lineChartData = chartData?.monthlyTrends
    ? {
        labels: chartData.monthlyTrends.map((item) => item.month),
        datasets: [
          {
            label: 'Income',
            data: chartData.monthlyTrends.map((item) => item.income),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
          },
          {
            label: 'Expenses',
            data: chartData.monthlyTrends.map((item) => item.expense),
            borderColor: 'rgb(239, 68, 68)',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
          },
        ],
      }
    : null;

  const barChartData = chartData?.incomeExpenseComparison
    ? {
        labels: chartData.incomeExpenseComparison.map((item) => item.month),
        datasets: [
          {
            label: 'Income',
            data: chartData.incomeExpenseComparison.map((item) => item.income),
            backgroundColor: 'rgba(34, 197, 94, 0.8)',
          },
          {
            label: 'Expenses',
            data: chartData.incomeExpenseComparison.map((item) => item.expense),
            backgroundColor: 'rgba(239, 68, 68, 0.8)',
          },
        ],
      }
    : null;

  const doughnutData = chartData?.categoryBreakdown
    ? {
        labels: chartData.categoryBreakdown.map((item) => item.name),
        datasets: [
          {
            data: chartData.categoryBreakdown.map((item) => item.amount),
            backgroundColor: chartData.categoryBreakdown.map(
              (item, index) =>
                item.color ||
                `hsl(${(index * 360) / chartData.categoryBreakdown.length}, 70%, 50%)`
            ),
          },
        ],
      }
    : null;

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Overview of your finances</p>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border border-[#e4ebe4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Income
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-[#6f8f72]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#6f8f72]">
              ${balance?.totalIncome.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4ebe4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Expenses
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              ${balance?.totalExpenses.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-[#e4ebe4] shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Balance
            </CardTitle>
            <DollarSign className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                (balance?.balance || 0) >= 0 ? 'text-[#6f8f72]' : 'text-red-500'
              }`}
            >
              ${balance?.balance.toFixed(2) || '0.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border border-[#e4ebe4] shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Transactions
              </CardTitle>
              <Receipt className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                {statistics.totalTransactions}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4ebe4] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Income Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#6f8f72]">
                {statistics.incomeCount}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4ebe4] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Expense Count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">
                {statistics.expenseCount}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#e4ebe4] shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Top Categories
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-800">
                {statistics.topCategories?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        {lineChartData && (
          <Card className="border border-[#e4ebe4] shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-700">Monthly Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={lineChartData} />
            </CardContent>
          </Card>
        )}

        {doughnutData && (
          <Card className="border border-[#e4ebe4] shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-700">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <Doughnut data={doughnutData} />
            </CardContent>
          </Card>
        )}
      </div>

      {barChartData && (
        <Card className="border border-[#e4ebe4] shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-700">
              Income vs Expenses Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Bar data={barChartData} />
          </CardContent>
        </Card>
      )}

      {/* RECENT TRANSACTIONS*/}
      {statistics?.recentTransactions && statistics.recentTransactions.length > 0 && (
        <Card className="border border-[#e4ebe4] shadow-sm">
          <CardHeader>
            <CardTitle className="text-gray-700">
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {statistics.recentTransactions.map((transaction: any) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-[#f7f9f7]"
                >
                  <div>
                    <div className="font-medium text-gray-800">
                      {transaction.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {transaction.category?.name} •{' '}
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className={`font-bold ${
                      transaction.type === 'INCOME'
                        ? 'text-[#6f8f72]'
                        : 'text-red-500'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}$
                    {transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
