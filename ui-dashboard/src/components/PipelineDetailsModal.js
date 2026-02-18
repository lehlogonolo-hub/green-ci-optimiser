import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  HardDrive,
  Activity,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

const PipelineDetailsModal = ({ pipeline, isOpen, onClose }) => {
  if (!pipeline) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      case 'running':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'B': 'bg-blue-100 text-blue-700 border-blue-200',
      'C': 'bg-yellow-100 text-yellow-700 border-yellow-200',
      'D': 'bg-orange-100 text-orange-700 border-orange-200',
      'F': 'bg-red-100 text-red-700 border-red-200',
    };
    return colors[grade] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
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
                {getStatusIcon(pipeline.status)}
                <h2 className="text-2xl font-bold text-gray-800">Pipeline Details</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Pipeline Info */}
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Pipeline ID</p>
                  <p className="font-mono text-sm text-gray-800">{pipeline.pipelineId || pipeline.id}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500 mb-1">Project</p>
                  <p className="font-medium text-gray-800">{pipeline.projectName || pipeline.projectId}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">Date</p>
                  </div>
                  <p className="font-medium text-gray-800">
                    {format(new Date(pipeline.timestamp), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(pipeline.timestamp), 'HH:mm:ss')}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">Duration</p>
                  </div>
                  <p className="font-medium text-gray-800">{formatDuration(pipeline.duration)}</p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <HardDrive className="w-4 h-4 text-gray-400" />
                    <p className="text-sm text-gray-500">Jobs</p>
                  </div>
                  <p className="font-medium text-gray-800">{pipeline.jobCount || 0} jobs</p>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Environmental Impact</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">CO₂ Emissions</p>
                    <p className="text-2xl font-bold text-emerald-600">{pipeline.co2kg} kg</p>
                    <p className="text-xs text-gray-500 mt-1">≈ {Math.round(pipeline.co2kg * 1000)} grams</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Energy Consumed</p>
                    <p className="text-2xl font-bold text-blue-600">{pipeline.energyKwh} kWh</p>
                  </div>
                </div>
              </div>

              {/* Eco Score */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Activity className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Eco Score</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm font-bold px-3 py-1 rounded-full border ${getGradeColor(pipeline.grade)}`}>
                    Grade {pipeline.grade}
                  </span>
                  <span className="text-2xl font-bold text-gray-800">{pipeline.ecoScore}/100</span>
                </div>
              </div>

              {/* View in GitLab */}
              {pipeline.pipelineId && (
                <a
                  href={`https://gitlab.com/${pipeline.projectId}/-/pipelines/${pipeline.pipelineId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-xl transition-colors"
                >
                  <GitBranch className="w-4 h-4" />
                  <span>View in GitLab</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PipelineDetailsModal;