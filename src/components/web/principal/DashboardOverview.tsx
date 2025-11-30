import { Users, GraduationCap, ClipboardList, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { Card } from '../../ui/card';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DashboardOverview() {
  const stats = [
    { 
      label: 'Total Students', 
      value: '1,248', 
      change: '+12%', 
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    { 
      label: 'Active Teachers', 
      value: '45', 
      change: '+5%', 
      trend: 'up',
      icon: GraduationCap,
      color: 'green'
    },
    { 
      label: 'Total Assessments', 
      value: '234', 
      change: '+18%', 
      trend: 'up',
      icon: ClipboardList,
      color: 'purple'
    },
    { 
      label: 'Avg Performance', 
      value: '84.5%', 
      change: '-2%', 
      trend: 'down',
      icon: TrendingUp,
      color: 'amber'
    },
  ];

  const performanceData = [
    { month: 'Jan', performance: 78, students: 980 },
    { month: 'Feb', performance: 80, students: 1020 },
    { month: 'Mar', performance: 82, students: 1080 },
    { month: 'Apr', performance: 85, students: 1140 },
    { month: 'May', performance: 83, students: 1180 },
    { month: 'Jun', performance: 84.5, students: 1248 },
  ];

  const topicProgress = [
    { topic: 'CT Basics', progress: 92 },
    { topic: 'Liver Segmentation', progress: 85 },
    { topic: 'Kidney Analysis', progress: 78 },
    { topic: 'Spleen Detection', progress: 81 },
    { topic: 'Advanced Imaging', progress: 73 },
  ];

  const getColorClass = (color: string) => {
    const colors: any = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600',
    };
    return colors[color] || colors.blue;
  };

  return (
<div className="p-8">
  {/* Header */}
  <div className="mb-8 rounded-lg bg-blue-600 text-white p-6 shadow-md">
    <h1 className="text-2xl font-bold">Dashboard Overview</h1>
    <p className="text-blue-100 mt-1">Monitor your institution's performance and analytics</p>
  </div>

  {/* Stats Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    {stats.map((stat) => (
      <Card key={stat.label} className="p-6 border-blue-100 hover:shadow-lg transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getColorClass(stat.color)}`}>
            <stat.icon className="w-6 h-6" />
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
            stat.trend === 'up' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            <span>{stat.change}</span>
          </div>
        </div>
        <h2 className="text-blue-900 mb-1">{stat.value}</h2>
        <p className="text-muted-foreground">{stat.label}</p>
      </Card>
    ))}
  </div>


      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Performance Trend */}
        <Card className="p-6 border-blue-100">
          <h3 className="text-blue-900 mb-4">Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="performance" stroke="#2563eb" fill="#dbeafe" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Topic Progress */}
        <Card className="p-6 border-blue-100">
          <h3 className="text-blue-900 mb-4">Learning Progress by Topic</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topicProgress} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
              <YAxis dataKey="topic" type="category" width={150} stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="progress" fill="#2563eb" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Student Growth */}
      <Card className="p-6 border-blue-100">
        <h3 className="text-blue-900 mb-4">Student Enrollment Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="students" 
              stroke="#2563eb" 
              strokeWidth={2}
              dot={{ fill: '#2563eb', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
