/**
 * Google Cloud BigQuery Client
 * For storing and analyzing pipeline metrics
 */

const { BigQuery } = require('@google-cloud/bigquery');
const logger = require('../utils/logger');

class BigQueryClient {
  constructor(config = {}) {
    this.projectId = config.projectId || process.env.GCP_PROJECT_ID;
    this.datasetId = config.datasetId || process.env.BIGQUERY_DATASET || 'green_ci';
    this.tableId = config.tableId || process.env.BIGQUERY_TABLE || 'pipeline_metrics';
    
    this.client = new BigQuery({
      projectId: this.projectId,
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
    });
  }

  /**
   * Initialize dataset and table
   */
  async initialize() {
    try {
      // Create dataset if not exists
      const [dataset] = await this.client.createDataset(this.datasetId, {
        location: 'US'
      }).catch(() => this.client.dataset(this.datasetId).get());

      // Create table with schema
      const schema = this._getSchema();
      const [table] = await dataset.createTable(this.tableId, { schema })
        .catch(() => dataset.table(this.tableId).get());

      logger.info('BigQuery initialized', { 
        dataset: this.datasetId, 
        table: this.tableId 
      });

      return { dataset, table };
    } catch (error) {
      logger.error('Failed to initialize BigQuery', { error });
      throw error;
    }
  }

  /**
   * Store pipeline metrics
   */
  async storePipelineMetrics(metrics) {
    try {
      const rows = [{
        timestamp: metrics.timestamp || new Date().toISOString(),
        project_id: metrics.projectId,
        pipeline_id: metrics.pipelineId,
        duration_seconds: metrics.duration,
        job_count: metrics.jobCount,
        energy_kwh: metrics.energyKwh,
        co2_kg: metrics.co2kg,
        eco_score: metrics.ecoScore,
        grade: metrics.grade,
        optimization_count: metrics.optimizations?.length || 0,
        metadata: JSON.stringify(metrics)
      }];

      await this.client
        .dataset(this.datasetId)
        .table(this.tableId)
        .insert(rows);

      logger.info('Stored metrics in BigQuery', { 
        pipelineId: metrics.pipelineId 
      });

    } catch (error) {
      logger.error('Failed to store metrics in BigQuery', { error });
      
      // Handle partial failures
      if (error.name === 'PartialFailureError') {
        error.errors.forEach(err => {
          logger.error('Row insert error', err);
        });
      }
      
      throw error;
    }
  }

  /**
   * Query historical trends
   */
  async getHistoricalTrends(projectId, days = 30) {
    const query = `
      SELECT
        DATE(timestamp) as date,
        AVG(co2_kg) as avg_co2,
        AVG(eco_score) as avg_eco_score,
        AVG(duration_seconds) as avg_duration,
        COUNT(*) as pipeline_count,
        SUM(optimization_count) as total_optimizations
      FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
      WHERE project_id = @projectId
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL @days DAY)
      GROUP BY date
      ORDER BY date DESC
    `;

    const options = {
      query,
      params: {
        projectId,
        days
      }
    };

    try {
      const [rows] = await this.client.query(options);
      
      // Calculate trends
      const trends = this._calculateTrends(rows);
      
      return {
        daily: rows,
        summary: trends
      };
    } catch (error) {
      logger.error('Failed to query historical trends', { error });
      throw error;
    }
  }

  /**
   * Get team benchmarks
   */
  async getTeamBenchmarks(teamProjects) {
    const query = `
      SELECT
        project_id,
        AVG(co2_kg) as avg_co2,
        AVG(eco_score) as avg_eco_score,
        AVG(duration_seconds) as avg_duration,
        COUNT(*) as pipeline_count,
        PERCENTILE_CONT(co2_kg, 0.5) OVER() as median_co2,
        PERCENTILE_CONT(eco_score, 0.5) OVER() as median_score
      FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
      WHERE project_id IN UNNEST(@projects)
        AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
      GROUP BY project_id
    `;

    try {
      const [rows] = await this.client.query({
        query,
        params: { projects: teamProjects }
      });

      // Calculate rankings
      const ranked = rows.map(row => ({
        ...row,
        rank: this._calculateRank(row, rows)
      }));

      return {
        benchmarks: ranked,
        topPerformer: ranked.find(r => r.rank === 1),
        teamAverage: this._calculateTeamAverage(ranked)
      };
    } catch (error) {
      logger.error('Failed to get team benchmarks', { error });
      throw error;
    }
  }

  /**
   * Generate sustainability report
   */
  async generateSustainabilityReport(projectId, startDate, endDate) {
    const query = `
      WITH metrics AS (
        SELECT
          TIMESTAMP_TRUNC(timestamp, DAY) as day,
          co2_kg,
          eco_score,
          optimization_count,
          LEAD(co2_kg) OVER (ORDER BY timestamp) as next_co2
        FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
        WHERE project_id = @projectId
          AND timestamp BETWEEN @startDate AND @endDate
      )
      SELECT
        COUNT(*) as total_pipelines,
        SUM(co2_kg) as total_co2,
        AVG(eco_score) as avg_score,
        SUM(optimization_count) as total_optimizations,
        CORR(co2_kg, eco_score) as co2_score_correlation,
        AVG(CASE WHEN next_co2 < co2_kg THEN 1 ELSE 0 END) as improvement_rate
      FROM metrics
    `;

    try {
      const [rows] = await this.client.query({
        query,
        params: {
          projectId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        }
      });

      const report = rows[0];
      
      // Calculate environmental impact
      report.trees_equivalent = Math.round(report.total_co2 / 21); // Trees needed to absorb CO2
      report.cars_equivalent = Math.round(report.total_co2 / 4600); // Cars off road equivalent
      report.homes_energy = (report.total_co2 / 2343).toFixed(2); // Homes' monthly energy

      return report;
    } catch (error) {
      logger.error('Failed to generate sustainability report', { error });
      throw error;
    }
  }

  /**
   * Create materialized view for dashboard
   */
  async createDashboardView() {
    const viewId = `green_ci_dashboard`;
    const viewQuery = `
      CREATE OR REPLACE VIEW \`${this.projectId}.${this.datasetId}.${viewId}\` AS
      SELECT
        TIMESTAMP_TRUNC(timestamp, HOUR) as hour,
        project_id,
        AVG(co2_kg) as avg_co2,
        AVG(eco_score) as avg_score,
        COUNT(*) as pipeline_count,
        SUM(optimization_count) as optimizations_applied
      FROM \`${this.projectId}.${this.datasetId}.${this.tableId}\`
      WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
      GROUP BY hour, project_id
    `;

    try {
      await this.client.query(viewQuery);
      logger.info('Dashboard view created');
    } catch (error) {
      logger.error('Failed to create dashboard view', { error });
    }
  }

  _getSchema() {
    return [
      { name: 'timestamp', type: 'TIMESTAMP', mode: 'REQUIRED' },
      { name: 'project_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'pipeline_id', type: 'STRING', mode: 'REQUIRED' },
      { name: 'duration_seconds', type: 'INTEGER' },
      { name: 'job_count', type: 'INTEGER' },
      { name: 'energy_kwh', type: 'FLOAT' },
      { name: 'co2_kg', type: 'FLOAT' },
      { name: 'eco_score', type: 'INTEGER' },
      { name: 'grade', type: 'STRING' },
      { name: 'optimization_count', type: 'INTEGER' },
      { name: 'metadata', type: 'JSON' }
    ];
  }

  _calculateTrends(rows) {
    if (rows.length < 2) {
      return { trend: 'insufficient_data' };
    }

    const first = rows[rows.length - 1];
    const last = rows[0];

    const co2Change = ((last.avg_co2 - first.avg_co2) / first.avg_co2) * 100;
    const scoreChange = last.avg_eco_score - first.avg_eco_score;

    return {
      co2_trend: co2Change,
      score_trend: scoreChange,
      direction: co2Change < 0 ? 'improving' : 'declining',
      percent_change: Math.abs(co2Change).toFixed(1)
    };
  }

  _calculateRank(project, allProjects) {
    const sorted = [...allProjects].sort((a, b) => b.avg_eco_score - a.avg_eco_score);
    return sorted.findIndex(p => p.project_id === project.project_id) + 1;
  }

  _calculateTeamAverage(ranked) {
    return {
      avg_co2: ranked.reduce((sum, r) => sum + r.avg_co2, 0) / ranked.length,
      avg_score: ranked.reduce((sum, r) => sum + r.avg_eco_score, 0) / ranked.length,
      total_pipelines: ranked.reduce((sum, r) => sum + r.pipeline_count, 0)
    };
  }
}

module.exports = BigQueryClient;