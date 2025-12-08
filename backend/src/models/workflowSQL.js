'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Workflow extends Model {
    static associate(models) {
      // Define associations here if needed
      // Workflow.belongsTo(models.User, { foreignKey: 'createdBy' });
    }
  }

  Workflow.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'archived'),
      defaultValue: 'draft'
    },
    nodes: {
      type: DataTypes.JSON, // Use JSON for nodes structure
      allowNull: false,
      defaultValue: []
    },
    edges: {
      type: DataTypes.JSON, // Use JSON for edges structure
      allowNull: false,
      defaultValue: []
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: true // Allow null for system/dev flows
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'general'
    },
    tags: {
      type: DataTypes.JSON, // Store tags as JSON array
      defaultValue: []
    },
    settings: {
      type: DataTypes.JSON, // Store settings (autoEscalate, etc) as JSON
      defaultValue: {}
    },
    integrationId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    integrationType: {
      type: DataTypes.STRING, // 'project', 'quote', 'invoice', etc.
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Workflow',
    tableName: 'Workflows',
    timestamps: true
  });

  return Workflow;
};
