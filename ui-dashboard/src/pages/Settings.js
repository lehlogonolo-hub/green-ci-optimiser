import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  Bell,
  Shield,
  Database,
  Globe,
  Mail,
  Sliders,
  Key,
  Users,
  HardDrive,
  Cloud,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  TestTube,
  Webhook
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const Settings = () => {
  const [settings, setSettings] = useState({
    general: {
      projectName: 'Green CI Optimizer',
      environment: 'production',
      logLevel: 'info',
      autoRefresh: true,
      refreshInterval: 30
    },
    notifications: {
      email: true,
      slack: true,
      emailAddress: 'admin@example.com',
      slackWebhook: 'https://hooks.slack.com/services/...',
      onOptimizationCreated: true,
      onOptimizationApplied: true,
      onAgentFailure: true,
      onPipelineComplete: true
    },
    agents: {
      maxConcurrent: 5,
      timeoutSeconds: 300,
      retryAttempts: 3,
      enableAutoTrigger: true,
      autoTriggerThreshold: 0.05,
      enableLogging: true,
      logRetentionDays: 30
    },
    database: {
      retentionDays: 90,
      archiveEnabled: true,
      backupFrequency: 'daily',
      backupTime: '02:00',
      backupLocation: '/backups/green-ci'
    },
    api: {
      rateLimit: 100,
      apiKeys: [
        { key: 'demo-key-123', name: 'Demo Key', created: '2024-01-15', lastUsed: '2024-02-16' },
        { key: 'test-key-456', name: 'Test Key', created: '2024-01-20', lastUsed: '2024-02-15' }
      ]
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({
    gitlab: 'unknown',
    database: 'unknown',
    slack: 'unknown',
    email: 'unknown'
  });

  useEffect(() => {
    checkConnections();
  }, []);

  const checkConnections = async () => {
    // Test database connection
    try {
      await api.get('/health');
      setConnectionStatus(prev => ({ ...prev, database: 'connected' }));
    } catch {
      setConnectionStatus(prev => ({ ...prev, database: 'error' }));
    }

    // Test GitLab API (mock)
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, gitlab: 'connected' }));
    }, 1000);

    // Test Slack (mock)
    setTimeout(() => {
      setConnectionStatus(prev => ({ ...prev, slack: 'connected' }));
    }, 1500);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  const handleTestConnection = async (service) => {
    setIsTesting(true);
    toast.loading(`Testing ${service} connection...`, { id: `test-${service}` });
    
    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const success = Math.random() > 0.2; // 80% success rate for demo
    
    if (success) {
      setConnectionStatus(prev => ({ ...prev, [service]: 'connected' }));
      toast.success(`${service} connection successful!`, { id: `test-${service}` });
    } else {
      setConnectionStatus(prev => ({ ...prev, [service]: 'error' }));
      toast.error(`${service} connection failed`, { id: `test-${service}` });
    }
    
    setIsTesting(false);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all settings to defaults?')) {
      toast.success('Settings reset to defaults');
    }
  };

  const handleCopyApiKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success('API key copied to clipboard');
  };

  const handleRegenerateKey = (keyName) => {
    if (window.confirm(`Regenerate ${keyName}? This will invalidate the existing key.`)) {
      toast.success(`API key ${keyName} regenerated`);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'agents', label: 'Agents', icon: Shield },
    { id: 'database', label: 'Database', icon: Database },
    { id: 'api', label: 'API & Keys', icon: Key }
  ];

  const renderGeneral = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project Name
          </label>
          <input
            type="text"
            value={settings.general.projectName}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, projectName: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Environment
          </label>
          <select
            value={settings.general.environment}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, environment: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Log Level
          </label>
          <select
            value={settings.general.logLevel}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, logLevel: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Refresh Interval (seconds)
          </label>
          <input
            type="number"
            value={settings.general.refreshInterval}
            onChange={(e) => setSettings({
              ...settings,
              general: { ...settings.general, refreshInterval: parseInt(e.target.value) }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="autoRefresh"
          checked={settings.general.autoRefresh}
          onChange={(e) => setSettings({
            ...settings,
            general: { ...settings.general, autoRefresh: e.target.checked }
          })}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="autoRefresh" className="text-sm text-gray-700">
          Auto-refresh dashboard data
        </label>
      </div>

      {/* Connection Status */}
      <div className="bg-gray-50 rounded-xl p-4 mt-4">
        <h4 className="font-medium text-gray-700 mb-3">Connection Status</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(connectionStatus).map(([service, status]) => (
            <div key={service} className="flex items-center justify-between p-3 bg-white rounded-lg">
              <span className="text-sm capitalize text-gray-600">{service}</span>
              {status === 'connected' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : status === 'error' ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={settings.notifications.emailAddress}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, emailAddress: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slack Webhook URL
          </label>
          <div className="flex space-x-2">
            <input
              type="url"
              value={settings.notifications.slackWebhook}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, slackWebhook: e.target.value }
              })}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={() => handleTestConnection('slack')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
            >
              <TestTube className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Notification Events</h4>
        
        {[
          { id: 'onOptimizationCreated', label: 'On optimization created' },
          { id: 'onOptimizationApplied', label: 'On optimization applied' },
          { id: 'onAgentFailure', label: 'On agent failure' },
          { id: 'onPipelineComplete', label: 'On pipeline complete' }
        ].map(event => (
          <div key={event.id} className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={event.id}
              checked={settings.notifications[event.id]}
              onChange={(e) => setSettings({
                ...settings,
                notifications: { ...settings.notifications, [event.id]: e.target.checked }
              })}
              className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor={event.id} className="text-sm text-gray-700">
              {event.label}
            </label>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="emailNotify"
            checked={settings.notifications.email}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, email: e.target.checked }
            })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="emailNotify" className="text-sm text-gray-700">
            Enable email notifications
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="slackNotify"
            checked={settings.notifications.slack}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, slack: e.target.checked }
            })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="slackNotify" className="text-sm text-gray-700">
            Enable Slack notifications
          </label>
        </div>
      </div>
    </div>
  );

  const renderAgents = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Concurrent Agents
          </label>
          <input
            type="number"
            value={settings.agents.maxConcurrent}
            onChange={(e) => setSettings({
              ...settings,
              agents: { ...settings.agents, maxConcurrent: parseInt(e.target.value) }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Timeout (seconds)
          </label>
          <input
            type="number"
            value={settings.agents.timeoutSeconds}
            onChange={(e) => setSettings({
              ...settings,
              agents: { ...settings.agents, timeoutSeconds: parseInt(e.target.value) }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Retry Attempts
          </label>
          <input
            type="number"
            value={settings.agents.retryAttempts}
            onChange={(e) => setSettings({
              ...settings,
              agents: { ...settings.agents, retryAttempts: parseInt(e.target.value) }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Auto-trigger Threshold (kg CO₂)
          </label>
          <input
            type="number"
            step="0.001"
            value={settings.agents.autoTriggerThreshold}
            onChange={(e) => setSettings({
              ...settings,
              agents: { ...settings.agents, autoTriggerThreshold: parseFloat(e.target.value) }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Log Retention (days)
          </label>
          <input
            type="number"
            value={settings.agents.logRetentionDays}
            onChange={(e) => setSettings({
              ...settings,
              agents: { ...settings.agents, logRetentionDays: parseInt(e.target.value) }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="autoTrigger"
            checked={settings.agents.enableAutoTrigger}
            onChange={(e) => setSettings({
              ...settings,
              agents: { ...settings.agents, enableAutoTrigger: e.target.checked }
            })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="autoTrigger" className="text-sm text-gray-700">
            Enable auto-trigger for optimizations
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enableLogging"
            checked={settings.agents.enableLogging}
            onChange={(e) => setSettings({
              ...settings,
              agents: { ...settings.agents, enableLogging: e.target.checked }
            })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="enableLogging" className="text-sm text-gray-700">
            Enable detailed agent logging
          </label>
        </div>
      </div>

      {/* Agent Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Agent Status</h4>
            <p className="text-sm text-blue-600 mt-1">
              3 agents active • 156 analyses today • 42 MRs created this week
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDatabase = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data Retention (days)
          </label>
          <input
            type="number"
            value={settings.database.retentionDays}
            onChange={(e) => setSettings({
              ...settings,
              database: { ...settings.database, retentionDays: parseInt(e.target.value) }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Frequency
          </label>
          <select
            value={settings.database.backupFrequency}
            onChange={(e) => setSettings({
              ...settings,
              database: { ...settings.database, backupFrequency: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Time
          </label>
          <input
            type="time"
            value={settings.database.backupTime}
            onChange={(e) => setSettings({
              ...settings,
              database: { ...settings.database, backupTime: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Backup Location
          </label>
          <input
            type="text"
            value={settings.database.backupLocation}
            onChange={(e) => setSettings({
              ...settings,
              database: { ...settings.database, backupLocation: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="archiveEnabled"
          checked={settings.database.archiveEnabled}
          onChange={(e) => setSettings({
            ...settings,
            database: { ...settings.database, archiveEnabled: e.target.checked }
          })}
          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
        />
        <label htmlFor="archiveEnabled" className="text-sm text-gray-700">
          Enable automatic archiving
        </label>
      </div>

      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Database className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-emerald-800">Database Status</h4>
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div>
                <p className="text-xs text-emerald-600">Size</p>
                <p className="text-sm font-medium text-emerald-800">156 MB</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Last Backup</p>
                <p className="text-sm font-medium text-emerald-800">Today 02:00</p>
              </div>
              <div>
                <p className="text-xs text-emerald-600">Uptime</p>
                <p className="text-sm font-medium text-emerald-800">99.9%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderApi = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rate Limit (requests per minute)
        </label>
        <input
          type="number"
          value={settings.api.rateLimit}
          onChange={(e) => setSettings({
            ...settings,
            api: { ...settings.api, rateLimit: parseInt(e.target.value) }
          })}
          className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            API Keys
          </label>
          <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
            + Generate New Key
          </button>
        </div>
        
        <div className="space-y-3">
          {settings.api.apiKeys.map((key, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-800">{key.name}</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCopyApiKey(key.key)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Copy API key"
                  >
                    <Copy className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setShowApiKeys(prev => ({ ...prev, [index]: !prev[index] }))}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title={showApiKeys[index] ? 'Hide' : 'Show'}
                  >
                    {showApiKeys[index] ? (
                      <EyeOff className="w-4 h-4 text-gray-500" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRegenerateKey(key.name)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="Regenerate key"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                <span>Created: {key.created}</span>
                <span>Last used: {key.lastUsed}</span>
              </div>
              
              <div className="bg-white rounded-lg p-3 font-mono text-sm border border-gray-200">
                {showApiKeys[index] ? key.key : '•'.repeat(32)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhook Configuration */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="font-medium text-gray-700 mb-4 flex items-center space-x-2">
          <Webhook className="w-4 h-4" />
          <span>Webhook Configuration</span>
        </h4>
        
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-sm text-gray-600 mb-3">
            Configure webhooks to receive real-time events
          </p>
          <div className="flex items-center space-x-2">
            <input
              type="url"
              placeholder="https://your-server.com/webhook"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
              Add Webhook
            </button>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Security Notice</h4>
            <p className="text-sm text-yellow-600 mt-1">
              API keys should be kept secret. Never share them or commit them to version control.
              Regenerate keys immediately if they are compromised.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-500 mt-1">Configure your Green CI Optimizer</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 bg-white border border-gray-200 rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">Reset</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-600 border-b-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'general' && renderGeneral()}
          {activeTab === 'notifications' && renderNotifications()}
          {activeTab === 'agents' && renderAgents()}
          {activeTab === 'database' && renderDatabase()}
          {activeTab === 'api' && renderApi()}
        </div>
      </div>

      {/* Test All Connections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Connections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['gitlab', 'database', 'slack', 'email'].map((service) => (
            <button
              key={service}
              onClick={() => handleTestConnection(service)}
              disabled={isTesting}
              className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
            >
              <div className="flex items-center space-x-3">
                {service === 'gitlab' && <Globe className="w-5 h-5 text-gray-600" />}
                {service === 'database' && <Database className="w-5 h-5 text-gray-600" />}
                {service === 'slack' && <Bell className="w-5 h-5 text-gray-600" />}
                {service === 'email' && <Mail className="w-5 h-5 text-gray-600" />}
                <span className="font-medium capitalize text-gray-700">{service}</span>
              </div>
              {connectionStatus[service] === 'connected' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : connectionStatus[service] === 'error' ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <span className="text-sm text-gray-400">Test</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;