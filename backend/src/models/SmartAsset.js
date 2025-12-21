'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SmartAsset extends Model {
    static associate(models) {
      // Future associations
    }
  }

  SmartAsset.init({
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
      type: DataTypes.ENUM('material', 'staff', 'equipment', 'service'),
      allowNull: false
    },
    baseCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    baseCharge: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    unit: {
      type: DataTypes.STRING,
      defaultValue: 'unit'
    },
    metadata: {
      type: DataTypes.JSON, // For specific fields like "Experience Level" or "Fuel Type"
      allowNull: true
    },
    systemTags: {
      type: DataTypes.JSON, // E.g., ['structural', 'interior', 'high-risk']
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SmartAsset',
    tableName: 'SmartAssets',
    timestamps: true
  });

  return SmartAsset;
};
