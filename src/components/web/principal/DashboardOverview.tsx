import React, { useState, useEffect } from 'react';
import { Users, GraduationCap, ClipboardList, TrendingUp, ArrowUp, ArrowDown, RefreshCw, AlertCircle } from 'lucide-react';
import { Card as UICard } from '../../ui/card';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Card = UICard;

interface StatData {
  value: number | string;
  trend: 'up' | 'down';
  change: string;
}
interface Stats {
  totalStudents?: StatData;
  activeTeachers?: StatData;
  totalAssessments?: StatData;
  avgPerformance?: StatData;
  [key: string]: StatData | undefined;
}
interface PerformanceDatum {
  month: string;
  performance?: number;
  students?: number;
}
interface TopicProgressDatum {
  topic: string;
  progress: number;
}

const Alert = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => (
  <div className={`p-4 rounded-lg ${variant === 'destructive' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
    <div className="flex items-center gap-2">
      <AlertCircle className="w-5 h-5" />
      <div>{children}</div>
    </div>
  </div>
);

export function DashboardOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceDatum[]>([]);
  const [topicProgress, setTopicProgress] = useState<TopicProgressDatum[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      setError(null);

      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [statsRes, trendRes, topicsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/dashboard/stats', { headers }),
        fetch('http://localhost:5000/api/admin/dashboard/performance-trend', { headers }),
        fetch('http://localhost:5000/api/admin/dashboard/topic-progress', { headers })
      ]);

      if (statsRes.status === 401 || trendRes.status === 401 || topicsRes.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }

      if (!statsRes.ok || !trendRes.ok || !topicsRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const statsData = await statsRes.json();
      const trendData = await trendRes.json();
      const topicsData = await topicsRes.json();

      if (statsData.success && statsData.stats) {
        setStats(statsData.stats);
      }

      if (trendData.success && trendData.data) {
        setPerformanceData(trendData.data);
      }

      if (topicsData.success && topicsData.data) {
        setTopicProgress(topicsData.data);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getColorClass = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600',
    };
    return colors[color] || colors.blue;
  };

  const statsConfig = [
    { 
      key: 'totalStudents',
      label: 'Total Students', 
      icon: Users,
      color: 'blue'
    },
    { 
      key: 'activeTeachers',
      label: 'Active Teachers', 
      icon: GraduationCap,
      color: 'green'
    },
    { 
      key: 'totalAssessments',
      label: 'Total Assessments', 
      icon: ClipboardList,
      color: 'purple'
    },
    { 
      key: 'avgPerformance',
      label: 'Avg Performance', 
      icon: TrendingUp,
      color: 'amber'
    },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <div>
            <p className="font-semibold">Error loading dashboard</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={fetchDashboardData}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              Try Again
            </button>
          </div>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 rounded-lg bg-blue-600 text-white p-6 shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-blue-100 mt-1">Monitor your institution's performance and analytics</p>
        </div>
        <button
          onClick={fetchDashboardData}
          disabled={refreshing}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsConfig.map((config) => {
          const statData = stats?.[config.key];
          if (!statData) return null;

          return (
            <Card key={config.key} className="p-6 border-blue-100 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClass(config.color)}`}>
                  <config.icon className="w-6 h-6" />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  statData.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {statData.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  <span>{statData.change}</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">{statData.value}</h2>
              <p className="text-gray-600 text-sm">{config.label}</p>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6 border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trend</h3>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  labelStyle={{ color: '#1e293b', fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#2563eb" 
                  fill="#dbeafe" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No performance data available
            </div>
          )}
        </Card>

        <Card className="p-6 border-blue-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Learning Progress by Topic</h3>
          {topicProgress.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topicProgress} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis 
                  dataKey="topic" 
                  type="category" 
                  width={150} 
                  stroke="#64748b" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Bar dataKey="progress" fill="#2563eb" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No topic data available
            </div>
          )}
        </Card>
      </div>

      <Card className="p-6 border-blue-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Enrollment Growth</h3>
        {performanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                labelStyle={{ color: '#1e293b', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line 
                type="monotone" 
                dataKey="students" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb', r: 5 }}
                name="Students"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No enrollment data available
          </div>
        )}
      </Card>
    </div>
  );
}