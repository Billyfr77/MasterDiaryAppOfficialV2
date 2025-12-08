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
  class Diary extends Model {
    static associate(models) {
      // define association here
      Diary.belongsTo(models.Project, { foreignKey: 'projectId' });
      Diary.belongsTo(models.Staff, { foreignKey: 'workerId' });
      Diary.belongsTo(models.Client, { foreignKey: 'clientId' });
    }
  }

  Diary.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional for Paint Diary
      references: {
        model: 'Projects',
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
    workerId: {
      type: DataTypes.UUID,
      allowNull: true, // Optional for Paint Diary
      references: {
        model: 'Staff',
        key: 'id'
      }
    },
    // Legacy fields for old diary format
    start: {
      type: DataTypes.TIME,
      allowNull: true
    },
    finish: {
      type: DataTypes.TIME,
      allowNull: true
    },
    breakMins: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    totalHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    ordinaryHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    ot1Hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    ot2Hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    costs: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    revenues: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    marginPct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    // Paint Diary fields
    canvasData: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    additionalCosts: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    gpsData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    weatherData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    productivityScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    diaryType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'legacy'
    }
  }, {
    sequelize,
    modelName: 'Diary',
    tableName: 'Diaries',
    timestamps: true,
    hooks: {
      beforeCreate: async (diary, options) => {
        // Auto-calc if not provided, but since calculations require external data, keep in controller
        // Placeholder for future auto-calc
      }
    }
  });

  return Diary;
};

