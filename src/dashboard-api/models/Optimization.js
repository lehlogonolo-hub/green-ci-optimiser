class Optimization {
  constructor(data = {}) {
    this.id = data.id || `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.title = data.title || '';
    this.description = data.description || '';
    this.projectId = data.projectId || '';
    this.type = data.type || 'general';
    this.impact = data.impact || 'medium';
    this.estimatedSavings = data.estimatedSavings || 0;
    this.status = data.status || 'pending';
    this.createdAt = data.createdAt || new Date().toISOString();
    this.completedAt = data.completedAt || null;
    this.mrUrl = data.mrUrl || null;
    this.metadata = data.metadata || {};
  }

  validate() {
    const errors = [];
    
    if (!this.title) errors.push('title is required');
    if (!this.description) errors.push('description is required');
    if (!this.projectId) errors.push('projectId is required');
    if (!['pending', 'in_progress', 'completed', 'failed'].includes(this.status)) {
      errors.push('status must be pending, in_progress, completed, or failed');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  complete(mrUrl) {
    this.status = 'completed';
    this.completedAt = new Date().toISOString();
    if (mrUrl) this.mrUrl = mrUrl;
  }

  fail(error) {
    this.status = 'failed';
    this.metadata.error = error;
    this.metadata.failedAt = new Date().toISOString();
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      projectId: this.projectId,
      type: this.type,
      impact: this.impact,
      estimatedSavings: this.estimatedSavings,
      status: this.status,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      mrUrl: this.mrUrl,
      metadata: this.metadata
    };
  }

  static fromJSON(json) {
    return new Optimization(json);
  }
}

module.exports = Optimization;