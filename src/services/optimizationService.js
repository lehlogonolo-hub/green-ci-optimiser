const { Optimization, Project } = require('../database/models');
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
        
        // Create the project with both gitlabProjectId and internal ID
        project = await Project.create({
          id: uuidv4(),
          gitlabProjectId: data.projectId,
          name: data.projectName || data.projectId,
          description: data.projectDescription || `Auto-created for project ${data.projectId}`,
          settings: {}
        });
        
        logger.info(`Project ${data.projectId} created automatically with ID: ${project.id}`);
      }

      // Now create the optimization using the project's internal ID (project.id)
      const optimizationData = {
        title: data.title,
        description: data.description,
        projectId: project.id,  // This is the internal UUID, not the gitlabProjectId
        type: data.type || 'general',
        impact: data.impact || 'medium',
        estimatedSavings: data.estimatedSavings || 0,
        status: data.status || 'pending',
        metadata: data.metadata || {}
      };
      
      logger.info('Creating optimization with data:', optimizationData);
      
      const optimization = await Optimization.create(optimizationData);

      logger.info('Optimization created successfully', { 
        id: optimization.id, 
        projectId: data.projectId,
        internalProjectId: project.id 
      });
      
      // Return the optimization with both IDs for clarity
      const result = optimization.toJSON();
      result.gitlabProjectId = project.gitlabProjectId;
      result.projectName = project.name;
      
      return result;
    } catch (error) {
      logger.error('Error creating optimization', { error: error.message, stack: error.stack, data });
      throw error;
    }
  }

  async getOptimizations(filters = {}) {
    try {
      const where = {};
      const include = [{
        model: Project,
        as: 'Project',
        attributes: ['id', 'gitlabProjectId', 'name']
      }];
      
      if (filters.status) {
        where.status = filters.status;
      }
      
      if (filters.impact) {
        where.impact = filters.impact;
      }

      // Handle projectId filter - it could be gitlabProjectId or internal ID
      if (filters.projectId) {
        // Try to find the project first
        const project = await Project.findOne({
          where: {
            [Op.or]: [
              { id: filters.projectId },
              { gitlabProjectId: filters.projectId }
            ]
          }
        });
        
        if (project) {
          where.projectId = project.id;
        } else {
          // No matching project, return empty array
          return [];
        }
      }

      const optimizations = await Optimization.findAll({
        where,
        include,
        order: [['createdAt', 'DESC']],
        limit: filters.limit || 100
      });

      // Transform the response to include gitlabProjectId at the top level
      return optimizations.map(opt => {
        const optJson = opt.toJSON();
        if (optJson.Project) {
          optJson.gitlabProjectId = optJson.Project.gitlabProjectId;
          optJson.projectName = optJson.Project.name;
          delete optJson.Project;
        }
        return optJson;
      });
    } catch (error) {
      logger.error('Error fetching optimizations', { error });
      throw error;
    }
  }

  async getOptimizationById(id) {
    try {
      const optimization = await Optimization.findByPk(id, {
        include: [{
          model: Project,
          as: 'Project',
          attributes: ['id', 'gitlabProjectId', 'name']
        }]
      });
      
      if (!optimization) return null;
      
      // Transform the response
      const result = optimization.toJSON();
      if (result.Project) {
        result.gitlabProjectId = result.Project.gitlabProjectId;
        result.projectName = result.Project.name;
        delete result.Project;
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
      
      logger.info('Optimization status updated', { id, status });
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
          as: 'Project'
        }]
      });
      
      if (!optimization) {
        throw new Error('Optimization not found');
      }

      // Update status to in_progress
      optimization.status = 'in_progress';
      optimization.appliedAt = new Date();
      
      // Generate MR URL using gitlabProjectId
      const mrUrl = `https://gitlab.com/${optimization.Project.gitlabProjectId}/merge_requests/${Date.now()}`;
      optimization.mrUrl = mrUrl;
      
      await optimization.save();
      
      // Simulate completion after 5 seconds
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

      // Get top projects by savings
      const [results] = await Optimization.sequelize.query(`
        SELECT 
          p.gitlab_project_id as projectId,
          p.name as projectName,
          SUM(o.estimated_savings) as totalSavings,
          COUNT(o.id) as optimizationCount
        FROM optimizations o
        JOIN projects p ON p.id = o.project_id
        WHERE o.status = 'completed'
        GROUP BY p.id, p.gitlab_project_id, p.name
        ORDER BY totalSavings DESC
        LIMIT 5
      `);

      return {
        total,
        pending,
        inProgress,
        completed,
        failed,
        totalSavings: totalSavings || 0,
        topProjects: results || []
      };
    } catch (error) {
      logger.error('Error fetching optimization stats', { error });
      throw error;
    }
  }
}

module.exports = new OptimizationService();