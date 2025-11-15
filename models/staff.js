const { DataTypes } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const Staff = sequelize.define('Staff', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payRateBase: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    chargeOutBase: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  })

  return Staff
}