const express = require('express');
const router = express.Router();
const metricsService = require('../../services/metricsService');
const logger = require('../../utils/logger');

// Get all metrics with filters
router.get('/', async (req, res) => {
  try {
    const { projectId, startDate, endDate, limit } = req.query;
    
    const filters = {};
    if (projectId) filters.projectId = projectId;
    if (startDate && endDate) {
      filters.startDate = new Date(startDate);
      filters.endDate = new Date(endDate);
    }
    if (limit) filters.limit = parseInt(limit);

    const metrics = await metricsService.getMetrics(filters);
    
    res.json({
      success: true,
      data: metrics,
      count: metrics.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching metrics', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch metrics',
      message: error.message 
    });
  }
});

// Get metrics by project
router.get('/project/:projectId', async (req, res) => {
  try {
    const { projectId } = req.params;
    const { days = 30 } = req.query;
    
    const metrics = await metricsService.getMetricsByProject(projectId, parseInt(days));
    
    res.json({
      success: true,
      data: metrics,
      count: metrics.length,
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

// Get metrics by date range
router.get('/range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        success: false,
        error: 'startDate and endDate are required' 
      });
    }

    const metrics = await metricsService.getMetrics({
      startDate: new Date(startDate),
      endDate: new Date(endDate)
    });
    
    res.json({
      success: true,
      data: metrics,
      count: metrics.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching metrics by range', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch metrics by range',
      message: error.message 
    });
  }
});

// Get summary statistics
router.get('/summary', async (req, res) => {
  try {
    const summary = await metricsService.getSummary();
    
    res.json({
      success: true,
      data: summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching summary', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch summary',
      message: error.message 
    });
  }
});

// Post new metric (for agent webhook)
router.post('/', async (req, res) => {
  try {
    const metric = await metricsService.createMetric(req.body);
    
    logger.info('New metric added', { id: metric.id });
    
    res.status(201).json({
      success: true,
      data: metric,
      message: 'Metric added successfully'
    });
  } catch (error) {
    logger.error('Error adding metric', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to add metric',
      message: error.message 
    });
  }
});

// Delete metric
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await metricsService.deleteMetric(id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false,
        error: 'Metric not found' 
      });
    }
    
    logger.info(`Metric ${id} deleted`);
    res.json({
      success: true,
      message: 'Metric deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting metric', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete metric',
      message: error.message 
    });
  }
});

module.exports = router;