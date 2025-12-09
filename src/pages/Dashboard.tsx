import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { TrendingUp, ShoppingCart, DollarSign, Users } from 'lucide-react';

export default function Dashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get('/admin/stats');
      return response.data;
    },
  });

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats?.revenue ? `$${(stats.revenue / 100).toFixed(2)}` : '$0.00',
      change: '+12.5%',
      icon: DollarSign,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: 'Total Orders',
      value: stats?.orders || 0,
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Active Designs',
      value: stats?.designs || 0,
      change: '+4.3%',
      icon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: 'Total Users',
      value: stats?.users || 0,
      change: '+15.1%',
      icon: Users,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`${stat.bg} p-3 rounded-lg`}>
                  <Icon className={stat.color} size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="text-sm text-gray-500">No recent orders</div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Popular Designs</h2>
          <div className="text-sm text-gray-500">No data available</div>
        </div>
      </div>
    </div>
  );
}
