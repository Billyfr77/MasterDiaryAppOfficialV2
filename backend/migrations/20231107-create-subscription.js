 'use strict'

        module.exports = {
          up: async (queryInterface, Sequelize) => {
            await queryInterface.createTable('Subscriptions', {
              id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
              },
              userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                  model: 'Users',
                  key: 'id'
                }
              },
              plan: {
                type: Sequelize.ENUM('free', 'starter', 'pro', 'enterprise'),
                defaultValue: 'free',
                allowNull: false
              },
              status: {
                type: Sequelize.ENUM('active', 'inactive', 'cancelled'),
                defaultValue: 'active',
                allowNull: false
              },
              startDate: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
              },
              endDate: {
                type: Sequelize.DATE,
                allowNull: true
              },
              stripeSubscriptionId: {
                type: Sequelize.STRING,
                allowNull: true
              },
              createdAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
              },
              updatedAt: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
              }
            })
          },

          down: async (queryInterface, Sequelize) => {
            await queryInterface.dropTable('Subscriptions')
          }
        }