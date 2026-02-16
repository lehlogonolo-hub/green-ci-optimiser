const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

let agentStatus = {
  'green-ci-optimizer': {
    status: 'active',
    lastRun: new Date(Date.now() - 1800000).toISOString(),
    totalAnalyses: 156,
    totalMRsCreated: 42,
    avgResponseTime: 28.5,
    version: '2.0.0'
  },
  'green-ci-sentinel': {
    status: 'active',
    lastRun: new Date(Date.now() - 300000).toISOString(),
    totalMonitored: 1234,
    alertsTriggered: 23,
    avgResponseTime: 12.3,
    version: '1.0.0'
  },
  'green-ci-advisor': {
    status: 'idle',
    lastRun: new Date(Date.now() - 7200000).toISOString(),
    totalAdvice: 89,
    accuracy: 0.94,
    version: '1.5.0'
  }
};

// Get all agents status
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: agentStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching agents', { error });
    res.status(500).json({ error: 'Failed to fetch agents' });
  }
});

// Get specific agent status
router.get('/:agentName', (req, res) => {
  try {
    const { agentName } = req.params;
    const agent = agentStatus[agentName];
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    res.json({
      success: true,
      data: { name: agentName, ...agent }
    });
  } catch (error) {
    logger.error('Error fetching agent', { error });
    res.status(500).json({ error: 'Failed to fetch agent' });
  }
});

// Update agent status (for agent webhook)
router.post('/:agentName/status', (req, res) => {
  try {
    const { agentName } = req.params;
    const { status, ...metrics } = req.body;
    
    if (!agentStatus[agentName]) {
      agentStatus[agentName] = {};
    }
    
    agentStatus[agentName] = {
      ...agentStatus[agentName],
      status,
      lastRun: new Date().toISOString(),
      ...metrics
    };
    
    logger.info(`Agent ${agentName} status updated`, { status });
    
    res.json({
      success: true,
      message: 'Agent status updated'
    });
  } catch (error) {
    logger.error('Error updating agent status', { error });
    res.status(500).json({ error: 'Failed to update agent status' });
  }
});

// Trigger agent run
router.post('/:agentName/run', (req, res) => {
  try {
    const { agentName } = req.params;
    
    if (!agentStatus[agentName]) {
      return res.status(404).json({ error: 'Agent not found' });
    }
    
    // Simulate agent run
    agentStatus[agentName].status = 'running';
    agentStatus[agentName].lastRun = new Date().toISOString();
    
    // Simulate completion after 2 seconds
    setTimeout(() => {
      if (agentStatus[agentName]) {
        agentStatus[agentName].status = 'active';
        if (agentName === 'green-ci-optimizer') {
          agentStatus[agentName].totalAnalyses++;
        }
      }
    }, 2000);
    
    logger.info(`Agent ${agentName} triggered manually`);
    
    res.json({
      success: true,
      message: `Agent ${agentName} triggered successfully`,
      estimatedCompletion: new Date(Date.now() + 2000).toISOString()
    });
  } catch (error) {
    logger.error('Error triggering agent', { error });
    res.status(500).json({ error: 'Failed to trigger agent' });
  }
});

// Get agent logs
router.get('/:agentName/logs', (req, res) => {
  try {
    const { agentName } = req.params;
    const { limit = 10 } = req.query;
    
    // Generate mock logs
    const logs = Array.from({ length: limit }, (_, i) => ({
      timestamp: new Date(Date.now() - i * 60000).toISOString(),
      level: ['info', 'debug', 'warn'][Math.floor(Math.random() * 3)],
      message: `Agent ${agentName} ${['analyzing', 'processing', 'completed'][Math.floor(Math.random() * 3)]} task ${i + 1}`,
      metadata: {
        duration: Math.floor(Math.random() * 1000),
        status: 'success'
      }
    }));
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    logger.error('Error fetching agent logs', { error });
    res.status(500).json({ error: 'Failed to fetch agent logs' });
  }
});

module.exports = router;