'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Insight extends Model {
    static associate(models) {
      Insight.belongsTo(models.Project, { foreignKey: 'relatedId', constraints: false, as: 'project' });
    }
  }

  Insight.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    type: {
      type: DataTypes.ENUM('warning', 'info', 'recommendation'),
      defaultValue: 'info'
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    relatedModel: {
      type: DataTypes.STRING, // e.g., 'Project'
      allowNull: true
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 3 // 1-High, 2-Medium, 3-Low
    }
  }, {
    sequelize,
    modelName: 'Insight',
    tableName: 'Insights',
    timestamps: true
  });

  return Insight;
};
