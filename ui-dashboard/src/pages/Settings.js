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
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';

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
      onAgentFailure: true
    },
    agents: {
      maxConcurrent: 5,
      timeoutSeconds: 300,
      retryAttempts: 3,
      enableAutoTrigger: true,
      autoTriggerThreshold: 0.05 // kg CO2
    },
    database: {
      retentionDays: 90,
      archiveEnabled: true,
      backupFrequency: 'daily',
      backupTime: '02:00'
    },
    api: {
      rateLimit: 100,
      apiKeys: ['demo-key-123', 'test-key-456']
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Settings saved successfully');
    setIsSaving(false);
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    // Simulate test
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('All connections successful');
    setIsTesting(false);
  };

  const handleReset = () => {
    // Reset to defaults
    toast.success('Settings reset to defaults');
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
          <input
            type="url"
            value={settings.notifications.slackWebhook}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, slackWebhook: e.target.value }
            })}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Notification Events</h4>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="optCreated"
            checked={settings.notifications.onOptimizationCreated}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, onOptimizationCreated: e.target.checked }
            })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="optCreated" className="text-sm text-gray-700">
            On optimization created
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="optApplied"
            checked={settings.notifications.onOptimizationApplied}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, onOptimizationApplied: e.target.checked }
            })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="optApplied" className="text-sm text-gray-700">
            On optimization applied
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="agentFailure"
            checked={settings.notifications.onAgentFailure}
            onChange={(e) => setSettings({
              ...settings,
              notifications: { ...settings.notifications, onAgentFailure: e.target.checked }
            })}
            className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <label htmlFor="agentFailure" className="text-sm text-gray-700">
            On agent failure
          </label>
        </div>
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
      </div>

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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Database className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800">Database Status</h4>
            <p className="text-sm text-blue-600 mt-1">
              Current size: 156 MB • Last backup: Today at 02:00 • 99.9% uptime
            </p>
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
        <label className="block text-sm font-medium text-gray-700 mb-3">
          API Keys
        </label>
        <div className="space-y-2">
          {settings.api.apiKeys.map((key, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={key}
                readOnly
                className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono text-sm"
              />
              <button className="p-2 text-gray-500 hover:text-emerald-600 transition-colors">
                <Key className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-500 hover:text-red-600 transition-colors">
                <AlertTriangle className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        <button className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          + Generate New API Key
        </button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Security Notice</h4>
            <p className="text-sm text-yellow-600 mt-1">
              API keys should be kept secret. Never share them or commit them to version control.
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
        <div className="flex border-b border-gray-200 bg-gray-50">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
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

      {/* Test Connection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Test Connections</h3>
        <div className="space-y-4">
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Testing Connections...</span>
              </>
            ) : (
              <>
                <Globe className="w-4 h-4" />
                <span>Test All Connections</span>
              </>
            )}
          </button>
          <p className="text-sm text-gray-500">
            This will test connections to GitLab API, database, and notification services.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;