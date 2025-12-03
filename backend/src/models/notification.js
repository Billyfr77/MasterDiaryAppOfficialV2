'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Notification.init({
    userId: {
      type: DataTypes.UUID,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    type: DataTypes.STRING,
    title: DataTypes.STRING,
    message: DataTypes.TEXT,
    isRead: DataTypes.BOOLEAN,
    data: DataTypes.JSON
  }, {
    sequelize,
    modelName: 'Notification',
  });
  return Notification;
};
