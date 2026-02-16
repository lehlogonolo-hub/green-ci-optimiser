const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

let mockOptimizations = [
  {
    id: 'opt-1',
    title: 'Enable Dependency Caching',
    description: 'Add caching for node_modules to reduce build time',
    projectId: 'frontend-web',
    impact: 'high',
    estimatedSavings: 0.045,
    status: 'pending',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    mrUrl: null
  },
  {
    id: 'opt-2',
    title: 'Consolidate Test Jobs',
    description: 'Merge 12 parallel test jobs into 4 to reduce overhead',
    projectId: 'backend-api',
    impact: 'medium',
    estimatedSavings: 0.021,
    status: 'in_progress',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    mrUrl: 'https://gitlab.com/backend-api/merge_requests/123'
  },
  {
    id: 'opt-3',
    title: 'Use Alpine Base Images',
    description: 'Switch from node:20 to node:20-alpine for smaller containers',
    projectId: 'data-pipeline',
    impact: 'low',
    estimatedSavings: 0.008,
    status: 'completed',
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    completedAt: new Date(Date.now() - 172800000).toISOString(),
    mrUrl: 'https://gitlab.com/data-pipeline/merge_requests/456'
  }
];

// Get all optimizations
router.get('/', (req, res) => {
  try {
    const { status, projectId } = req.query;
    let filtered = [...mockOptimizations];
    
    if (status) {
      filtered = filtered.filter(o => o.status === status);
    }
    
    if (projectId) {
      filtered = filtered.filter(o => o.projectId === projectId);
    }
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching optimizations', { error });
    res.status(500).json({ error: 'Failed to fetch optimizations' });
  }
});

// Get optimization by ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const optimization = mockOptimizations.find(o => o.id === id);
    
    if (!optimization) {
      return res.status(404).json({ error: 'Optimization not found' });
    }
    
    res.json({
      success: true,
      data: optimization
    });
  } catch (error) {
    logger.error('Error fetching optimization', { error });
    res.status(500).json({ error: 'Failed to fetch optimization' });
  }
});

// Create new optimization
router.post('/', (req, res) => {
  try {
    const newOptimization = {
      id: `opt-${Date.now()}`,
      ...req.body,
      status: 'pending',
      createdAt: new Date().toISOString(),
      mrUrl: null
    };
    
    mockOptimizations.push(newOptimization);
    logger.info('New optimization created', { id: newOptimization.id });
    
    res.status(201).json({
      success: true,
      data: newOptimization,
      message: 'Optimization created successfully'
    });
  } catch (error) {
    logger.error('Error creating optimization', { error });
    res.status(500).json({ error: 'Failed to create optimization' });
  }
});

// Update optimization status
router.patch('/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, mrUrl } = req.body;
    
    const optimization = mockOptimizations.find(o => o.id === id);
    if (!optimization) {
      return res.status(404).json({ error: 'Optimization not found' });
    }
    
    optimization.status = status;
    if (mrUrl) optimization.mrUrl = mrUrl;
    if (status === 'completed') {
      optimization.completedAt = new Date().toISOString();
    }
    
    logger.info(`Optimization ${id} status updated to ${status}`);
    
    res.json({
      success: true,
      data: optimization,
      message: 'Optimization updated successfully'
    });
  } catch (error) {
    logger.error('Error updating optimization', { error });
    res.status(500).json({ error: 'Failed to update optimization' });
  }
});

// Apply optimization (trigger MR creation)
router.post('/:id/apply', (req, res) => {
  try {
    const { id } = req.params;
    const optimization = mockOptimizations.find(o => o.id === id);
    
    if (!optimization) {
      return res.status(404).json({ error: 'Optimization not found' });
    }
    
    // Simulate MR creation
    optimization.status = 'in_progress';
    optimization.mrUrl = `https://gitlab.com/${optimization.projectId}/merge_requests/${Date.now()}`;
    
    logger.info(`Optimization ${id} applied, MR created`);
    
    res.json({
      success: true,
      data: optimization,
      message: 'Optimization applied successfully',
      mrUrl: optimization.mrUrl
    });
  } catch (error) {
    logger.error('Error applying optimization', { error });
    res.status(500).json({ error: 'Failed to apply optimization' });
  }
});

module.exports = router;