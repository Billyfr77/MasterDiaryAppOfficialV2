'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SafetyTemplate extends Model {
    static associate(models) {
      SafetyTemplate.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
    }
  }

  SafetyTemplate.init({
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
      type: DataTypes.ENUM('SWMS', 'TOOLBOX_TALK', 'INCIDENT_REPORT', 'INSPECTION', 'HAZARD', 'PERMIT'),
      defaultValue: 'SWMS'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    structure: {
      type: DataTypes.JSON, 
      allowNull: false,
      defaultValue: [],
      comment: "Array of field definitions (label, type, required, options)"
    },
    defaultData: {
      type: DataTypes.JSON,
      defaultValue: {},
      comment: "Pre-filled values for the form"
    },
    isGlobal: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'SafetyTemplate',
    tableName: 'SafetyTemplates',
    timestamps: true
  });

  return SafetyTemplate;
};