const express = require('express');
const router = express.Router();
const agentService = require('../../services/agentService');
const logger = require('../../utils/logger');

// Get all agents status
router.get('/', async (req, res) => {
  try {
    const agents = await agentService.getAllAgents();
    
    // Format response as object with agent names as keys
    const agentsMap = {};
    agents.forEach(agent => {
      agentsMap[agent.name] = agent;
    });
    
    res.json({
      success: true,
      data: agentsMap,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching agents', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch agents',
      message: error.message 
    });
  }
});

// Get specific agent status
router.get('/:agentName', async (req, res) => {
  try {
    const { agentName } = req.params;
    const agent = await agentService.getAgentByName(agentName);
    
    res.json({
      success: true,
      data: { name: agentName, ...agent.toJSON() }
    });
  } catch (error) {
    logger.error('Error fetching agent', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch agent',
      message: error.message 
    });
  }
});

// Update agent status (for agent webhook)
router.post('/:agentName/status', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { status, ...metrics } = req.body;
    
    const agent = await agentService.updateAgentStatus(agentName, status, metrics);
    
    logger.info(`Agent ${agentName} status updated`, { status });
    
    res.json({
      success: true,
      data: agent,
      message: 'Agent status updated'
    });
  } catch (error) {
    logger.error('Error updating agent status', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to update agent status',
      message: error.message 
    });
  }
});

// Trigger agent run
router.post('/:agentName/run', async (req, res) => {
  try {
    const { agentName } = req.params;
    
    const agent = await agentService.triggerAgentRun(agentName);
    
    logger.info(`Agent ${agentName} triggered manually`);
    
    res.json({
      success: true,
      data: agent,
      message: `Agent ${agentName} triggered successfully`,
      estimatedCompletion: new Date(Date.now() + 2000).toISOString()
    });
  } catch (error) {
    logger.error('Error triggering agent', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to trigger agent',
      message: error.message 
    });
  }
});

// Get agent logs
router.get('/:agentName/logs', async (req, res) => {
  try {
    const { agentName } = req.params;
    const { limit = 10 } = req.query;
    
    const logs = await agentService.getAgentLogs(agentName, parseInt(limit));
    
    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    logger.error('Error fetching agent logs', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch agent logs',
      message: error.message 
    });
  }
});

module.exports = router;