const { Optimization, Project, Agent } = require('../database/models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class OptimizationService {
  async createOptimization(data) {
    try {
      logger.info('Creating optimization with data:', data);
      
      // First, find the project by gitlabProjectId
      let project = await Project.findOne({
        where: { gitlabProjectId: data.projectId }
      });
      
      if (!project) {
        logger.info(`Project ${data.projectId} not found, creating it...`);
        
        project = await Project.create({
          id: uuidv4(),
          gitlabProjectId: data.projectId,
          name: data.projectName || data.projectId,
          description: data.projectDescription || `Auto-created for project ${data.projectId}`,
          settings: {}
        });
        
        logger.info(`Project ${data.projectId} created with ID: ${project.id}`);
      }

      // Create optimization
      const optimization = await Optimization.create({
        title: data.title,
        description: data.description,
        projectId: project.gitlabProjectId, // Use gitlabProjectId as the foreign key
        type: data.type || 'general',
        impact: data.impact || 'medium',
        estimatedSavings: data.estimatedSavings || 0,
        status: data.status || 'pending',
        metadata: data.metadata || {}
      });

      logger.info('Optimization created', { 
        id: optimization.id, 
        projectId: data.projectId 
      });
      
      // Return with project info
      const result = optimization.toJSON();
      result.projectName = project.name;
      
      return result;
    } catch (error) {
      logger.error('Error creating optimization', { error: error.message, stack: error.stack });
      throw error;
    }
  }

  async getOptimizations(filters = {}) {
    try {
      const where = {};
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.impact) {
        where.impact = filters.impact;
      }

      if (filters.projectId) {
        where.projectId = filters.projectId;
      }

      const optimizations = await Optimization.findAll({
        where,
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'gitlabProjectId', 'name']
          },
          {
            model: Agent,
            as: 'agent',
            attributes: ['id', 'name', 'status']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 100
      });

      // Transform the response
      return optimizations.map(opt => {
        const optJson = opt.toJSON();
        if (optJson.project) {
          optJson.gitlabProjectId = optJson.project.gitlabProjectId;
          optJson.projectName = optJson.project.name;
          delete optJson.project;
        }
        if (optJson.agent) {
          optJson.agentName = optJson.agent.name;
          delete optJson.agent;
        }
        return optJson;
      });
    } catch (error) {
      logger.error('Error fetching optimizations', { error: error.message });
      throw error;
    }
  }

  async getOptimizationById(id) {
    try {
      const optimization = await Optimization.findByPk(id, {
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['id', 'gitlabProjectId', 'name']
          },
          {
            model: Agent,
            as: 'agent',
            attributes: ['id', 'name']
          }
        ]
      });
      
      if (!optimization) return null;
      
      const result = optimization.toJSON();
      if (result.project) {
        result.gitlabProjectId = result.project.gitlabProjectId;
        result.projectName = result.project.name;
        delete result.project;
      }
      if (result.agent) {
        result.agentName = result.agent.name;
        delete result.agent;
      }
      
      return result;
    } catch (error) {
      logger.error('Error fetching optimization', { error });
      throw error;
    }
  }

  async updateOptimizationStatus(id, status, mrUrl = null) {
    try {
      const optimization = await Optimization.findByPk(id);
      
      if (!optimization) {
        throw new Error('Optimization not found');
      }

      optimization.status = status;
      
      if (mrUrl) {
        optimization.mrUrl = mrUrl;
      }
      
      if (status === 'in_progress') {
        optimization.appliedAt = new Date();
      }
      
      if (status === 'completed') {
        optimization.completedAt = new Date();
      }

      await optimization.save();
      
      return this.getOptimizationById(id);
    } catch (error) {
      logger.error('Error updating optimization', { error });
      throw error;
    }
  }

  async applyOptimization(id) {
    try {
      const optimization = await Optimization.findByPk(id, {
        include: [{
          model: Project,
          as: 'project'
        }]
      });
      
      if (!optimization) {
        throw new Error('Optimization not found');
      }

      optimization.status = 'in_progress';
      optimization.appliedAt = new Date();
      
      const mrUrl = `https://gitlab.com/${optimization.projectId}/merge_requests/${Date.now()}`;
      optimization.mrUrl = mrUrl;
      
      await optimization.save();
      
      // Simulate completion
      setTimeout(async () => {
        try {
          optimization.status = 'completed';
          optimization.completedAt = new Date();
          await optimization.save();
          logger.info('Optimization auto-completed', { id });
        } catch (error) {
          logger.error('Error auto-completing optimization', { error });
        }
      }, 5000);

      return this.getOptimizationById(id);
    } catch (error) {
      logger.error('Error applying optimization', { error });
      throw error;
    }
  }

  async getStats() {
    try {
      const total = await Optimization.count();
      const pending = await Optimization.count({ where: { status: 'pending' } });
      const inProgress = await Optimization.count({ where: { status: 'in_progress' } });
      const completed = await Optimization.count({ where: { status: 'completed' } });
      const failed = await Optimization.count({ where: { status: 'failed' } });
      
      const totalSavings = await Optimization.sum('estimatedSavings', {
        where: { status: 'completed' }
      });

      return {
        total,
        pending,
        inProgress,
        completed,
        failed,
        totalSavings: totalSavings || 0
      };
    } catch (error) {
      logger.error('Error fetching optimization stats', { error });
      throw error;
    }
  }
}

module.exports = new OptimizationService();