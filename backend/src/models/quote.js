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
  class Quote extends Model {
    static associate(models) {
      // define association here
      Quote.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
      Quote.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Quote.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
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
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    nodes: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    staff: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    equipment: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: []
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    marginPct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    modelName: 'Quote',
    timestamps: true
  });

  return Quote;
};