const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Optimization = sequelize.define('Optimization', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    projectId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'project_id'
    },
    type: {
      type: DataTypes.STRING,
      defaultValue: 'general'
    },
    impact: {
      type: DataTypes.ENUM('high', 'medium', 'low'),
      defaultValue: 'medium'
    },
    estimatedSavings: {
      type: DataTypes.FLOAT,
      field: 'estimated_savings'
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'failed'),
      defaultValue: 'pending'
    },
    mrUrl: {
      type: DataTypes.STRING,
      field: 'mr_url'
    },
    appliedAt: {
      type: DataTypes.DATE,
      field: 'applied_at'
    },
    completedAt: {
      type: DataTypes.DATE,
      field: 'completed_at'
    },
    agentId: {
      type: DataTypes.UUID,
      field: 'agent_id'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'optimizations',
    timestamps: true,
    underscored: true
  });

  return Optimization;
};