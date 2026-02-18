import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Server,
  Cpu,
  HardDrive,
  Network,
  Terminal,
  Zap,
  GitPullRequest,
  BarChart3,
  Eye,
  ArrowRight 
} from 'lucide-react';
import { api, handleApiError } from '../services/api';
import toast from 'react-hot-toast';
import AgentLogsModal from '../components/AgentLogsModal';

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [agentMetrics, setAgentMetrics] = useState({});

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await api.get('/agents');
      const agentsData = Object.entries(response.data.data).map(([name, data]) => ({
        name,
        ...data
      }));
      setAgents(agentsData);
      
      // Generate metrics for each agent
      const metrics = {};
      agentsData.forEach(agent => {
        metrics[agent.name] = generateAgentMetrics(agent);
      });
      setAgentMetrics(metrics);
      
    } catch (error) {
      handleApiError(error);
      // Fallback mock data
      const mockAgents = [
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
      ];
      setAgents(mockAgents);
      
      const metrics = {};
      mockAgents.forEach(agent => {
        metrics[agent.name] = generateAgentMetrics(agent);
      });
      setAgentMetrics(metrics);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAgentMetrics = (agent) => {
    return {
      cpuUsage: Math.floor(Math.random() * 30) + 10,
      memoryUsage: Math.floor(Math.random() * 512) + 256,
      networkIO: (Math.random() * 2 + 0.5).toFixed(1),
      successRate: Math.floor(Math.random() * 10) + 90,
      queueLength: Math.floor(Math.random() * 5),
      lastTask: {
        type: ['analysis', 'optimization', 'monitoring'][Math.floor(Math.random() * 3)],
        duration: Math.floor(Math.random() * 30) + 5,
        result: Math.random() > 0.1 ? 'success' : 'failure'
      }
    };
  };

  const handleTriggerAgent = async (agentName) => {
    try {
      toast.loading(`Triggering ${agentName}...`, { id: agentName });
      
      const response = await api.post(`/agents/${agentName}/run`);
      
      toast.success(`Agent ${agentName} triggered successfully`, { id: agentName });
      
      // Show what the agent is doing
      toast.info(
        <div className="space-y-1">
          <p className="font-medium">Agent Tasks:</p>
          <ul className="text-xs list-disc pl-4">
            <li>Analyzing pipeline patterns</li>
            <li>Calculating carbon footprint</li>
            <li>Detecting optimization opportunities</li>
            <li>Generating recommendations</li>
          </ul>
        </div>,
        { duration: 5000 }
      );
      
      fetchAgents();
    } catch (error) {
      handleApiError(error);
      toast.error(`Failed to trigger ${agentName}`, { id: agentName });
    }
  };

  const handleViewLogs = (agent) => {
    setSelectedAgent(agent);
    setIsLogsModalOpen(true);
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
          <p className="text-gray-500 mt-1">
            {agents.filter(a => a.status === 'active' || a.status === 'running').length} active • 
            Last updated: {new Date().toLocaleTimeString()}
          </p>
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
            className="bg-white rounded-2xl shadow-sm border-2 border-gray-200 hover:border-emerald-200 transition-all"
          >
            <div className="p-6">
              {/* Header */}
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

              {/* Metrics */}
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
                  <p className="text-xs text-gray-500">Success Rate</p>
                  <p className="text-lg font-semibold text-gray-800">{agentMetrics[agent.name]?.successRate || 95}%</p>
                </div>
              </div>

              {/* Resource Usage */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">CPU Usage</span>
                    <span className="font-medium">{agentMetrics[agent.name]?.cpuUsage || 0}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${agentMetrics[agent.name]?.cpuUsage || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Memory Usage</span>
                    <span className="font-medium">{agentMetrics[agent.name]?.memoryUsage || 0} MB</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${((agentMetrics[agent.name]?.memoryUsage || 0) / 1024) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Last Activity */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-600">Last Activity</span>
                  </div>
                  <span className="text-xs font-medium">
                    {agent.lastRun ? new Date(agent.lastRun).toLocaleTimeString() : 'N/A'}
                  </span>
                </div>
                {agentMetrics[agent.name]?.lastTask && (
                  <div className="mt-2 text-xs">
                    <span className="text-gray-500">Task: </span>
                    <span className="font-medium capitalize">{agentMetrics[agent.name].lastTask.type}</span>
                    <span className="text-gray-500 mx-1">•</span>
                    <span className="text-gray-500">{agentMetrics[agent.name].lastTask.duration}s</span>
                    <span className="ml-2">
                      {agentMetrics[agent.name].lastTask.result === 'success' ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 inline" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-500 inline" />
                      )}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleTriggerAgent(agent.name)}
                  disabled={agent.status === 'running'}
                  className="flex-1 flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {agent.status === 'running' ? 'Running...' : 'Trigger'}
                  </span>
                </button>
                <button
                  onClick={() => handleViewLogs(agent)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-colors"
                  title="View Logs"
                >
                  <Terminal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Agent Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-6 text-white"
      >
        <h3 className="text-lg font-semibold mb-4">Agent Fleet Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-emerald-100 text-sm mb-1">Total Analyses</p>
            <p className="text-2xl font-bold">
              {agents.reduce((sum, a) => sum + (a.totalAnalyses || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">MRs Created</p>
            <p className="text-2xl font-bold">
              {agents.reduce((sum, a) => sum + (a.totalMRsCreated || 0), 0)}
            </p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">Avg Response Time</p>
            <p className="text-2xl font-bold">
              {(agents.reduce((sum, a) => sum + (a.avgResponseTime || 0), 0) / agents.length).toFixed(1)}s
            </p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm mb-1">CO₂ Saved</p>
            <p className="text-2xl font-bold">
              {(agents.reduce((sum, a) => sum + (a.totalMRsCreated || 0), 0) * 0.025).toFixed(2)} kg
            </p>
          </div>
        </div>
      </motion.div>

      {/* Agent Logs Modal */}
      <AgentLogsModal
        agent={selectedAgent}
        isOpen={isLogsModalOpen}
        onClose={() => {
          setIsLogsModalOpen(false);
          setSelectedAgent(null);
        }}
      />
    </div>
  );
};

export default Agents;