const { DataTypes } = require('sequelize')

module.exports = (sequelize, DataTypes) => {
  const Diary = sequelize.define('Diary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    entry: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  })

  return Diary
}