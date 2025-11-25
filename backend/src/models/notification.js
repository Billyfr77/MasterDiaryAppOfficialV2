'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: 'userId' });
    }
  }
  Notification.init({
    userId: DataTypes.INTEGER,
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
