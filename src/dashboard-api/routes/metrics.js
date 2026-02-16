const express = require('express');
const router = express.Router();
const logger = require('../../utils/logger');

// Mock data for demonstration
let mockMetrics = [
  {
    id: '1',
    projectId: 'frontend-web',
    timestamp: new Date().toISOString(),
    duration: 1245,
    co2kg: 0.082,
    energyKwh: 0.173,
    ecoScore: 78,
    grade: 'B'
  },
  {
    id: '2',
    projectId: 'backend-api',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    duration: 2340,
    co2kg: 0.154,
    energyKwh: 0.324,
    ecoScore: 62,
    grade: 'D'
  },
  {
    id: '3',
    projectId: 'data-pipeline',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    duration: 3560,
    co2kg: 0.235,
    energyKwh: 0.495,
    ecoScore: 45,
    grade: 'F'
  }
];

// Get all metrics
router.get('/', (req, res) => {
  try {
    logger.info('Fetching all metrics');
    res.json({
      success: true,
      data: mockMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching metrics', { error });
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get metrics by project
router.get('/project/:projectId', (req, res) => {
  try {
    const { projectId } = req.params;
    const projectMetrics = mockMetrics.filter(m => m.projectId === projectId);
    
    logger.info(`Fetching metrics for project ${projectId}`);
    res.json({
      success: true,
      data: projectMetrics,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching project metrics', { error });
    res.status(500).json({ error: 'Failed to fetch project metrics' });
  }
});

// Get metrics by date range
router.get('/range', (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Filter metrics within date range
    const filtered = mockMetrics.filter(m => {
      const metricDate = new Date(m.timestamp);
      return metricDate >= new Date(startDate) && metricDate <= new Date(endDate);
    });
    
    res.json({
      success: true,
      data: filtered,
      count: filtered.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching metrics by range', { error });
    res.status(500).json({ error: 'Failed to fetch metrics by range' });
  }
});

// Get summary statistics
router.get('/summary', (req, res) => {
  try {
    const totalCO2 = mockMetrics.reduce((sum, m) => sum + m.co2kg, 0);
    const avgScore = mockMetrics.reduce((sum, m) => sum + m.ecoScore, 0) / mockMetrics.length;
    const totalEnergy = mockMetrics.reduce((sum, m) => sum + m.energyKwh, 0);
    
    res.json({
      success: true,
      data: {
        totalPipelines: mockMetrics.length,
        totalCO2: Number(totalCO2.toFixed(3)),
        averageScore: Math.round(avgScore),
        totalEnergy: Number(totalEnergy.toFixed(3)),
        projects: [...new Set(mockMetrics.map(m => m.projectId))].length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Error fetching summary', { error });
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

// Post new metric (for agent webhook)
router.post('/', (req, res) => {
  try {
    const newMetric = {
      id: String(mockMetrics.length + 1),
      ...req.body,
      timestamp: new Date().toISOString()
    };
    
    mockMetrics.push(newMetric);
    logger.info('New metric added', { id: newMetric.id });
    
    res.status(201).json({
      success: true,
      data: newMetric,
      message: 'Metric added successfully'
    });
  } catch (error) {
    logger.error('Error adding metric', { error });
    res.status(500).json({ error: 'Failed to add metric' });
  }
});

// Delete metric
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const initialLength = mockMetrics.length;
    mockMetrics = mockMetrics.filter(m => m.id !== id);
    
    if (mockMetrics.length === initialLength) {
      return res.status(404).json({ error: 'Metric not found' });
    }
    
    logger.info(`Metric ${id} deleted`);
    res.json({
      success: true,
      message: 'Metric deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting metric', { error });
    res.status(500).json({ error: 'Failed to delete metric' });
  }
});

module.exports = router;