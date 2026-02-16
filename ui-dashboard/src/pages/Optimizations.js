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
  Leaf  // Added missing Leaf import
} from 'lucide-react';
import { api, handleApiError } from '../services/api';
import toast from 'react-hot-toast';

const Optimizations = () => {
  const [optimizations, setOptimizations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOptimization, setSelectedOptimization] = useState(null);
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    fetchOptimizations();
  }, [filter]);

  const fetchOptimizations = async () => {
    setIsLoading(true);
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.get('/optimizations', { params });
      setOptimizations(response.data.data);
    } catch (error) {
      handleApiError(error);
      // Fallback to empty array if API fails
      setOptimizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyOptimization = async (id) => {
    setIsApplying(true);
    try {
      const response = await api.post(`/optimizations/${id}/apply`);
      toast.success('Optimization applied successfully! MR created.');
      await fetchOptimizations();
      setSelectedOptimization(null);
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsApplying(false);
    }
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading optimizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Optimizations</h1>
          <p className="text-gray-500 mt-1">AI-powered suggestions to reduce your pipeline carbon footprint</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter</span>
          </button>
          <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors">
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 border-b border-gray-200 pb-4">
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

      {/* Optimizations Grid */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {optimizations.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center"
            >
              <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Optimizations Found</h3>
              <p className="text-gray-500">There are no optimizations matching your criteria.</p>
            </motion.div>
          ) : (
            optimizations.map((opt, index) => (
              <motion.div
                key={opt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
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
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-800">{opt.title}</h3>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getImpactColor(opt.impact)}`}>
                            {opt.impact} impact
                          </span>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusColor(opt.status)}`}>
                            {opt.status.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 max-w-2xl">{opt.description}</p>
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
                        </div>
                      </div>
                    </div>
                    
                    {opt.status === 'pending' && (
                      <button
                        onClick={() => setSelectedOptimization(opt)}
                        className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl transition-colors"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span className="font-medium">Apply Fix</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                    
                    {opt.status === 'in_progress' && (
                      <div className="flex items-center space-x-2 bg-blue-50 text-blue-700 px-6 py-2.5 rounded-xl">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="font-medium">Creating MR...</span>
                      </div>
                    )}
                    
                    {opt.status === 'completed' && opt.mrUrl && (
                      <a
                        href={opt.mrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl transition-colors"
                      >
                        <GitPullRequest className="w-4 h-4" />
                        <span className="font-medium">View MR</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
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
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Apply Modal */}
      <AnimatePresence>
        {selectedOptimization && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setSelectedOptimization(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-emerald-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                Apply Optimization
              </h2>
              
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to apply "{selectedOptimization.title}"? This will create a merge request with the suggested changes.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-700 mb-2">Impact Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Estimated CO₂ Savings:</span>
                    <span className="font-medium text-emerald-600">{selectedOptimization.estimatedSavings} kg per run</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Annual Projection:</span>
                    <span className="font-medium text-emerald-600">{(selectedOptimization.estimatedSavings * 365).toFixed(2)} kg</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trees Equivalent:</span>
                    <span className="font-medium text-emerald-600">{Math.round(selectedOptimization.estimatedSavings * 365 / 21)} trees</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setSelectedOptimization(null)}
                  className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApplyOptimization(selectedOptimization.id)}
                  disabled={isApplying}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl transition-colors font-medium flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isApplying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating MR...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Apply & Create MR</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Optimizations;