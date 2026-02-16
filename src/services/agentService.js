const { Agent } = require('../database/models');
const logger = require('../utils/logger');

class AgentService {
  async getAllAgents() {
    try {
      const agents = await Agent.findAll();
      return agents;
    } catch (error) {
      logger.error('Error fetching agents', { error });
      throw error;
    }
  }

  async getAgentByName(name) {
    try {
      const agent = await Agent.findOne({ where: { name } });
      
      if (!agent) {
        // Create default agent if not exists
        return await this.createDefaultAgent(name);
      }
      
      return agent;
    } catch (error) {
      logger.error('Error fetching agent', { error });
      throw error;
    }
  }

  async createDefaultAgent(name) {
    try {
      const defaults = {
        'green-ci-optimizer': {
          version: '2.0.0',
          totalAnalyses: 0,
          totalMRsCreated: 0,
          avgResponseTime: 0
        },
        'green-ci-sentinel': {
          version: '1.0.0',
          totalAnalyses: 0,
          totalMRsCreated: 0,
          avgResponseTime: 0
        },
        'green-ci-advisor': {
          version: '1.5.0',
          totalAnalyses: 0,
          totalMRsCreated: 0,
          avgResponseTime: 0
        }
      };

      const agentData = defaults[name] || {
        version: '1.0.0',
        totalAnalyses: 0,
        totalMRsCreated: 0,
        avgResponseTime: 0
      };

      const agent = await Agent.create({
        name,
        status: 'idle',
        ...agentData
      });

      logger.info('Default agent created', { name });
      return agent;
    } catch (error) {
      logger.error('Error creating default agent', { error });
      throw error;
    }
  }

  async updateAgentStatus(name, status, metrics = {}) {
    try {
      let agent = await Agent.findOne({ where: { name } });
      
      if (!agent) {
        agent = await this.createDefaultAgent(name);
      }

      // Update agent
      agent.status = status;
      agent.lastRun = new Date();
      
      if (metrics.totalAnalyses) {
        agent.totalAnalyses += metrics.totalAnalyses;
      }
      
      if (metrics.totalMRsCreated) {
        agent.totalMRsCreated += metrics.totalMRsCreated;
      }
      
      if (metrics.avgResponseTime) {
        agent.avgResponseTime = metrics.avgResponseTime;
      }

      await agent.save();
      
      logger.info('Agent status updated', { name, status });
      return agent;
    } catch (error) {
      logger.error('Error updating agent status', { error });
      throw error;
    }
  }

  async triggerAgentRun(name) {
    try {
      const agent = await Agent.findOne({ where: { name } });
      
      if (!agent) {
        throw new Error('Agent not found');
      }

      agent.status = 'running';
      agent.lastRun = new Date();
      await agent.save();

      // Simulate agent run completion after 2 seconds
      setTimeout(async () => {
        try {
          agent.status = 'active';
          agent.totalAnalyses += 1;
          await agent.save();
          logger.info('Agent run completed', { name });
        } catch (error) {
          logger.error('Error completing agent run', { error });
        }
      }, 2000);

      return agent;
    } catch (error) {
      logger.error('Error triggering agent', { error });
      throw error;
    }
  }

  async getAgentLogs(name, limit = 10) {
    // In a real implementation, this would query a logs table
    // For now, return mock logs
    const logs = [];
    for (let i = 0; i < limit; i++) {
      logs.push({
        timestamp: new Date(Date.now() - i * 60000).toISOString(),
        level: ['info', 'debug', 'warn'][Math.floor(Math.random() * 3)],
        message: `Agent ${name} ${['analyzing', 'processing', 'completed'][Math.floor(Math.random() * 3)]} task ${i + 1}`,
        metadata: {
          duration: Math.floor(Math.random() * 1000),
          status: 'success'
        }
      });
    }
    return logs;
  }
}

module.exports = new AgentService();