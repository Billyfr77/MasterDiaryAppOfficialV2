/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * This software and associated documentation contain proprietary
 * and confidential information of Billy Fraser.
 *
 * Unauthorized copying, modification, distribution, or use of this
 * software, in whole or in part, is strictly prohibited without
 * prior written permission from the copyright holder.
 *
 * For licensing inquiries: billyfr77@example.com
 *
 * Patent Pending: Drag-and-drop construction quote builder system
 * Trade Secret: Real-time calculation algorithms and optimization techniques
 */'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Project extends Model {
    static associate(models) {
      // define association here
      Project.hasMany(models.Diary, { foreignKey: 'projectId' });
      Project.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Project.belongsTo(models.Client, { foreignKey: 'clientId', as: 'clientDetails' });
    }
  }

  Project.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    client: {
      type: DataTypes.STRING,
      allowNull: true
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Clients',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active'
    },
    value: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    site: {
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
    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    },
    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Project',
    timestamps: true
  });

  return Project;
};