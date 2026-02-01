'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Allocation extends Model {
    static associate(models) {
      Allocation.belongsTo(models.Project, { foreignKey: 'projectId' });
      // We can't set up standard polymorphic belongsTo easily in Sequelize without a hook or scope
      // So we'll just store resourceId/resourceType and handle fetching manually or via separate associations if strict integrity needed
      // But for simplicity, we can define associations to both and only use one based on type
      Allocation.belongsTo(models.Staff, { foreignKey: 'resourceId', constraints: false, as: 'staffResource' });
      Allocation.belongsTo(models.Equipment, { foreignKey: 'resourceId', constraints: false, as: 'equipmentResource' });
    }
  }

  Allocation.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    resourceType: {
      type: DataTypes.ENUM('staff', 'equipment'),
      allowNull: false
    },
    resourceId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: true, // Allow null for Sick/Leave
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: true
    },
    category: { // New field for Leave/Sick tracking
      type: DataTypes.ENUM('project', 'sick', 'leave', 'training'),
      defaultValue: 'project'
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'confirmed', 'completed'),
      defaultValue: 'scheduled'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Allocation',
    tableName: 'Allocations',
    timestamps: true
  });

  return Allocation;
};
