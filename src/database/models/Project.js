const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Project = sequelize.define('Project', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    gitlabProjectId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: 'gitlab_project_id'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT
    },
    settings: {
      type: DataTypes.JSON,
      defaultValue: {}
    }
  }, {
    tableName: 'projects',
    timestamps: true,
    underscored: true
  });

  return Project;
};