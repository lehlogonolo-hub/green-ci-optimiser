class PipelineMetric {
  constructor(data = {}) {
    this.id = data.id || `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.projectId = data.projectId;
    this.pipelineId = data.pipelineId;
    this.timestamp = data.timestamp || new Date().toISOString();
    this.duration = data.duration || 0;
    this.jobCount = data.jobCount || 0;
    this.energyKwh = data.energyKwh || 0;
    this.co2kg = data.co2kg || 0;
    this.ecoScore = data.ecoScore || 0;
    this.grade = data.grade || 'N/A';
    this.metadata = data.metadata || {};
  }

  validate() {
    const errors = [];
    
    if (!this.projectId) errors.push('projectId is required');
    if (!this.pipelineId) errors.push('pipelineId is required');
    if (this.duration < 0) errors.push('duration cannot be negative');
    if (this.co2kg < 0) errors.push('co2kg cannot be negative');
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      projectId: this.projectId,
      pipelineId: this.pipelineId,
      timestamp: this.timestamp,
      duration: this.duration,
      jobCount: this.jobCount,
      energyKwh: Number(this.energyKwh.toFixed(6)),
      co2kg: Number(this.co2kg.toFixed(6)),
      ecoScore: this.ecoScore,
      grade: this.grade,
      metadata: this.metadata
    };
  }

  static fromJSON(json) {
    return new PipelineMetric(json);
  }
}

module.exports = PipelineMetric;