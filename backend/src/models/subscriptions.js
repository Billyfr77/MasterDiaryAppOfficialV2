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
 */const { DataTypes } = require('sequelize')

        module.exports = (sequelize) => {
          const Subscription = sequelize.define('Subscription', {
            id: {
              type: DataTypes.UUID,
              primaryKey: true,
              defaultValue: DataTypes.UUIDV4
            },
            userId: {
              type: DataTypes.UUID,
              allowNull: false,
              references: {
                model: 'Users',
                key: 'id'
              }
            },
            plan: {
              type: DataTypes.ENUM('free', 'starter', 'pro', 'enterprise'),
              defaultValue: 'free',
              allowNull: false
            },
            status: {
              type: DataTypes.ENUM('active', 'inactive', 'cancelled'),
              defaultValue: 'active',
              allowNull: false
            },
            startDate: {
              type: DataTypes.DATE,
              defaultValue: DataTypes.NOW
            },
            endDate: {
              type: DataTypes.DATE,
              allowNull: true
            },
            stripeSubscriptionId: {
              type: DataTypes.STRING,
              allowNull: true
            },
            createdAt: {
              type: DataTypes.DATE,
              defaultValue: DataTypes.NOW
            },
            updatedAt: {
              type: DataTypes.DATE,
              defaultValue: DataTypes.NOW
            }
          }, {
            tableName: 'Subscriptions'
          })

          Subscription.associate = (models) => {
            Subscription.belongsTo(models.User, { foreignKey: 'userId' })
          }

          return Subscription
        }
