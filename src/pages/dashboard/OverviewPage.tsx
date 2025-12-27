import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, ShoppingCart, DollarSign, TrendingUp, 
  TrendingDown, Clock, Star, Users, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useAuthStore } from '../../store/authStore';
import { useDashboardStore } from '../../store/dashboardStore';

const OverviewPage = () => {
  const { currentLocation } = useAuthStore();
  const { analytics, fetchAnalytics, isLoading } = useDashboardStore();

  useEffect(() => {
    if (currentLocation) {
      fetchAnalytics(currentLocation.id);
    }
  }, [currentLocation, fetchAnalytics]);

  // Transform analytics data for charts
  const viewsData = useMemo(() => {
    if (!analytics?.viewsData || analytics.viewsData.length === 0) {
      // Return empty array with placeholder if no data
      return [];
    }
    return analytics.viewsData;
  }, [analytics]);

  const categoryData = useMemo(() => {
    if (!analytics?.categoryOrderData || analytics.categoryOrderData.length === 0) {
      // Fallback to categoryPerformance if categoryOrderData is not available
      if (!analytics?.categoryPerformance) return [];
      return analytics.categoryPerformance.map(cat => ({
        name: cat.categoryName,
        orders: cat.orders || 0,
      }));
    }
    return analytics.categoryOrderData.map(cat => ({
      name: cat.name,
      orders: cat.orders,
    }));
  }, [analytics]);

  const stats = useMemo(() => {
    if (!analytics) {
      return [
        {
          label: 'Total Views',
          value: '0',
          change: 0,
          icon: Eye,
          color: 'blue'
        },
        {
          label: 'Orders',
          value: '0',
          change: 0,
          icon: ShoppingCart,
          color: 'green'
        },
        {
          label: 'Revenue',
          value: '$0',
          change: 0,
          icon: DollarSign,
          color: 'purple'
        },
        {
          label: 'Avg. Order',
          value: '$0.00',
          change: 0,
          icon: TrendingUp,
          color: 'orange'
        }
      ];
    }

    // Get values from analytics API response
    const totalOrders = analytics.totalOrders || 0;
    const totalRevenue = analytics.totalRevenue || 0;
    const avgOrderValue = analytics.averageOrderValue || 0;

    return [
      {
        label: 'Total Views',
        value: analytics.totalViews.toLocaleString(),
        change: analytics.periodComparison.viewsChange || 0,
        icon: Eye,
        color: 'blue'
      },
      {
        label: 'Orders',
        value: totalOrders.toLocaleString(),
        change: analytics.periodComparison.ordersChange || 0,
        icon: ShoppingCart,
        color: 'green'
      },
      {
        label: 'Revenue',
        value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: analytics.periodComparison.revenueChange || 0,
        icon: DollarSign,
        color: 'purple'
      },
      {
        label: 'Avg. Order',
        value: `$${avgOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        change: 0,
        icon: TrendingUp,
        color: 'orange'
      }
    ];
  }, [analytics]);

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-dark-900 font-serif">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">
          Welcome back! Here's what's happening with {currentLocation?.name || 'your restaurant'}.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg bg-${stat.color}-50`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div className={`flex items-center text-sm font-semibold ${
                  isPositive ? 'text-green-600' : 'text-red-600'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {Math.abs(stat.change)}%
                </div>
              </div>
              <h3 className="text-2xl font-bold text-dark-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Views & Orders Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-bold text-dark-900 mb-4">Views & Orders</h3>
          {isLoading || viewsData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={viewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px' 
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="views" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#10b981" 
                strokeWidth={2} 
                dot={{ fill: '#10b981', r: 4 }}
              />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-bold text-dark-900 mb-4">Orders by Category</h3>
          {isLoading || categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[300px]">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '8px' 
                }} 
              />
              <Bar dataKey="orders" fill="#f59e0b" radius={[8, 8, 0, 0]}               />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Popular Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            Popular Items
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : analytics?.popularItems && analytics.popularItems.length > 0 ? (
            <div className="space-y-3">
              {analytics.popularItems.map((item, index) => (
              <div key={item.itemId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-gray-400">#{index + 1}</span>
                  <div>
                    <p className="font-semibold text-dark-900">{item.itemName}</p>
                    <p className="text-sm text-gray-600">{item.views.toLocaleString()} views</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary-600">{item.orders} orders</p>
                  <p className="text-xs text-gray-500">
                    {item.orders && item.views ? ((item.orders / item.views) * 100).toFixed(1) : '0'}% conv.
                  </p>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Star className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No popular items data available</p>
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
        >
          <h3 className="text-lg font-bold text-dark-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 text-gray-400 mr-2" />
            Recent Activity
          </h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
            </div>
          ) : analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${
                  activity.type === 'order' 
                    ? 'bg-green-50' 
                    : activity.type === 'view' 
                    ? 'bg-blue-50' 
                    : 'bg-orange-50'
                }`}>
                  {activity.type === 'order' ? (
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                  ) : activity.type === 'view' ? (
                    <Eye className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Users className="w-4 h-4 text-orange-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent activity</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default OverviewPage;

