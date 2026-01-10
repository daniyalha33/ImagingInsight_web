import { Card } from '../../ui/card';
import { Brain, TrendingUp, Target, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AnalyticsScreen() {
  const aiModelStats = [
    { label: 'Model Accuracy', value: '94.2%', icon: Target, color: 'green' },
    { label: 'Processing Speed', value: '1.2s', icon: Zap, color: 'blue' },
    { label: 'Predictions Made', value: '12,450', icon: Brain, color: 'purple' },
    { label: 'Success Rate', value: '92.8%', icon: TrendingUp, color: 'amber' },
  ];

  const segmentationAccuracy = [
    { organ: 'Liver', accuracy: 95.2 },
    { organ: 'Kidney', accuracy: 93.8 },
    { organ: 'Spleen', accuracy: 92.5 },
    { organ: 'Pancreas', accuracy: 89.3 },
  ];

  const getColorClass = (color: string) => {
    const colors: any = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600',
    };
    return colors[color];
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-blue-600 text-white p-6 rounded-lg mb-8 shadow-md">
          <h1 className="text-white mb-2">AI Model Analytics</h1>
          <p className="text-muted-foreground">Monitor AI model performance and metrics</p>
        </div>

        {/* AI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {aiModelStats.map((stat) => (
            <Card key={stat.label} className="p-6 border-blue-100">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${getColorClass(stat.color)}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h2 className="text-blue-900 mb-1">{stat.value}</h2>
              <p className="text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Segmentation Accuracy by Organ */}
        <Card className="p-6 border-blue-100 mb-6">
          <h3 className="text-blue-900 mb-4">Segmentation Accuracy by Organ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={segmentationAccuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="organ" stroke="#64748b" />
              <YAxis domain={[85, 100]} stroke="#64748b" />
              <Tooltip />
              <Bar dataKey="accuracy" fill="#2563eb" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Model Details */}
        <Card className="p-6 border-blue-100">
          <h3 className="text-blue-900 mb-4">Model Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-muted-foreground mb-1">Model Name</p>
              <p className="text-foreground">UNet-3d</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Last Updated</p>
              <p className="text-foreground">Oct 1, 2025</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Training Dataset</p>
              <p className="text-foreground">15,000 scans</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Validation Set</p>
              <p className="text-foreground">3,000 scans</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
