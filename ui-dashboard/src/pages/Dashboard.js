import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  TrendingDown, 
  Zap, 
  Wind,
  AlertCircle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Globe,
  Calendar
} from 'lucide-react';
import { api, handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { format } from 'date-fns';

const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [recentPipelines, setRecentPipelines] = useState([]);
  const [optimizations, setOptimizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [metricsRes, optimizationsRes] = await Promise.all([
        api.get('/metrics/summary'),
        api.get('/optimizations?limit=10')
      ]);

      setMetrics(metricsRes.data.data);
      setOptimizations(optimizationsRes.data.data);

      // Fetch real metrics for chart
      const metricsListRes = await api.get('/metrics?limit=30');
      setRecentPipelines(metricsListRes.data.data);

    } catch (error) {
      handleApiError(error);
      // Fallback to empty arrays
      setMetrics({ totalPipelines: 0, totalCO2: 0, averageScore: 0, totalEnergy: 0, projects: 0 });
      setOptimizations([]);
      setRecentPipelines([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time sustainability metrics for your CI/CD pipelines</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
            {['24h', '7d', '30d'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range
                    ? 'bg-emerald-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
          <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Wind className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="flex items-center text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowDown className="w-3 h-3 mr-1" />
              12.5%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Total CO₂ Emissions</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-bold text-gray-800">{metrics?.totalCO2 || 0} kg</p>
            <p className="ml-2 text-sm text-gray-500">this period</p>
          </div>
          <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-emerald-500 rounded-full"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">75% of monthly target</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Zap className="w-6 h-6 text-blue-600" />
            </div>
            <span className="flex items-center text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <ArrowUp className="w-3 h-3 mr-1" />
              8.2%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Energy Consumed</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.totalEnergy || 0} kWh</p>
          <div className="mt-4 flex items-center text-sm">
            <Globe className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-gray-600">Grid intensity: 0.475 kgCO₂/kWh</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <TrendingDown className="w-6 h-6 text-purple-600" />
            </div>
            <span className="flex items-center text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
              Grade {metrics?.averageScore >= 90 ? 'A' : 
                     metrics?.averageScore >= 75 ? 'B' : 
                     metrics?.averageScore >= 60 ? 'C' : 'D'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Average Eco Score</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics?.averageScore || 0}/100</p>
          <div className="mt-4 flex items-center">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  metrics?.averageScore >= 80 ? 'bg-emerald-500' :
                  metrics?.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics?.averageScore || 0}%` }}
              ></div>
            </div>
            <span className="ml-3 text-sm text-gray-600">Target: 85</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white"
        >
          <h3 className="text-emerald-100 text-sm font-medium mb-2">Agent Insight</h3>
          <p className="text-xl font-semibold leading-snug">
            {optimizations.filter(o => o.status === 'pending').length} pending optimizations available
          </p>
          <div className="mt-4 flex items-center space-x-2">
            <div className="flex-1 h-2 bg-emerald-500/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full"
                style={{ width: `${(optimizations.filter(o => o.status === 'completed').length / optimizations.length) * 100 || 0}%` }}
              ></div>
            </div>
            <span className="text-sm text-emerald-100">
              {optimizations.filter(o => o.status === 'completed').length}/{optimizations.length} complete
            </span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emissions Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Emissions Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recentPipelines}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={(time) => time ? format(new Date(time), 'MMM dd') : ''}
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    padding: '12px'
                  }}
                  labelStyle={{ color: '#9ca3af' }}
                  formatter={(value) => [`${value} kg`, 'CO₂']}
                  labelFormatter={(label) => label ? format(new Date(label), 'MMM dd, yyyy HH:mm') : ''}
                />
                <Area 
                  type="monotone" 
                  dataKey="co2kg" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorCo2)" 
                  name="CO₂ Emissions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Pipelines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Recent Pipelines</h3>
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {recentPipelines.slice(0, 10).map((pipeline, index) => (
              <motion.div
                key={pipeline.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  {pipeline.status === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : pipeline.status === 'failed' ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-800">{pipeline.projectId || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{formatDuration(pipeline.duration)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                    pipeline.grade === 'A' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                    pipeline.grade === 'B' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                    pipeline.grade === 'C' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                    pipeline.grade === 'D' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                    'bg-red-100 text-red-700 border-red-200'
                  }`}>
                    Grade {pipeline.grade}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{pipeline.co2kg} kg CO₂</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Optimizations Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Recent Optimizations</h3>
          <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            View all
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Title</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Project</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Impact</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Savings</th>
              </tr>
            </thead>
            <tbody>
              {optimizations.slice(0, 5).map((opt, index) => (
                <motion.tr
                  key={opt.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm text-gray-800">{opt.title}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{opt.projectName || opt.projectId}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      opt.impact === 'high' ? 'bg-red-100 text-red-700' :
                      opt.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {opt.impact}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      opt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      opt.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {opt.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">{opt.estimatedSavings} kg CO₂</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;