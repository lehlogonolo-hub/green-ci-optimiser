import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GitPullRequest,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  ArrowRight,
  FileCode,
  Sparkles,
  Filter,
  Download,
  AlertCircle,
  Leaf,
  Search,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { api, exportToCSV } from '../services/api';
import toast from 'react-hot-toast';
import OptimizationDetailsModal from '../components/OptimizationDetailsModal';

const Optimizations = () => {
  const [optimizations, setOptimizations] = useState([]);
  const [filteredOptimizations, setFilteredOptimizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOptimization, setSelectedOptimization] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalSavings: 0
  });

  useEffect(() => {
    fetchOptimizations();
  }, []);

  useEffect(() => {
    filterOptimizations();
  }, [optimizations, filter, searchTerm]);

  const fetchOptimizations = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/optimizations?limit=100');
      const data = response.data.data;
      setOptimizations(data);
      
      // Calculate stats
      const stats = {
        total: data.length,
        pending: data.filter(o => o.status === 'pending').length,
        inProgress: data.filter(o => o.status === 'in_progress').length,
        completed: data.filter(o => o.status === 'completed').length,
        totalSavings: data
          .filter(o => o.status === 'completed')
          .reduce((sum, o) => sum + (o.estimatedSavings || 0), 0)
          .toFixed(3)
      };
      setStats(stats);

      toast.success(`Loaded ${data.length} optimizations`);
    } catch (error) {
      console.error('Failed to fetch optimizations:', error);
      toast.error('Failed to load optimizations');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOptimizations = () => {
    let filtered = [...optimizations];
    
    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(o => o.status === filter);
    }
    
    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(o => 
        o.title.toLowerCase().includes(term) ||
        o.description.toLowerCase().includes(term) ||
        (o.projectName || '').toLowerCase().includes(term) ||
        (o.projectId || '').toLowerCase().includes(term)
      );
    }
    
    setFilteredOptimizations(filtered);
  };

  const handleApplyOptimization = async (id) => {
    setIsApplying(true);
    try {
      const response = await api.post(`/optimizations/${id}/apply`);
      toast.success('Optimization applied successfully! MR created.');
      
      // Show MR link
      if (response.data.mrUrl) {
        toast.success(
          <div className="flex items-center space-x-2">
            <span>MR created:</span>
            <a 
              href={response.data.mrUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-emerald-200"
            >
              View Merge Request
            </a>
          </div>,
          { duration: 10000 }
        );
      }
      
      await fetchOptimizations();
      setIsModalOpen(false);
      setSelectedOptimization(null);
    } catch (error) {
      console.error('Failed to apply optimization:', error);
      toast.error('Failed to apply optimization');
    } finally {
      setIsApplying(false);
    }
  };

  const handleExport = () => {
    exportToCSV(filteredOptimizations, 'optimizations');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getImpactColor = (impact) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Optimizations</h1>
          <p className="text-gray-500 mt-1">
            {stats.total} total • {stats.totalSavings} kg CO₂ saved
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOptimizations}
            className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500 mb-1">Completed</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.completed}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search optimizations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center space-x-2 bg-white rounded-lg border border-gray-200 p-1">
          {['all', 'pending', 'in_progress', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === status
                  ? 'bg-emerald-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Optimizations List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading optimizations...</p>
          </div>
        </div>
      ) : filteredOptimizations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center"
        >
          <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Optimizations Found</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Try adjusting your search' : 'No optimizations match the selected filter'}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredOptimizations.map((opt, index) => (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => {
                  setSelectedOptimization(opt);
                  setIsModalOpen(true);
                }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-xl ${
                        opt.status === 'completed' ? 'bg-emerald-100' :
                        opt.status === 'in_progress' ? 'bg-blue-100' :
                        'bg-yellow-100'
                      }`}>
                        {getStatusIcon(opt.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{opt.title}</h3>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getImpactColor(opt.impact)}`}>
                            {opt.impact} impact
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(opt.status)}`}>
                            {opt.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 max-w-3xl">{opt.description}</p>
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <GitPullRequest className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Project: {opt.projectName || opt.projectId}</span>
                          </div>
                          {opt.estimatedSavings && (
                            <div className="flex items-center space-x-2">
                              <Leaf className="w-4 h-4 text-emerald-500" />
                              <span className="text-gray-600">Save {opt.estimatedSavings} kg CO₂ per run</span>
                            </div>
                          )}
                          {opt.mrUrl && (
                            <a
                              href={opt.mrUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span>View MR</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {opt.status === 'pending' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOptimization(opt);
                          setIsModalOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium">Apply Fix</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Patch Preview */}
                  {opt.metadata?.patch && (
                    <div className="mt-4 bg-gray-900 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-400 font-mono">GitLab CI Patch</span>
                        <FileCode className="w-4 h-4 text-gray-500" />
                      </div>
                      <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
                        {opt.metadata.patch}
                      </pre>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Optimization Details Modal */}
      <OptimizationDetailsModal
        optimization={selectedOptimization}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOptimization(null);
        }}
        onApply={handleApplyOptimization}
      />
    </div>
  );
};

export default Optimizations;