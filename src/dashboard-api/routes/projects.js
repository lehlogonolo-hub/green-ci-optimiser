const express = require('express');
const router = express.Router();
const { Project } = require('../../database/models');
const logger = require('../../utils/logger');

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await Project.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json({
      success: true,
      data: projects,
      count: projects.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching projects', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch projects',
      message: error.message 
    });
  }
});

// Get project by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    res.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching project', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch project',
      message: error.message 
    });
  }
});

// Get project by GitLab ID
router.get('/gitlab/:gitlabId', async (req, res) => {
  try {
    const { gitlabId } = req.params;
    const project = await Project.findOne({
      where: { gitlabProjectId: gitlabId }
    });
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    res.json({
      success: true,
      data: project,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching project by GitLab ID', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch project',
      message: error.message 
    });
  }
});

// Create new project
router.post('/', async (req, res) => {
  try {
    const { gitlabProjectId, name, description } = req.body;
    
    if (!gitlabProjectId || !name) {
      return res.status(400).json({
        success: false,
        error: 'gitlabProjectId and name are required'
      });
    }
    
    // Check if project already exists
    const existing = await Project.findOne({
      where: { gitlabProjectId }
    });
    
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Project already exists',
        data: existing
      });
    }
    
    const project = await Project.create({
      gitlabProjectId,
      name,
      description,
      settings: req.body.settings || {}
    });
    
    logger.info('Project created', { id: project.id, gitlabId: gitlabProjectId });
    
    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    logger.error('Error creating project', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to create project',
      message: error.message 
    });
  }
});

// Update project
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    await project.update(req.body);
    
    logger.info('Project updated', { id });
    
    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully'
    });
  } catch (error) {
    logger.error('Error updating project', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to update project',
      message: error.message 
    });
  }
});

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    await project.destroy();
    
    logger.info('Project deleted', { id });
    
    res.json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting project', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete project',
      message: error.message 
    });
  }
});

// Get project metrics
router.get('/:id/metrics', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    const metrics = await project.getPipelineMetrics({
      where: {
        timestamp: {
          [require('sequelize').Op.gte]: startDate
        }
      },
      order: [['timestamp', 'DESC']]
    });
    
    res.json({
      success: true,
      data: metrics,
      count: metrics.length,
      project: project.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching project metrics', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch project metrics',
      message: error.message 
    });
  }
});

// Get project optimizations
router.get('/:id/optimizations', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    const project = await Project.findByPk(id);
    
    if (!project) {
      return res.status(404).json({ 
        success: false,
        error: 'Project not found' 
      });
    }
    
    const where = {};
    if (status) where.status = status;
    
    const optimizations = await project.getOptimizations({
      where,
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: optimizations,
      count: optimizations.length,
      project: project.name,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching project optimizations', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch project optimizations',
      message: error.message 
    });
  }
});

module.exports = router;