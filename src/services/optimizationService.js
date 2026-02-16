const { Optimization, Project } = require('../database/models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class OptimizationService {
  async createOptimization(data) {
    try {
      // Ensure project exists
      let project = await Project.findOne({
        where: { gitlabProjectId: data.projectId }
      });
      
      if (!project) {
        project = await Project.create({
          id: uuidv4(),
          gitlabProjectId: data.projectId,
          name: data.projectName || `Project-${data.projectId}`
        });
      }

      const optimization = await Optimization.create({
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        type: data.type || 'general',
        impact: data.impact || 'medium',
        estimatedSavings: data.estimatedSavings || 0,
        status: data.status || 'pending',
        metadata: data.metadata || {}
      });

      logger.info('Optimization created', { id: optimization.id });
      return optimization;
    } catch (error) {
      logger.error('Error creating optimization', { error });
      throw error;
    }
  }

  async getOptimizations(filters = {}) {
    try {
      const where = {};
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.projectId) {
        where.projectId = filters.projectId;
      }
      
      if (filters.impact) {
        where.impact = filters.impact;
      }

      const optimizations = await Optimization.findAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 100
      });

      return optimizations;
    } catch (error) {
      logger.error('Error fetching optimizations', { error });
      throw error;
    }
  }

  async getOptimizationById(id) {
    try {
      const optimization = await Optimization.findByPk(id);
      return optimization;
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
      
      logger.info('Optimization status updated', { id, status });
      return optimization;
    } catch (error) {
      logger.error('Error updating optimization', { error });
      throw error;
    }
  }

  async applyOptimization(id) {
    try {
      const optimization = await Optimization.findByPk(id);
      
      if (!optimization) {
        throw new Error('Optimization not found');
      }

      // Update status to in_progress
      optimization.status = 'in_progress';
      optimization.appliedAt = new Date();
      
      // Generate MR URL (in real implementation, this would call GitLab API)
      const mrUrl = `https://gitlab.com/${optimization.projectId}/merge_requests/${Date.now()}`;
      optimization.mrUrl = mrUrl;
      
      await optimization.save();
      
      // Simulate completion after 5 seconds (in real implementation, this would be async)
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

      return optimization;
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