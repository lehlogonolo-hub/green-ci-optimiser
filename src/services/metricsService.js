const { PipelineMetric, Project, sequelize } = require('../database/models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class MetricsService {
  async createMetric(data) {
    try {
      // Ensure project exists or create it
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

      const metric = await PipelineMetric.create({
        projectId: data.projectId,
        pipelineId: data.pipelineId || `pipeline-${Date.now()}`,
        duration: data.duration,
        jobCount: data.jobCount,
        energyKwh: data.energyKwh,
        co2kg: data.co2kg,
        ecoScore: data.ecoScore,
        grade: data.grade,
        metadata: data.metadata || {}
      });

      logger.info('Metric created', { id: metric.id });
      return metric;
    } catch (error) {
      logger.error('Error creating metric', { error });
      throw error;
    }
  }

  async getMetrics(filters = {}) {
    try {
      const where = {};
      
      if (filters.projectId) {
        where.projectId = filters.projectId;
      }
      
      if (filters.startDate && filters.endDate) {
        where.timestamp = {
          [Op.between]: [filters.startDate, filters.endDate]
        };
      }

      const metrics = await PipelineMetric.findAll({
        where,
        include: [{
          model: Project,
          as: 'project',
          attributes: ['name', 'gitlabProjectId']
        }],
        order: [['timestamp', 'DESC']],
        limit: filters.limit || 100
      });

      // Transform response
      return metrics.map(m => {
        const json = m.toJSON();
        if (json.project) {
          json.projectName = json.project.name;
          delete json.project;
        }
        return json;
      });
    } catch (error) {
      logger.error('Error fetching metrics', { error });
      throw error;
    }
  }

  async getMetricsByProject(projectId, days = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const metrics = await PipelineMetric.findAll({
        where: {
          projectId,
          timestamp: {
            [Op.gte]: startDate
          }
        },
        include: [{
          model: Project,
          as: 'project',
          attributes: ['name']
        }],
        order: [['timestamp', 'DESC']]
      });

      return metrics.map(m => {
        const json = m.toJSON();
        if (json.project) {
          json.projectName = json.project.name;
          delete json.project;
        }
        return json;
      });
    } catch (error) {
      logger.error('Error fetching project metrics', { error });
      throw error;
    }
  }

  async getSummary() {
    try {
      // Get total count
      const totalPipelines = await PipelineMetric.count();
      
      // Get aggregates using raw query
      const [aggregates] = await sequelize.query(`
        SELECT 
          COALESCE(SUM(co2_kg), 0) as totalCO2,
          COALESCE(AVG(eco_score), 0) as avgScore,
          COALESCE(SUM(energy_kwh), 0) as totalEnergy,
          COUNT(DISTINCT project_id) as uniqueProjects
        FROM pipeline_metrics
      `);

      // Get total projects count
      const projects = await Project.count();

      const summary = {
        totalPipelines,
        totalCO2: Number(aggregates[0]?.totalCO2 || 0).toFixed(3),
        averageScore: Math.round(aggregates[0]?.avgScore || 0),
        totalEnergy: Number(aggregates[0]?.totalEnergy || 0).toFixed(3),
        projects
      };

      logger.info('Summary calculated', summary);
      return summary;
    } catch (error) {
      logger.error('Error fetching summary', { error: error.message });
      throw error;
    }
  }

  async deleteMetric(id) {
    try {
      const deleted = await PipelineMetric.destroy({
        where: { id }
      });
      
      return deleted > 0;
    } catch (error) {
      logger.error('Error deleting metric', { error });
      throw error;
    }
  }
}

module.exports = new MetricsService();