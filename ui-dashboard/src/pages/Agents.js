import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  Network
} from 'lucide-react';
import { api, handleApiError } from '../services/api';
import toast from 'react-hot-toast';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentLogs, setAgentLogs] = useState([]);

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedAgent) {
      fetchAgentLogs(selectedAgent.name);
    }
  }, [selectedAgent]);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents');
      const agentsData = Object.entries(response.data.data).map(([name, data]) => ({
        name,
        ...data
      }));
      setAgents(agentsData);
    } catch (error) {
      handleApiError(error);
      // Fallback mock data
      setAgents([
        {
          name: 'green-ci-optimizer',
          status: 'active',
          version: '2.0.0',
          totalAnalyses: 156,
          totalMRsCreated: 42,
          avgResponseTime: 28.5,
          lastRun: new Date().toISOString()
        },
        {
          name: 'green-ci-sentinel',
          status: 'active',
          version: '1.0.0',
          totalAnalyses: 1234,
          totalMRsCreated: 23,
          avgResponseTime: 12.3,
          lastRun: new Date().toISOString()
        },
        {
          name: 'green-ci-advisor',
          status: 'idle',
          version: '1.5.0',
          totalAnalyses: 89,
          totalMRsCreated: 0,
          avgResponseTime: 15.7,
          lastRun: new Date(Date.now() - 7200000).toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgentLogs = async (agentName) => {
    try {
      const response = await api.get(`/agents/${agentName}/logs?limit=20`);
      setAgentLogs(response.data.data);
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleTriggerAgent = async (agentName) => {
    try {
      const response = await api.post(`/agents/${agentName}/run`);
      toast.success(`Agent ${agentName} triggered successfully`);
      fetchAgents();
    } catch (error) {
      handleApiError(error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-emerald-500 bg-emerald-50 border-emerald-200';
      case 'running':
        return 'text-blue-500 bg-blue-50 border-blue-200';
      case 'idle':
        return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-500 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'idle':
        return <Clock className="w-4 h-4" />;
      case 'error':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading agents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">AI Agents</h1>
          <p className="text-gray-500 mt-1">Monitor and manage your Green CI agents</p>
        </div>
        <button
          onClick={fetchAgents}
          className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Agents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-white rounded-2xl shadow-sm border-2 cursor-pointer transition-all ${
              selectedAgent?.name === agent.name
                ? 'border-emerald-500 shadow-lg'
                : 'border-gray-200 hover:border-emerald-200'
            }`}
            onClick={() => setSelectedAgent(agent)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${
                    agent.status === 'active' ? 'bg-emerald-100' :
                    agent.status === 'running' ? 'bg-blue-100' :
                    agent.status === 'idle' ? 'bg-yellow-100' :
                    'bg-red-100'
                  }`}>
                    <Bot className={`w-6 h-6 ${
                      agent.status === 'active' ? 'text-emerald-600' :
                      agent.status === 'running' ? 'text-blue-600' :
                      agent.status === 'idle' ? 'text-yellow-600' :
                      'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{agent.name}</h3>
                    <p className="text-xs text-gray-500">v{agent.version}</p>
                  </div>
                </div>
                <span className={`flex items-center space-x-1 text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(agent.status)}`}>
                  {getStatusIcon(agent.status)}
                  <span className="capitalize">{agent.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Analyses</p>
                  <p className="text-lg font-semibold text-gray-800">{agent.totalAnalyses || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">MRs Created</p>
                  <p className="text-lg font-semibold text-gray-800">{agent.totalMRsCreated || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Avg Response</p>
                  <p className="text-lg font-semibold text-gray-800">{agent.avgResponseTime || 0}s</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Run</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString() : 'N/A'}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleTriggerAgent(agent.name);
                }}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl transition-colors"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Trigger Agent</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agent Details */}
      {selectedAgent && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Agent Details: {selectedAgent.name}</h2>
            <button
              onClick={() => setSelectedAgent(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Metrics */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">Performance Metrics</h3>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Cpu className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">CPU Usage</span>
                  <span className="ml-auto font-semibold text-gray-800">24%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '24%' }}></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <HardDrive className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Memory Usage</span>
                  <span className="ml-auto font-semibold text-gray-800">512 MB</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Network className="w-5 h-5 text-gray-500" />
                  <span className="text-sm text-gray-600">Network I/O</span>
                  <span className="ml-auto font-semibold text-gray-800">1.2 MB/s</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-emerald-700">Health Score</span>
                  <span className="text-2xl font-bold text-emerald-700">98%</span>
                </div>
                <p className="text-xs text-emerald-600 mt-1">All systems operational</p>
              </div>
            </div>

            {/* Logs */}
            <div className="lg:col-span-2">
              <h3 className="font-semibold text-gray-700 mb-3">Recent Activity Logs</h3>
              <div className="bg-gray-900 rounded-xl p-4 h-96 overflow-y-auto custom-scrollbar">
                {agentLogs.map((log, index) => (
                  <div key={index} className="font-mono text-sm mb-2 pb-2 border-b border-gray-800 last:border-0">
                    <span className="text-gray-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                    <span className={`${
                      log.level === 'error' ? 'text-red-400' :
                      log.level === 'warn' ? 'text-yellow-400' :
                      'text-emerald-400'
                    }`}>
                      [{log.level}]
                    </span>{' '}
                    <span className="text-gray-300">{log.message}</span>
                    {log.metadata && (
                      <pre className="text-xs text-gray-500 mt-1 ml-6">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Agents;