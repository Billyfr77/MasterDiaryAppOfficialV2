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
          class Node extends Model {
            static associate(models) {
              // define association here
              Node.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
            }
          }

          Node.init({
            id: {
              type: DataTypes.UUID,
              primaryKey: true,
              defaultValue: DataTypes.UUIDV4
            },
            name: {
              type: DataTypes.STRING,
              allowNull: false
            },
            category: {
              type: DataTypes.STRING,
              allowNull: false
            },
            unit: {
              type: DataTypes.STRING,
              allowNull: false
            },
            pricePerUnit: {
              type: DataTypes.DECIMAL(10, 2),
              allowNull: false
            },
            userId: {
              type: DataTypes.UUID,
              allowNull: false,
              references: {
                model: 'Users',
                key: 'id'
              }
            }
          }, {
            sequelize,
            modelName: 'Node',
            timestamps: true
          });

          return Node;
        };
