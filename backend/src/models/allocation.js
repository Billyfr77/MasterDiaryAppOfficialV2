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
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
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
