'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Job extends Model {
    static associate(models) {
      Job.belongsTo(models.Client, { foreignKey: 'clientId', as: 'clientDetails' });
      Job.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
      Job.hasMany(models.Diary, { foreignKey: 'jobId', as: 'diaries' });
    }
  }

  Job.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    jobNumber: {
      type: DataTypes.STRING,
      allowNull: false
    },
    clientName: {
      type: DataTypes.STRING,
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
    clientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Clients',
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
    serviceType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    wasteType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    pricingType: {
      type: DataTypes.ENUM('flat', 'hourly'),
      defaultValue: 'flat'
    },
    rate: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    hours: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    cost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    status: {
      type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'invoiced'),
      defaultValue: 'pending'
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    resourceId: {
      type: DataTypes.STRING, // Can be UUID or 'unassigned'
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Job',
    tableName: 'Jobs',
    timestamps: true
  });

  return Job;
};
