const express = require('express');
const router = express.Router();
const optimizationService = require('../../services/optimizationService');
const logger = require('../../utils/logger');

// Get all optimizations with filters
router.get('/', async (req, res) => {
  try {
    const { status, projectId, impact, limit } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (projectId) filters.projectId = projectId;
    if (impact) filters.impact = impact;
    if (limit) filters.limit = parseInt(limit);

    const optimizations = await optimizationService.getOptimizations(filters);
    
    res.json({
      success: true,
      data: optimizations,
      count: optimizations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching optimizations', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch optimizations',
      message: error.message 
    });
  }
});

// Get optimization by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const optimization = await optimizationService.getOptimizationById(id);
    
    if (!optimization) {
      return res.status(404).json({ 
        success: false,
        error: 'Optimization not found' 
      });
    }
    
    res.json({
      success: true,
      data: optimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching optimization', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch optimization',
      message: error.message 
    });
  }
});

// Get optimization stats
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await optimizationService.getStats();
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching stats', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch stats',
      message: error.message 
    });
  }
});

// Create new optimization
router.post('/', async (req, res) => {
  try {
    const optimization = await optimizationService.createOptimization(req.body);
    
    logger.info('New optimization created', { id: optimization.id });
    
    res.status(201).json({
      success: true,
      data: optimization,
      message: 'Optimization created successfully'
    });
  } catch (error) {
    logger.error('Error creating optimization', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to create optimization',
      message: error.message 
    });
  }
});

// Update optimization status
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, mrUrl } = req.body;
    
    const optimization = await optimizationService.updateOptimizationStatus(id, status, mrUrl);
    
    logger.info(`Optimization ${id} status updated to ${status}`);
    
    res.json({
      success: true,
      data: optimization,
      message: 'Optimization updated successfully'
    });
  } catch (error) {
    logger.error('Error updating optimization', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to update optimization',
      message: error.message 
    });
  }
});

// Apply optimization (trigger MR creation)
router.post('/:id/apply', async (req, res) => {
  try {
    const { id } = req.params;
    
    const optimization = await optimizationService.applyOptimization(id);
    
    logger.info(`Optimization ${id} applied, MR created`);
    
    res.json({
      success: true,
      data: optimization,
      message: 'Optimization applied successfully',
      mrUrl: optimization.mrUrl
    });
  } catch (error) {
    logger.error('Error applying optimization', { error });
    res.status(500).json({ 
      success: false,
      error: 'Failed to apply optimization',
      message: error.message 
    });
  }
});

module.exports = router;