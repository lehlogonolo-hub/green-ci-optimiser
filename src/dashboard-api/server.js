const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');

// Import routes
const metricsRouter = require('./routes/metrics');
const optimizationsRouter = require('./routes/optimizations');
const agentsRouter = require('./routes/agents');

// Import middleware
const authMiddleware = require('./middleware/auth');

// Import utils
const logger = require('../utils/logger');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.DASHBOARD_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // Disable for development
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Authentication (except for health check)
app.use('/api/', (req, res, next) => {
  if (req.path === '/health') return next();
  return authMiddleware(req, res, next);
});

// Routes
app.use('/api/metrics', metricsRouter);
app.use('/api/optimizations', optimizationsRouter);
app.use('/api/agents', agentsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '2.0.0',
    uptime: process.uptime()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'Green CI Optimizer API',
    version: '2.0.0',
    description: 'API for Green CI Optimizer dashboard',
    endpoints: {
      metrics: '/api/metrics',
      optimizations: '/api/optimizations',
      agents: '/api/agents',
      health: '/api/health'
    },
    documentation: 'https://github.com/your-username/green-ci-optimizer/docs/API.md'
  });
});

// WebSocket for real-time updates
io.on('connection', (socket) => {
  logger.info('Dashboard client connected', { socketId: socket.id });

  socket.on('subscribe:pipeline', (pipelineId) => {
    socket.join(`pipeline:${pipelineId}`);
    logger.debug(`Client subscribed to pipeline ${pipelineId}`);
  });

  socket.on('subscribe:project', (projectId) => {
    socket.join(`project:${projectId}`);
    logger.debug(`Client subscribed to project ${projectId}`);
  });

  socket.on('unsubscribe:pipeline', (pipelineId) => {
    socket.leave(`pipeline:${pipelineId}`);
  });

  socket.on('unsubscribe:project', (projectId) => {
    socket.leave(`project:${projectId}`);
  });

  socket.on('disconnect', () => {
    logger.info('Dashboard client disconnected', { socketId: socket.id });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('API error', { 
    error: err.message, 
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  
  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler - FIXED: Use proper Express wildcard syntax
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Cannot ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  logger.info(`🚀 Green CI Optimizer API server running on port ${PORT}`);
  logger.info(`📊 Dashboard URL: http://localhost:${PORT}`);
  logger.info(`📚 API Documentation: http://localhost:${PORT}/`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
});

module.exports = { app, io, httpServer };