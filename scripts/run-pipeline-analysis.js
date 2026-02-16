#!/usr/bin/env node

require('dotenv').config();
const GitLabClient = require('../src/utils/gitlab-client');
const { estimateCarbon, calculateEcoScore } = require('../src/carbon/calculator');
const { analyzePipelinePatterns } = require('../src/analyzer/pipeline-analyzer');
const { generateOptimizations } = require('../src/optimizer/suggestions');
const logger = require('../src/utils/logger');

async function main() {
  try {
    // Get pipeline info from environment (set by GitLab Duo Agent)
    const pipelineId = process.env.CI_PIPELINE_ID;
    const projectId = process.env.CI_PROJECT_ID;
    const gitlabToken = process.env.GITLAB_TOKEN;

    if (!pipelineId || !projectId) {
      throw new Error('Missing pipeline context');
    }

    logger.info(`Analyzing pipeline ${pipelineId} for project ${projectId}`);

    // Initialize GitLab client
    const client = new GitLabClient(gitlabToken);

    // Fetch pipeline details
    const pipeline = await client.getPipeline(projectId, pipelineId);
    const jobs = await client.getPipelineJobs(projectId, pipelineId);

    // Calculate metrics
    const carbonMetrics = estimateCarbon(pipeline.duration);
    const ecoScore = calculateEcoScore(pipeline.duration, jobs.length);
    const patterns = await analyzePipelinePatterns(pipeline, jobs);
    const optimizations = generateOptimizations(pipeline, jobs, patterns);

    // Prepare analysis result
    const analysis = {
      pipelineId,
      projectId,
      timestamp: new Date().toISOString(),
      metrics: {
        duration: pipeline.duration,
        jobCount: jobs.length,
        ...carbonMetrics,
        ...ecoScore
      },
      patterns,
      optimizations,
      hasOptimizations: optimizations.length > 0
    };

    // Log results
    logger.info('Analysis complete', { 
      ecoScore: analysis.metrics.score,
      optimizationCount: optimizations.length 
    });

    // Output for agent to capture
    console.log(JSON.stringify(analysis));

    // Post to dashboard if URL configured
    if (process.env.DASHBOARD_URL) {
      await fetch(`${process.env.DASHBOARD_URL}/api/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.DASHBOARD_API_KEY
        },
        body: JSON.stringify(analysis)
      });
    }

  } catch (error) {
    logger.error('Analysis failed', { error: error.message });
    process.exit(1);
  }
}

main();