const { sequelize, Project, Agent, PipelineMetric, Optimization } = require('../src/database/models');
const { v4: uuidv4 } = require('uuid');
const logger = require('../src/utils/logger');

async function setupDatabase() {
  try {
    logger.info('🔄 Setting up database...');
    
    // Force sync database (this will drop and recreate tables)
    await sequelize.sync({ force: true });
    logger.info('✅ Database tables created');

    // Create projects
    const projects = await Project.bulkCreate([
      {
        id: uuidv4(),
        gitlabProjectId: 'frontend-web',
        name: 'Frontend Web App',
        description: 'Main frontend application'
      },
      {
        id: uuidv4(),
        gitlabProjectId: 'backend-api',
        name: 'Backend API',
        description: 'REST API service'
      },
      {
        id: uuidv4(),
        gitlabProjectId: 'data-pipeline',
        name: 'Data Pipeline',
        description: 'ETL and data processing'
      },
      {
        id: uuidv4(),
        gitlabProjectId: 'mobile-app',
        name: 'Mobile App',
        description: 'React Native mobile application'
      },
      {
        id: uuidv4(),
        gitlabProjectId: 'auth-service',
        name: 'Authentication Service',
        description: 'User authentication and authorization'
      }
    ]);
    logger.info(`✅ Created ${projects.length} projects`);

    // Create agents
    const agents = await Agent.bulkCreate([
      {
        id: uuidv4(),
        name: 'green-ci-optimizer',
        status: 'active',
        version: '2.0.0',
        totalAnalyses: 156,
        totalMRsCreated: 42,
        avgResponseTime: 28.5,
        lastRun: new Date()
      },
      {
        id: uuidv4(),
        name: 'green-ci-sentinel',
        status: 'active',
        version: '1.0.0',
        totalAnalyses: 1234,
        totalMRsCreated: 23,
        avgResponseTime: 12.3,
        lastRun: new Date()
      },
      {
        id: uuidv4(),
        name: 'green-ci-advisor',
        status: 'idle',
        version: '1.5.0',
        totalAnalyses: 89,
        totalMRsCreated: 0,
        avgResponseTime: 15.7,
        lastRun: new Date(Date.now() - 7200000)
      }
    ]);
    logger.info(`✅ Created ${agents.length} agents`);

    // Create sample metrics
    const metrics = [];
    const now = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const project = projects[i % projects.length];
      const duration = Math.floor(Math.random() * 1800) + 300;
      const co2kg = (Math.random() * 0.15 + 0.05).toFixed(3);
      const energyKwh = (co2kg * 2.1).toFixed(3);
      const ecoScore = Math.floor(Math.random() * 40) + 60;
      
      let grade = 'A';
      if (ecoScore < 90) grade = 'B';
      if (ecoScore < 75) grade = 'C';
      if (ecoScore < 60) grade = 'D';
      if (ecoScore < 40) grade = 'F';
      
      metrics.push({
        id: uuidv4(),
        projectId: project.gitlabProjectId,
        pipelineId: `pipeline-${Date.now()}-${i}`,
        timestamp: date,
        duration,
        jobCount: Math.floor(Math.random() * 15) + 5,
        energyKwh: parseFloat(energyKwh),
        co2kg: parseFloat(co2kg),
        ecoScore,
        grade,
        metadata: {}
      });
    }
    
    await PipelineMetric.bulkCreate(metrics);
    logger.info(`✅ Created ${metrics.length} pipeline metrics`);

    // Create sample optimizations
    const optimizations = await Optimization.bulkCreate([
      {
        id: uuidv4(),
        title: 'Enable Dependency Caching',
        description: 'Add caching for node_modules to reduce build time by up to 40%',
        projectId: projects[0].gitlabProjectId,
        type: 'caching',
        impact: 'high',
        estimatedSavings: 0.045,
        status: 'pending',
        metadata: {
          patch: `cache:\n  paths:\n    - node_modules/`
        }
      },
      {
        id: uuidv4(),
        title: 'Consolidate Test Jobs',
        description: 'Merge 12 parallel test jobs into 4 to reduce overhead',
        projectId: projects[1].gitlabProjectId,
        type: 'parallelization',
        impact: 'medium',
        estimatedSavings: 0.021,
        status: 'in_progress',
        appliedAt: new Date(Date.now() - 86400000),
        mrUrl: 'https://gitlab.com/backend-api/merge_requests/123',
        metadata: {
          jobs: ['test-1', 'test-2', 'test-3']
        }
      },
      {
        id: uuidv4(),
        title: 'Use Alpine Base Images',
        description: 'Switch from node:20 to node:20-alpine for smaller containers',
        projectId: projects[2].gitlabProjectId,
        type: 'container',
        impact: 'low',
        estimatedSavings: 0.008,
        status: 'completed',
        appliedAt: new Date(Date.now() - 172800000),
        completedAt: new Date(Date.now() - 86400000),
        mrUrl: 'https://gitlab.com/data-pipeline/merge_requests/456',
        metadata: {
          image: 'node:20-alpine',
          patch: `image: node:20-alpine`
        }
      }
    ]);
    logger.info(`✅ Created ${optimizations.length} optimizations`);

    logger.info('🎉 Database setup complete!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();