'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Equipment extends Model {
    static associate(models) {
      // define association here
    }
  }

  Equipment.init({
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
    ownership: {
      type: DataTypes.STRING,
      allowNull: false
    },
    costRateBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    costRateOT1: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    costRateOT2: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Equipment',
    tableName: 'Equipment',
    timestamps: true
  });

  return Equipment;
};