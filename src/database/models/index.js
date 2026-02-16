const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('../../utils/logger');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(dbConfig);

// Import models
const PipelineMetric = require('./PipelineMetric')(sequelize);
const Optimization = require('./Optimization')(sequelize);
const Agent = require('./Agent')(sequelize);
const Project = require('./Project')(sequelize);

// Define associations
Project.hasMany(PipelineMetric, { foreignKey: 'projectId' });
PipelineMetric.belongsTo(Project, { foreignKey: 'projectId' });

Project.hasMany(Optimization, { foreignKey: 'projectId' });
Optimization.belongsTo(Project, { foreignKey: 'projectId' });

Agent.hasMany(Optimization, { foreignKey: 'agentId' });
Optimization.belongsTo(Agent, { foreignKey: 'agentId' });

const db = {
  sequelize,
  Sequelize,
  PipelineMetric,
  Optimization,
  Agent,
  Project
};

// Test connection
async function testConnection() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Sync models (in development)
    if (env === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('Database synced');
    }
  } catch (error) {
    logger.error('Unable to connect to database:', error);
  }
}

testConnection();

module.exports = db;