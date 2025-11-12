const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Diary = sequelize.define('Diary', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    projectId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    workerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Staff',
        key: 'id'
      }
    },
    start: {
      type: DataTypes.TIME,
      allowNull: true
    },
    finish: {
      type: DataTypes.TIME,
      allowNull: true
    },
    breakMins: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    totalHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    ordinaryHours: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
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
    },
    canvasData: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    additionalCosts: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    attachments: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    gpsData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    weatherData: {
      type: DataTypes.JSON,
      allowNull: true
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    totalRevenue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    productivityScore: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    diaryType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'legacy'
    }
  }, {
    tableName: 'Diaries',
    timestamps: true
  });

  return Diary;
};
