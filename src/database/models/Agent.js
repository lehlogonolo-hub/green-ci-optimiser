const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Agent = sequelize.define('Agent', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('active', 'idle', 'error'),
      defaultValue: 'idle'
    },
    version: {
      type: DataTypes.STRING
    },
    lastRun: {
      type: DataTypes.DATE,
      field: 'last_run'
    },
    totalAnalyses: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_analyses'
    },
    totalMRsCreated: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'total_mrs_created'
    },
    avgResponseTime: {
      type: DataTypes.FLOAT,
      field: 'avg_response_time'
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'agents',
    timestamps: true,
    underscored: true
  });

  return Agent;
};