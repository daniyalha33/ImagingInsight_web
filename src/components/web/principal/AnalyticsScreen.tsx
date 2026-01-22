import React, { useState, useEffect } from 'react';
import { Card as UICard } from '../../ui/card';
import { Brain, TrendingUp, Target, Zap, RefreshCw, Info, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Use UI Card for consistency
const Card = UICard;

// Add type definitions for state
interface StatData {
  value: number | string;
  label: string;
  color?: string;
}
interface Stats {
  modelAccuracy?: StatData;
  processingSpeed?: StatData;
  predictionsMade?: StatData;
  successRate?: StatData;
  [key: string]: StatData | undefined;
}
interface SegmentationDatum {
  organ: string;
  accuracy: number;
}
interface ModelDetails {
  modelName: string;
  architecture: string;
  lastUpdated: string;
  datasetName: string;
  trainingDataset: string;
  validationSet: string;
  averageDiceScore: string | number;
}

const Alert = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: string }) => (
  <div className={`p-4 rounded-lg ${variant === 'destructive' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-blue-50 text-blue-800 border border-blue-200'}`}>
    <div className="flex items-center gap-2">
      <AlertCircle className="w-5 h-5" />
      <div>{children}</div>
    </div>
  </div>
);

export function AnalyticsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [segmentationData, setSegmentationData] = useState<SegmentationDatum[]>([]);
  const [modelDetails, setModelDetails] = useState<ModelDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchAnalytics = async () => {
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

      // Using the combined endpoint for efficiency
      const response = await fetch('http://localhost:5000/api/ai-analytics/complete', { headers });

      if (response.status === 401) {
        throw new Error('Authentication failed. Please login again.');
      }

      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }

      const result = await response.json();

      if (result.success && result.data) {
        setStats(result.data.stats);
        setSegmentationData(result.data.segmentationAccuracy);
        setModelDetails(result.data.modelDetails);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : String(err));
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      green: 'bg-green-100 text-green-600',
      blue: 'bg-blue-100 text-blue-600',
      purple: 'bg-purple-100 text-purple-600',
      amber: 'bg-amber-100 text-amber-600',
    };
    return colors[color] || colors.blue;
  };

  const statsConfig = [
    { key: 'modelAccuracy', icon: Target },
    { key: 'processingSpeed', icon: Zap },
    { key: 'predictionsMade', icon: Brain },
    { key: 'successRate', icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading AI analytics...</p>
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
            <p className="font-semibold">Error loading analytics</p>
            <p className="text-sm mt-1">{error}</p>
            <button 
              onClick={fetchAnalytics}
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 rounded-lg mb-8 shadow-md flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Model Analytics</h1>
            <p className="text-blue-100 mt-1">Monitor AI model performance and metrics</p>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={refreshing}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* AI Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsConfig.map((config) => {
            const statData = stats?.[config.key];
            if (!statData) return null;

            return (
              <Card key={config.key} className="p-6 border-blue-100 hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${getColorClass(statData.color ?? '')}`}>
                  <config.icon className="w-6 h-6" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">{String(statData.value)}</h2>
                <p className="text-gray-600 text-sm">{statData.label ?? ''}</p>
              </Card>
            );
          })}
        </div>

        {/* Segmentation Accuracy by Organ */}
        <Card className="p-6 border-blue-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Segmentation Accuracy by Organ</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Info className="w-4 h-4" />
              <span>Based on Dice Score metrics</span>
            </div>
          </div>
          {segmentationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={segmentationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[80, 100]} stroke="#64748b" style={{ fontSize: '12px' }} />
                <YAxis 
                  dataKey="organ" 
                  type="category" 
                  width={180} 
                  stroke="#64748b" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value) => [`${value}%`, 'Accuracy']}
                />
                <Bar dataKey="accuracy" fill="#2563eb" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-gray-500">
              No segmentation data available
            </div>
          )}
        </Card>

        {/* Model Details */}
        {modelDetails && (
          <Card className="p-6 border-blue-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Model Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Model Name</p>
                <p className="text-gray-900 font-semibold">{modelDetails.modelName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Architecture</p>
                <p className="text-gray-900 font-semibold">{modelDetails.architecture}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Last Updated</p>
                <p className="text-gray-900 font-semibold">{modelDetails.lastUpdated}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Dataset</p>
                <p className="text-gray-900 font-semibold">{modelDetails.datasetName}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Training Scans</p>
                <p className="text-gray-900 font-semibold">{modelDetails.trainingDataset}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Validation Set</p>
                <p className="text-gray-900 font-semibold">{modelDetails.validationSet}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Avg Dice Score</p>
                <p className="text-gray-900 font-semibold">{String(modelDetails.averageDiceScore)}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-1">Success Rate</p>
                <p className="text-gray-900 font-semibold">{String(stats?.successRate?.value ?? '')}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">About This Model</p>
              <p>
                This UNet-3D model was trained on the BTCV (Beyond The Cranial Vault) dataset 
                for multi-organ segmentation. It achieved a best validation loss of 0.0510 after 
                15 epochs and demonstrates high accuracy across 13 different organs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsScreen;