const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('../../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

// Import models
const Project = require('./Project')(sequelize);
const PipelineMetric = require('./PipelineMetric')(sequelize);
const Optimization = require('./Optimization')(sequelize);
const Agent = require('./Agent')(sequelize);

// Define associations
Project.hasMany(PipelineMetric, {
  foreignKey: 'projectId',
  sourceKey: 'gitlabProjectId',
  as: 'metrics'
});

PipelineMetric.belongsTo(Project, {
  foreignKey: 'projectId',
  targetKey: 'gitlabProjectId',
  as: 'project'
});

Project.hasMany(Optimization, {
  foreignKey: 'projectId',
  sourceKey: 'gitlabProjectId',
  as: 'optimizations'
});

Optimization.belongsTo(Project, {
  foreignKey: 'projectId',
  targetKey: 'gitlabProjectId',
  as: 'project'
});

Agent.hasMany(Optimization, {
  foreignKey: 'agentId',
  as: 'optimizations'
});

Optimization.belongsTo(Agent, {
  foreignKey: 'agentId',
  as: 'agent'
});

const db = {
  sequelize,
  Sequelize,
  Project,
  PipelineMetric,
  Optimization,
  Agent
};

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    if (env === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced');
    }
  } catch (error) {
    logger.error('Unable to connect to database:', error);
  }
}

// Only run testConnection if not in a test environment
if (require.main === module) {
  testConnection();
}

module.exports = db;