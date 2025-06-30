import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/api';
import { 
  Users, 
  UserCheck, 
  Bus, 
  Navigation, 
  MapPin, 
  Calendar,
  TrendingUp,
  Activity,
  Clock,
  AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

interface Stats {
  buses: number;
  routes: number;
  users: number;
  schedules: number;
  pickupPoints: number;
  userInterests: number;
}

interface UserStats {
  activeUsers: number;
  activeDrivers: number;
  activeAdmins: number;
  inactiveUsers: number;
  totalUsers: number;
}

export default function Dashboard() {
  const { theme } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [statsResponse, userStatsResponse] = await Promise.all([
        apiService.getStats(),
        apiService.getUserStats(),
      ]);
      
      setStats(statsResponse.stats);
      setUserStats(userStatsResponse.stats);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: userStats?.totalUsers || 0,
      icon: Users,
      color: theme.primary,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Drivers',
      value: userStats?.activeDrivers || 0,
      icon: UserCheck,
      color: theme.success,
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Buses',
      value: stats?.buses || 0,
      icon: Bus,
      color: theme.warning,
      change: '+2%',
      changeType: 'positive' as const,
    },
    {
      title: 'Active Routes',
      value: stats?.routes || 0,
      icon: Navigation,
      color: theme.secondary,
      change: '0%',
      changeType: 'neutral' as const,
    },
    {
      title: 'Pickup Points',
      value: stats?.pickupPoints || 0,
      icon: MapPin,
      color: theme.primary,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'User Interests',
      value: stats?.userInterests || 0,
      icon: Activity,
      color: theme.success,
      change: '+25%',
      changeType: 'positive' as const,
    },
  ];

  // Mock data for charts
  const weeklyData = [
    { name: 'Mon', users: 120, trips: 45 },
    { name: 'Tue', users: 150, trips: 52 },
    { name: 'Wed', users: 180, trips: 48 },
    { name: 'Thu', users: 165, trips: 61 },
    { name: 'Fri', users: 200, trips: 55 },
    { name: 'Sat', users: 250, trips: 67 },
    { name: 'Sun', users: 180, trips: 43 },
  ];

  const userDistribution = [
    { name: 'Regular Users', value: userStats?.activeUsers || 0, color: theme.primary },
    { name: 'Drivers', value: userStats?.activeDrivers || 0, color: theme.success },
    { name: 'Admins', value: userStats?.activeAdmins || 0, color: theme.warning },
    { name: 'Inactive', value: userStats?.inactiveUsers || 0, color: theme.textSecondary },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle size={48} style={{ color: theme.error }} className="mx-auto mb-4" />
          <p style={{ color: theme.error }} className="text-lg font-semibold mb-2">
            Error Loading Dashboard
          </p>
          <p style={{ color: theme.textSecondary }} className="mb-4">
            {error}
          </p>
          <button
            onClick={fetchDashboardData}
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
          Dashboard Overview
        </h1>
        <p style={{ color: theme.textSecondary }}>
          Welcome to your Ridra admin dashboard. Here's what's happening today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card fade-in">
              <div className="card-body">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium" style={{ color: theme.textSecondary }}>
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold mt-1" style={{ color: theme.text }}>
                      {stat.value.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <span 
                        className={`text-xs font-medium ${
                          stat.changeType === 'positive' ? 'text-success' : 
                          stat.changeType === 'neutral' ? 'text-muted' : 'text-error'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-xs ml-1" style={{ color: theme.textSecondary }}>
                        from last week
                      </span>
                    </div>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: stat.color + '20' }}
                  >
                    <Icon size={24} style={{ color: stat.color }} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
              Weekly Activity
            </h3>
            <p style={{ color: theme.textSecondary }}>
              User activity and trips over the past week
            </p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.border} />
                <XAxis dataKey="name" stroke={theme.textSecondary} />
                <YAxis stroke={theme.textSecondary} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    color: theme.text,
                  }}
                />
                <Bar dataKey="users" fill={theme.primary} name="Users" />
                <Bar dataKey="trips" fill={theme.success} name="Trips" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Distribution Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
              User Distribution
            </h3>
            <p style={{ color: theme.textSecondary }}>
              Breakdown of users by role and status
            </p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme.surface,
                    border: `1px solid ${theme.border}`,
                    borderRadius: '8px',
                    color: theme.text,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-4">
              {userDistribution.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm" style={{ color: theme.textSecondary }}>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
            Recent Activity
          </h3>
          <p style={{ color: theme.textSecondary }}>
            Latest system activities and updates
          </p>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            {[
              { icon: Users, text: 'New user registered: John Doe', time: '2 minutes ago', type: 'user' },
              { icon: Bus, text: 'Bus RAD 123 A went online', time: '5 minutes ago', type: 'bus' },
              { icon: Navigation, text: 'Route 302 schedule updated', time: '10 minutes ago', type: 'route' },
              { icon: UserCheck, text: 'Driver assigned to Bus RAD 456 B', time: '15 minutes ago', type: 'driver' },
              { icon: MapPin, text: 'New pickup point added to Route 305', time: '20 minutes ago', type: 'pickup' },
            ].map((activity, index) => {
              const Icon = activity.icon;
              return (
                <div key={index} className="flex items-center p-3 rounded-lg" style={{ backgroundColor: theme.surface }}>
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
                    style={{ backgroundColor: theme.primary + '20' }}
                  >
                    <Icon size={16} style={{ color: theme.primary }} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: theme.text }}>
                      {activity.text}
                    </p>
                    <p className="text-xs" style={{ color: theme.textSecondary }}>
                      {activity.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}