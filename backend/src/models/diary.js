'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Diary extends Model {
    static associate(models) {
      // define association here
      Diary.belongsTo(models.Project, { foreignKey: 'projectId' });
      Diary.belongsTo(models.Staff, { foreignKey: 'workerId' });
    }
  }

  Diary.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    workerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Staff',
        key: 'id'
      }
    },
    start: {
      type: DataTypes.TIME,
      allowNull: false
    },
    finish: {
      type: DataTypes.TIME,
      allowNull: false
    },
    breakMins: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    totalHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    ordinaryHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false
    },
    ot1Hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    ot2Hours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    costs: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    revenues: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    marginPct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Diary',
    tableName: 'Diaries',
    timestamps: true,
    hooks: {
      beforeCreate: async (diary, options) => {
        // Auto-calc if not provided, but since calculations require external data, keep in controller
        // Placeholder for future auto-calc
      }
    }
  });

  return Diary;
};