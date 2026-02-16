const { sequelize, Project, PipelineMetric, Optimization, Agent } = require('../src/database/models');
const logger = require('../src/utils/logger');

async function seedDatabase() {
  try {
    logger.info('Seeding database...');

    // Sync database
    await sequelize.sync({ force: true });
    logger.info('Database synced');

    // Create projects
    const projects = await Project.bulkCreate([
      {
        gitlabProjectId: 'frontend-web',
        name: 'Frontend Web App',
        description: 'Main frontend application'
      },
      {
        gitlabProjectId: 'backend-api',
        name: 'Backend API',
        description: 'REST API service'
      },
      {
        gitlabProjectId: 'data-pipeline',
        name: 'Data Pipeline',
        description: 'ETL and data processing'
      }
    ]);
    logger.info(`Created ${projects.length} projects`);

    // Create agents
    const agents = await Agent.bulkCreate([
      {
        name: 'green-ci-optimizer',
        status: 'active',
        version: '2.0.0',
        totalAnalyses: 156,
        totalMRsCreated: 42,
        avgResponseTime: 28.5
      },
      {
        name: 'green-ci-sentinel',
        status: 'active',
        version: '1.0.0',
        totalAnalyses: 1234,
        totalMRsCreated: 23,
        avgResponseTime: 12.3
      },
      {
        name: 'green-ci-advisor',
        status: 'idle',
        version: '1.5.0',
        totalAnalyses: 89,
        totalMRsCreated: 0,
        avgResponseTime: 15.7
      }
    ]);
    logger.info(`Created ${agents.length} agents`);

    // Create metrics
    const now = new Date();
    const metrics = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      metrics.push({
        projectId: projects[i % 3].gitlabProjectId,
        pipelineId: `pipeline-${Date.now() - i * 86400000}`,
        timestamp: date,
        duration: Math.floor(Math.random() * 2000) + 300,
        jobCount: Math.floor(Math.random() * 20) + 5,
        energyKwh: Math.random() * 0.3 + 0.1,
        co2kg: Math.random() * 0.15 + 0.05,
        ecoScore: Math.floor(Math.random() * 40) + 60,
        grade: ['A','B','C','D','F'][Math.floor(Math.random() * 5)],
        metadata: {}
      });
    }
    
    await PipelineMetric.bulkCreate(metrics);
    logger.info(`Created ${metrics.length} metrics`);

    // Create optimizations
    const optimizations = await Optimization.bulkCreate([
      {
        title: 'Enable Dependency Caching',
        description: 'Add caching for node_modules to reduce build time',
        projectId: 'frontend-web',
        type: 'caching',
        impact: 'high',
        estimatedSavings: 0.045,
        status: 'pending',
        metadata: { files: ['.gitlab-ci.yml'] }
      },
      {
        title: 'Consolidate Test Jobs',
        description: 'Merge 12 parallel test jobs into 4 to reduce overhead',
        projectId: 'backend-api',
        type: 'parallelization',
        impact: 'medium',
        estimatedSavings: 0.021,
        status: 'in_progress',
        appliedAt: new Date(Date.now() - 86400000),
        mrUrl: 'https://gitlab.com/backend-api/merge_requests/123',
        metadata: { jobs: ['test-1', 'test-2', 'test-3'] }
      },
      {
        title: 'Use Alpine Base Images',
        description: 'Switch from node:20 to node:20-alpine for smaller containers',
        projectId: 'data-pipeline',
        type: 'container',
        impact: 'low',
        estimatedSavings: 0.008,
        status: 'completed',
        appliedAt: new Date(Date.now() - 172800000),
        completedAt: new Date(Date.now() - 86400000),
        mrUrl: 'https://gitlab.com/data-pipeline/merge_requests/456',
        metadata: { image: 'node:20-alpine' }
      }
    ]);
    logger.info(`Created ${optimizations.length} optimizations`);

    logger.info('✅ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed', { error });
    process.exit(1);
  }
}

seedDatabase();