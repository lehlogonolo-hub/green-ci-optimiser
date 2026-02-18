import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  GitPullRequest,
  Calendar,
  Leaf,
  Zap,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  FileCode
} from 'lucide-react';
import { format } from 'date-fns';

const OptimizationDetailsModal = ({ optimization, isOpen, onClose, onApply }) => {
  if (!optimization) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-xl ${
                  optimization.status === 'completed' ? 'bg-emerald-100' :
                  optimization.status === 'in_progress' ? 'bg-blue-100' :
                  'bg-yellow-100'
                }`}>
                  <GitPullRequest className={`w-6 h-6 ${
                    optimization.status === 'completed' ? 'text-emerald-600' :
                    optimization.status === 'in_progress' ? 'text-blue-600' :
                    'text-yellow-600'
                  }`} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Optimization Details</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{optimization.title}</h3>
                <p className="text-gray-600">{optimization.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Project</p>
                  <p className="font-medium text-gray-800">{optimization.projectName || optimization.projectId}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Created</p>
                  <p className="font-medium text-gray-800">
                    {format(new Date(optimization.createdAt), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-2">Impact</p>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full border ${getImpactColor(optimization.impact)}`}>
                    {optimization.impact}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-2">Status</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(optimization.status)}
                    <span className="font-medium text-gray-800 capitalize">
                      {optimization.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-2">Savings</p>
                  <p className="text-lg font-bold text-emerald-600">{optimization.estimatedSavings} kg CO₂</p>
                </div>
              </div>

              {/* Impact Calculations */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Environmental Impact</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Per Run</p>
                    <p className="text-xl font-bold text-emerald-600">{optimization.estimatedSavings} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Annual</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {(optimization.estimatedSavings * 365).toFixed(2)} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Trees Equivalent</p>
                    <p className="text-xl font-bold text-emerald-600">
                      {Math.round(optimization.estimatedSavings * 365 / 21)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patch Preview */}
              {optimization.metadata?.patch && (
                <div className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400 font-mono">GitLab CI Patch</span>
                    <FileCode className="w-4 h-4 text-gray-500" />
                  </div>
                  <pre className="text-sm text-emerald-400 font-mono overflow-x-auto">
                    {optimization.metadata.patch}
                  </pre>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                {optimization.status === 'pending' && (
                  <button
                    onClick={() => {
                      onApply(optimization.id);
                      onClose();
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Apply Optimization</span>
                  </button>
                )}
                
                {optimization.mrUrl && (
                  <a
                    href={optimization.mrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <GitPullRequest className="w-4 h-4" />
                    <span>View Merge Request</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OptimizationDetailsModal;