'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SafetyForm extends Model {
    static associate(models) {
      // Define associations
      SafetyForm.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
      SafetyForm.belongsTo(models.User, { foreignKey: 'createdBy', as: 'creator' });
      // Self-referencing for templates? Maybe later.
    }
  }

  SafetyForm.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('SWMS', 'TOOLBOX_TALK', 'INCIDENT_REPORT', 'INSPECTION', 'HAZARD', 'PERMIT'),
      defaultValue: 'SWMS'
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'OPEN', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'CLOSED', 'ARCHIVED'),
      defaultValue: 'DRAFT'
    },
    data: {
      type: DataTypes.JSON, 
      defaultValue: {}
    },
    signatures: {
      type: DataTypes.JSON, 
      defaultValue: []
    },
    // --- Geo-Spatial Fields ---
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    locationDetails: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: "Specific room, level, or area description"
    },
    // --- Risk & Approval ---
    riskLevel: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'EXTREME'),
      defaultValue: 'LOW'
    },
    approvedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    approvedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
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
    modelName: 'SafetyForm',
    tableName: 'SafetyForms', // Explicit table name
    timestamps: true
  });

  return SafetyForm;
};