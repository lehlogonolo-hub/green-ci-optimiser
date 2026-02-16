const { Project } = require('../src/database/models');
const logger = require('../src/utils/logger');

const projects = [
  { gitlabProjectId: 'frontend-web', name: 'Frontend Web App' },
  { gitlabProjectId: 'backend-api', name: 'Backend API' },
  { gitlabProjectId: 'data-pipeline', name: 'Data Pipeline' },
  { gitlabProjectId: 'mobile-app', name: 'Mobile App' },
  { gitlabProjectId: 'auth-service', name: 'Authentication Service' }
];

async function createProjects() {
  for (const projectData of projects) {
    try {
      const [project, created] = await Project.findOrCreate({
        where: { gitlabProjectId: projectData.gitlabProjectId },
        defaults: projectData
      });
      
      if (created) {
        logger.info(`Created project: ${projectData.gitlabProjectId}`);
      } else {
        logger.info(`Project already exists: ${projectData.gitlabProjectId}`);
      }
    } catch (error) {
      logger.error(`Error creating project ${projectData.gitlabProjectId}`, { error });
    }
  }
  
  logger.info('Project creation complete');
  process.exit(0);
}

createProjects();