/**
 * Pipeline Analyzer Module
 * Deep analysis of pipeline patterns and optimization opportunities
 */

const logger = require('../utils/logger');
const GitLabClient = require('../utils/gitlab-client');

class PipelineAnalyzer {
  constructor(gitlabClient, options = {}) {
    this.client = gitlabClient;
    this.deepScanEnabled = options.deepScanEnabled || false;
    this.patternLibrary = this._loadPatternLibrary();
  }

  /**
   * Analyze pipeline for optimization opportunities
   */
  async analyzePipeline(projectId, pipelineId, options = {}) {
    try {
      logger.info(`Starting analysis for pipeline ${pipelineId}`);

      // Fetch all necessary data
      const [pipeline, jobs, testReports, dependencyData] = await Promise.all([
        this.client.getPipeline(projectId, pipelineId),
        this.client.getPipelineJobs(projectId, pipelineId),
        this.client.getTestReports(projectId, pipelineId),
        this.deepScanEnabled ? this.client.getDependencies(projectId) : null
      ]);

      // Run analysis modules
      const [
        timingAnalysis,
        parallelismAnalysis,
        cacheAnalysis,
        dependencyAnalysis,
        testAnalysis
      ] = await Promise.all([
        this._analyzeTiming(pipeline, jobs),
        this._analyzeParallelism(jobs),
        this._analyzeCaching(jobs),
        this._analyzeDependencies(dependencyData),
        this._analyzeTests(testReports, jobs)
      ]);

      // Detect patterns
      const patterns = this._detectPatterns({
        timing: timingAnalysis,
        parallelism: parallelismAnalysis,
        cache: cacheAnalysis
      });

      // Generate insights
      const insights = this._generateInsights({
        timingAnalysis,
        parallelismAnalysis,
        cacheAnalysis,
        dependencyAnalysis,
        testAnalysis,
        patterns
      });

      // Calculate impact scores
      const impactScores = this._calculateImpactScores(insights);

      const analysis = {
        pipelineId,
        projectId,
        timestamp: new Date().toISOString(),
        metrics: {
          duration: pipeline.duration,
          jobCount: jobs.length,
          successRate: this._calculateSuccessRate(jobs),
          ...timingAnalysis.summary,
          ...parallelismAnalysis.summary
        },
        analyses: {
          timing: timingAnalysis,
          parallelism: parallelismAnalysis,
          cache: cacheAnalysis,
          dependencies: dependencyAnalysis,
          tests: testAnalysis
        },
        patterns,
        insights,
        impactScores,
        optimizations: this._extractOptimizations(insights, impactScores)
      };

      logger.info('Analysis complete', { 
        pipelineId, 
        optimizationCount: analysis.optimizations.length 
      });

      return analysis;

    } catch (error) {
      logger.error('Pipeline analysis failed', { error, projectId, pipelineId });
      throw error;
    }
  }

  /**
   * Analyze timing patterns
   */
  async _analyzeTiming(pipeline, jobs) {
    const jobDurations = jobs.map(j => ({
      name: j.name,
      duration: j.duration,
      startTime: j.started_at,
      endTime: j.finished_at
    }));

    // Calculate statistics
    const totalDuration = pipeline.duration;
    const avgJobDuration = jobDurations.reduce((sum, j) => sum + j.duration, 0) / jobs.length;
    const longestJob = jobDurations.reduce((max, j) => j.duration > max.duration ? j : max);
    const shortestJob = jobDurations.reduce((min, j) => j.duration < min.duration ? j : min);

    // Identify bottlenecks
    const bottlenecks = jobDurations
      .filter(j => j.duration > avgJobDuration * 2)
      .map(j => ({
        job: j.name,
        duration: j.duration,
        impact: (j.duration / totalDuration) * 100
      }));

    // Detect waiting periods
    const waitingPeriods = this._detectWaitingPeriods(jobs);

    return {
      summary: {
        totalDuration,
        avgJobDuration: Math.round(avgJobDuration),
        longestJob: longestJob.name,
        longestJobDuration: longestJob.duration,
        shortestJob: shortestJob.name,
        shortestJobDuration: shortestJob.duration,
        bottleneckCount: bottlenecks.length,
        waitingTimeTotal: waitingPeriods.total
      },
      bottlenecks,
      waitingPeriods: waitingPeriods.periods,
      recommendations: this._generateTimingRecommendations({
        bottlenecks,
        waitingPeriods,
        avgJobDuration
      })
    };
  }

  /**
   * Analyze parallelism efficiency
   */
  async _analyzeParallelism(jobs) {
    // Group jobs by stage
    const stages = {};
    jobs.forEach(job => {
      if (!stages[job.stage]) {
        stages[job.stage] = [];
      }
      stages[job.stage].push(job);
    });

    // Calculate parallelism metrics
    const stageMetrics = {};
    let totalParallelism = 0;
    let stageCount = 0;

    for (const [stage, stageJobs] of Object.entries(stages)) {
      const parallelJobs = stageJobs.length;
      const maxParallel = this._getMaxParallel(stageJobs);
      const efficiency = (parallelJobs / maxParallel) * 100;

      stageMetrics[stage] = {
        jobCount: parallelJobs,
        maxParallel,
        efficiency: Math.round(efficiency),
        underutilized: parallelJobs < maxParallel
      };

      totalParallelism += parallelJobs;
      stageCount++;
    }

    // Detect parallelization opportunities
    const opportunities = [];
    for (const [stage, metrics] of Object.entries(stageMetrics)) {
      if (metrics.underutilized) {
        opportunities.push({
          stage,
          currentJobs: metrics.jobCount,
          maxPossible: metrics.maxParallel,
          gainEstimate: (metrics.maxParallel - metrics.jobCount) * 30 // seconds saved
        });
      }
    }

    return {
      summary: {
        avgParallelism: Math.round(totalParallelism / stageCount),
        totalStages: stageCount,
        underutilizedStages: opportunities.length,
        maxParallelism: Math.max(...Object.values(stageMetrics).map(m => m.jobCount))
      },
      stages: stageMetrics,
      opportunities,
      recommendations: this._generateParallelismRecommendations(opportunities)
    };
  }

  /**
   * Analyze caching effectiveness
   */
  async _analyzeCaching(jobs) {
    const cacheJobs = jobs.filter(j => 
      j.name && (j.name.includes('cache') || j.name.includes('restore'))
    );

    // Calculate cache metrics
    let cacheHits = 0;
    let cacheMisses = 0;
    let totalCacheTime = 0;

    cacheJobs.forEach(job => {
      if (job.status === 'success') {
        if (job.duration < 30) {
          cacheHits++;
        } else {
          cacheMisses++;
        }
        totalCacheTime += job.duration;
      }
    });

    const totalCacheOperations = cacheHits + cacheMisses;
    const hitRate = totalCacheOperations > 0 ? (cacheHits / totalCacheOperations) * 100 : 0;

    // Analyze cache configuration
    const cacheConfigs = await this._extractCacheConfigs(jobs);

    return {
      summary: {
        hitRate: Math.round(hitRate),
        totalCacheOperations,
        cacheHits,
        cacheMisses,
        totalCacheTime,
        averageCacheTime: totalCacheOperations > 0 ? totalCacheTime / totalCacheOperations : 0
      },
      configurations: cacheConfigs,
      recommendations: this._generateCacheRecommendations({
        hitRate,
        cacheConfigs,
        cacheMisses
      })
    };
  }

  /**
   * Detect common patterns
   */
  _detectPatterns(analyses) {
    const patterns = [];

    // Pattern: Sequential jobs that could be parallel
    if (analyses.parallelism.opportunities.length > 0) {
      patterns.push({
        type: 'parallelization_opportunity',
        severity: 'high',
        description: 'Jobs running sequentially that could be parallelized',
        instances: analyses.parallelism.opportunities
      });
    }

    // Pattern: Cache miss cascade
    if (analyses.cache.summary.hitRate < 50) {
      patterns.push({
        type: 'cache_inefficiency',
        severity: 'high',
        description: 'Low cache hit rate causing rebuilds',
        metrics: analyses.cache.summary
      });
    }

    // Pattern: Long-running single job bottleneck
    if (analyses.timing.bottlenecks.length > 0) {
      patterns.push({
        type: 'bottleneck',
        severity: 'medium',
        description: 'Single jobs dominating pipeline time',
        instances: analyses.timing.bottlenecks
      });
    }

    // Pattern: Idle runners
    if (analyses.parallelism.summary.avgParallelism < 2) {
      patterns.push({
        type: 'underutilization',
        severity: 'medium',
        description: 'Runners are idle while jobs wait',
        metrics: { avgParallelism: analyses.parallelism.summary.avgParallelism }
      });
    }

    return patterns;
  }

  /**
   * Generate actionable insights
   */
  _generateInsights(analyses) {
    const insights = [];

    // Timing insights
    if (analyses.timingAnalysis.bottlenecks.length > 0) {
      insights.push({
        category: 'performance',
        title: 'Pipeline bottlenecks detected',
        description: `The following jobs are slowing down your pipeline: ${
          analyses.timingAnalysis.bottlenecks.map(b => b.job).join(', ')
        }`,
        impact: 'high',
        actionable: true
      });
    }

    // Parallelism insights
    if (analyses.parallelismAnalysis.opportunities.length > 0) {
      const potentialSavings = analyses.parallelismAnalysis.opportunities
        .reduce((sum, o) => sum + o.gainEstimate, 0);
      
      insights.push({
        category: 'parallelization',
        title: 'Parallelization opportunities',
        description: `Running more jobs in parallel could save ~${potentialSavings}s per pipeline`,
        impact: 'medium',
        actionable: true,
        savings: potentialSavings
      });
    }

    // Cache insights
    if (analyses.cacheAnalysis.summary.hitRate < 70) {
      insights.push({
        category: 'caching',
        title: 'Cache optimization needed',
        description: `Cache hit rate is ${analyses.cacheAnalysis.summary.hitRate}%. Improving this could significantly speed up builds`,
        impact: 'high',
        actionable: true
      });
    }

    // Dependency insights
    if (analyses.dependencyAnalysis?.outdatedDependencies?.length > 0) {
      insights.push({
        category: 'dependencies',
        title: 'Outdated dependencies',
        description: `${analyses.dependencyAnalysis.outdatedDependencies.length} dependencies could be updated to improve build times`,
        impact: 'low',
        actionable: true
      });
    }

    return insights;
  }

  /**
   * Calculate impact scores for optimizations
   */
  _calculateImpactScores(insights) {
    const scores = {
      totalPotentialSavings: 0,
      priorityOptimizations: [],
      quickWins: []
    };

    insights.forEach(insight => {
      if (insight.actionable) {
        let impactScore = 0;
        
        switch (insight.impact) {
          case 'high':
            impactScore = 3;
            scores.priorityOptimizations.push(insight);
            break;
          case 'medium':
            impactScore = 2;
            break;
          case 'low':
            impactScore = 1;
            break;
        }

        if (insight.savings && insight.savings < 60) { // Less than 1 minute
          scores.quickWins.push(insight);
        }

        scores.totalPotentialSavings += insight.savings || 0;
      }
    });

    return scores;
  }

  /**
   * Extract optimizations from insights
   */
  _extractOptimizations(insights, impactScores) {
    return insights
      .filter(i => i.actionable)
      .map(insight => ({
        id: `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: insight.title,
        description: insight.description,
        category: insight.category,
        impact: insight.impact,
        estimatedSavings: insight.savings,
        priority: impactScores.priorityOptimizations.includes(insight) ? 'high' : 'medium',
        automated: this._canAutomate(insight)
      }));
  }

  _canAutomate(insight) {
    // Determine if this optimization can be automated
    const automatableCategories = ['caching', 'parallelization'];
    return automatableCategories.includes(insight.category);
  }

  _loadPatternLibrary() {
    // Load known patterns from database/file
    return {
      patterns: [
        { name: 'cache_miss', severity: 'high' },
        { name: 'bottleneck', severity: 'medium' }
      ]
    };
  }

  _detectWaitingPeriods(jobs) {
    // Implementation for detecting waiting periods
    return { total: 0, periods: [] };
  }

  _getMaxParallel(jobs) {
    // Determine maximum possible parallelization
    return 10; // Default max parallel jobs
  }

  _generateTimingRecommendations(analysis) {
    const recommendations = [];
    if (analysis.bottlenecks.length > 0) {
      recommendations.push({
        type: 'split_job',
        target: analysis.bottlenecks[0].job,
        reason: 'Job is a bottleneck'
      });
    }
    return recommendations;
  }

  _generateParallelismRecommendations(opportunities) {
    return opportunities.map(o => ({
      type: 'increase_parallel',
      stage: o.stage,
      current: o.currentJobs,
      target: o.maxPossible,
      reason: 'Underutilized parallelism'
    }));
  }

  _generateCacheRecommendations(analysis) {
    const recommendations = [];
    if (analysis.hitRate < 50) {
      recommendations.push({
        type: 'cache_keys',
        reason: 'Poor cache hit rate',
        solution: 'Review cache key strategy'
      });
    }
    return recommendations;
  }

  _extractCacheConfigs(jobs) {
    // Extract cache configurations from job definitions
    return [];
  }

  _calculateSuccessRate(jobs) {
    const successful = jobs.filter(j => j.status === 'success').length;
    return jobs.length > 0 ? (successful / jobs.length) * 100 : 0;
  }
}

module.exports = PipelineAnalyzer;