const logger = require('../../utils/logger');

// Simple API key authentication for demo
const API_KEYS = process.env.API_KEYS ? 
  process.env.API_KEYS.split(',') : 
  ['demo-key-123', 'test-key-456'];

const authMiddleware = (req, res, next) => {
  try {
    const apiKey = req.header('X-API-Key');
    
    // Skip auth for health check
    if (req.path === '/health') {
      return next();
    }
    
    if (!apiKey) {
      logger.warn('Missing API key', { path: req.path });
      return res.status(401).json({ 
        error: 'API key is required',
        message: 'Please provide an X-API-Key header'
      });
    }
    
    if (!API_KEYS.includes(apiKey)) {
      logger.warn('Invalid API key', { path: req.path });
      return res.status(403).json({ 
        error: 'Invalid API key',
        message: 'The provided API key is not valid'
      });
    }
    
    // Add API key info to request
    req.apiKey = apiKey;
    next();
  } catch (error) {
    logger.error('Auth middleware error', { error });
    res.status(500).json({ error: 'Authentication failed' });
  }
};

module.exports = authMiddleware;