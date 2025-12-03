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
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    static associate(models) {
      // define association here
      Staff.hasMany(models.Diary, { foreignKey: 'workerId' });
    }

    // Instance method to check password
    async checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  Staff.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
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
    payRateBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    payRateOT1: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    payRateOT2: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    chargeOutBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    chargeOutOT1: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    chargeOutOT2: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Staff',
    tableName: 'Staff',
    timestamps: true,
    hooks: {
      beforeCreate: async (staff) => {
        if (staff.password) {
          const salt = await bcrypt.genSalt(10);
          staff.password = await bcrypt.hash(staff.password, salt);
        }
      },
      beforeUpdate: async (staff) => {
        if (staff.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          staff.password = await bcrypt.hash(staff.password, salt);
        }
      }
    }
  });

  return Staff;
};