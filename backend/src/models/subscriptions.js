const { DataTypes } = require('sequelize')

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
