import React, { useState, useEffect, useCallback } from 'react';
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
  Calendar,
  Download,
  Eye,
  Filter
} from 'lucide-react';
import { api, exportToCSV, exportToJSON } from '../services/api';
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
import { format, subDays, subHours, subMonths } from 'date-fns';
import PipelineDetailsModal from '../components/PipelineDetailsModal';

const Dashboard = () => {
  const [metrics, setMetrics] = useState({
    totalPipelines: 0,
    totalCO2: 0,
    averageScore: 0,
    totalEnergy: 0,
    projects: 0,
    monthlyTarget: 5.0, // 5kg monthly target
    weeklyTrend: 0,
    monthlyTrend: 0
  });
  
  const [recentPipelines, setRecentPipelines] = useState([]);
  const [optimizations, setOptimizations] = useState([]);
  const [isLoading, setIsLoading] = useState({
    metrics: true,
    pipelines: true,
    optimizations: true
  });
  
  const [timeRange, setTimeRange] = useState('7d');
  const [chartData, setChartData] = useState([]);
  const [selectedPipeline, setSelectedPipeline] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading({
      metrics: true,
      pipelines: true,
      optimizations: true
    });

    try {
      // Calculate date range
      const endDate = new Date();
      let startDate;
      
      switch (timeRange) {
        case '24h':
          startDate = subHours(endDate, 24);
          break;
        case '7d':
          startDate = subDays(endDate, 7);
          break;
        case '30d':
          startDate = subDays(endDate, 30);
          break;
        default:
          startDate = subDays(endDate, 7);
      }

      // Fetch metrics summary
      const metricsRes = await api.get('/metrics/summary');
      const metricsData = metricsRes.data.data;
      
      // Fetch all metrics for chart
      const metricsListRes = await api.get('/metrics', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });
      
      const allMetrics = metricsListRes.data.data;
      
      // Calculate trends
      const midPoint = Math.floor(allMetrics.length / 2);
      const firstHalf = allMetrics.slice(0, midPoint);
      const secondHalf = allMetrics.slice(midPoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, m) => sum + (m.co2kg || 0), 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, m) => sum + (m.co2kg || 0), 0) / secondHalf.length;
      
      const weeklyTrend = firstHalfAvg ? ((secondHalfAvg - firstHalfAvg) / firstHalfAvg * 100) : 0;
      
      // Calculate monthly target progress
      const totalCO2 = metricsData.totalCO2 || 0;
      const monthlyTarget = 5.0; // 5kg target
      const targetProgress = (totalCO2 / monthlyTarget) * 100;

      setMetrics({
        totalPipelines: metricsData.totalPipelines || 0,
        totalCO2: Number(totalCO2).toFixed(3),
        averageScore: Math.round(metricsData.averageScore || 0),
        totalEnergy: Number(metricsData.totalEnergy || 0).toFixed(3),
        projects: metricsData.projects || 0,
        monthlyTarget,
        targetProgress: Math.min(100, Math.round(targetProgress)),
        weeklyTrend: Number(weeklyTrend).toFixed(1),
        monthlyTrend: Number(weeklyTrend * 4).toFixed(1) // Approximate
      });

      // Prepare chart data
      const groupedData = groupMetricsByDate(allMetrics, timeRange);
      setChartData(groupedData);

      // Fetch recent pipelines (last 10)
      setRecentPipelines(allMetrics.slice(0, 10));

      // Fetch optimizations
      const optimizationsRes = await api.get('/optimizations?limit=10');
      setOptimizations(optimizationsRes.data.data);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load some dashboard data');
    } finally {
      setIsLoading({
        metrics: false,
        pipelines: false,
        optimizations: false
      });
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchDashboardData, 60000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const groupMetricsByDate = (metrics, range) => {
    const grouped = {};
    
    metrics.forEach(metric => {
      let dateKey;
      const metricDate = new Date(metric.timestamp);
      
      if (range === '24h') {
        dateKey = format(metricDate, 'HH:00');
      } else if (range === '7d') {
        dateKey = format(metricDate, 'EEE');
      } else {
        dateKey = format(metricDate, 'MMM dd');
      }
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          date: dateKey,
          totalCO2: 0,
          count: 0,
          avgCO2: 0
        };
      }
      
      grouped[dateKey].totalCO2 += metric.co2kg || 0;
      grouped[dateKey].count += 1;
    });
    
    return Object.values(grouped).map(g => ({
      ...g,
      avgCO2: g.count > 0 ? Number((g.totalCO2 / g.count).toFixed(3)) : 0
    }));
  };

  const handleExport = (format) => {
    const exportData = {
      metrics,
      recentPipelines,
      optimizations,
      timeRange,
      exportDate: new Date().toISOString()
    };

    if (format === 'csv') {
      exportToCSV(recentPipelines, 'pipeline_metrics');
    } else {
      exportToJSON(exportData, 'dashboard_report');
    }
  };

  const handlePipelineClick = (pipeline) => {
    setSelectedPipeline(pipeline);
    setIsModalOpen(true);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading.metrics && isLoading.pipelines) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading dashboard data...</p>
          <p className="text-xs text-gray-400 mt-2">Fetching real-time metrics from agents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Export */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm:ss')}
          </p>
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
          
          <div className="relative group">
            <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
            </button>
            
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 hidden group-hover:block z-10">
              <button
                onClick={() => handleExport('csv')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-sm border-t border-gray-200"
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics from Agents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total CO₂ Emissions */}
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
            <span className={`flex items-center text-sm px-2 py-1 rounded-full ${
              metrics.weeklyTrend < 0 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {metrics.weeklyTrend < 0 ? <ArrowDown className="w-3 h-3 mr-1" /> : <ArrowUp className="w-3 h-3 mr-1" />}
              {Math.abs(metrics.weeklyTrend)}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Total CO₂ Emissions</h3>
          <div className="mt-2 flex items-baseline">
            <p className="text-3xl font-bold text-gray-800">{metrics.totalCO2} kg</p>
            <p className="ml-2 text-sm text-gray-500">this period</p>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Monthly target: {metrics.monthlyTarget} kg</span>
              <span>{metrics.targetProgress}%</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  metrics.targetProgress > 100 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, metrics.targetProgress)}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Energy Consumed */}
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
              {metrics.monthlyTrend}%
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Energy Consumed</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics.totalEnergy} kWh</p>
          <div className="mt-4 flex items-center text-sm">
            <Globe className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-gray-600">Grid intensity: 0.475 kgCO₂/kWh</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {metrics.projects} active projects
          </p>
        </motion.div>

        {/* Average Eco Score */}
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
            <span className={`text-sm px-2 py-1 rounded-full ${
              metrics.averageScore >= 80 ? 'bg-emerald-100 text-emerald-700' :
              metrics.averageScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              Grade {metrics.averageScore >= 90 ? 'A' : 
                     metrics.averageScore >= 75 ? 'B' : 
                     metrics.averageScore >= 60 ? 'C' : 'D'}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">Average Eco Score</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">{metrics.averageScore}/100</p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Performance</span>
              <span>{metrics.totalPipelines} pipelines</span>
            </div>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  metrics.averageScore >= 80 ? 'bg-emerald-500' :
                  metrics.averageScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.averageScore}%` }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Agent Insight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl shadow-lg p-6 text-white"
        >
          <h3 className="text-emerald-100 text-sm font-medium mb-2">Agent Insight</h3>
          <p className="text-xl font-semibold leading-snug">
            {optimizations.filter(o => o.status === 'pending').length} pending optimizations
          </p>
          <p className="text-emerald-100 text-sm mt-2">
            Estimated savings: {
              optimizations
                .filter(o => o.status === 'pending')
                .reduce((sum, o) => sum + (o.estimatedSavings || 0), 0)
                .toFixed(3)
            } kg CO₂
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-emerald-100 mb-1">
              <span>Completion rate</span>
              <span>
                {optimizations.length > 0 
                  ? Math.round((optimizations.filter(o => o.status === 'completed').length / optimizations.length) * 100)
                  : 0}%
              </span>
            </div>
            <div className="h-2 bg-emerald-500/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full"
                style={{ 
                  width: `${optimizations.length > 0 
                    ? (optimizations.filter(o => o.status === 'completed').length / optimizations.length) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
          <p className="text-xs text-emerald-200 mt-3">
            Last analysis: {recentPipelines[0] ? format(new Date(recentPipelines[0].timestamp), 'HH:mm:ss') : 'N/A'}
          </p>
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
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Emissions Trend</h3>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">
                {chartData.length} data points
              </span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
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
                  formatter={(value) => [`${value} kg`, 'Avg CO₂']}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgCO2" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  fill="url(#colorCo2)" 
                  name="Avg CO₂ Emissions"
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Pipelines</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {isLoading.pipelines ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : recentPipelines.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No recent pipelines</p>
            ) : (
              recentPipelines.map((pipeline, index) => (
                <motion.div
                  key={pipeline.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="group relative"
                >
                  <button
                    onClick={() => handlePipelineClick(pipeline)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      {pipeline.status === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : pipeline.status === 'failed' ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
                      )}
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-800">
                          {pipeline.projectName || pipeline.projectId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(pipeline.timestamp), 'MMM dd, HH:mm')} • {formatDuration(pipeline.duration)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                        pipeline.grade === 'A' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        pipeline.grade === 'B' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                        pipeline.grade === 'C' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                        pipeline.grade === 'D' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                        'bg-red-100 text-red-700 border-red-200'
                      }`}>
                        {pipeline.grade}
                      </span>
                      <Eye className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                </motion.div>
              ))
            )}
          </div>
          <button className="w-full mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium py-2 border-t border-gray-200">
            View All Pipelines
          </button>
        </motion.div>
      </div>

      {/* Recent Optimizations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Recent Optimizations</h3>
          <button 
            onClick={() => window.location.hash = '#/optimizations'}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center space-x-1"
          >
            <span>View all</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {isLoading.optimizations ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          </div>
        ) : optimizations.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No optimizations available</p>
        ) : (
          <div className="space-y-3">
            {optimizations.slice(0, 5).map((opt, index) => (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 * index }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-lg ${
                    opt.status === 'completed' ? 'bg-emerald-100' :
                    opt.status === 'in_progress' ? 'bg-blue-100' :
                    'bg-yellow-100'
                  }`}>
                    {opt.status === 'completed' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : opt.status === 'in_progress' ? (
                      <Clock className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">{opt.title}</h4>
                    <p className="text-xs text-gray-500">
                      {opt.projectName || opt.projectId} • {opt.estimatedSavings} kg CO₂/run
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    opt.impact === 'high' ? 'bg-red-100 text-red-700' :
                    opt.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {opt.impact}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    opt.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                    opt.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {opt.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Pipeline Details Modal */}
      <PipelineDetailsModal
        pipeline={selectedPipeline}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPipeline(null);
        }}
      />
    </div>
  );
};

export default Dashboard;