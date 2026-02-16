const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PipelineMetric = sequelize.define('PipelineMetric', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'project_id'
    },
    pipelineId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'pipeline_id'
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    jobCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'job_count'
    },
    energyKwh: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'energy_kwh'
    },
    co2kg: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'co2_kg'
    },
    ecoScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'eco_score'
    },
    grade: {
      type: DataTypes.STRING(1),
      allowNull: false
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'pipeline_metrics',
    timestamps: true,
    underscored: true
  });

  return PipelineMetric;
};