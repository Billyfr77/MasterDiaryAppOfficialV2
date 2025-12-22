'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DiaryTemplate extends Model {
    static associate(models) {
      DiaryTemplate.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      DiaryTemplate.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    }
  }

  DiaryTemplate.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('full-day', 'node-group'),
      defaultValue: 'node-group'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'General'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    usageCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    preview: {
      type: DataTypes.JSON, // Stores simplified node positions/types for SVG rendering
      allowNull: true
    },
    data: {
      type: DataTypes.JSON, // Stores { items: [], extraNodes: [], edges: [] }
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    sequelize,
    modelName: 'DiaryTemplate',
    tableName: 'DiaryTemplates',
    timestamps: true
  });

  return DiaryTemplate;
};
