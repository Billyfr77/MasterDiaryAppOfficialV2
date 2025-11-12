const Sequelize = require('sequelize');

module.exports = (sequelize) => {
  const Diary = sequelize.define('Diary', {
    id: {
      type: Sequelize.DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    date: {
      type: Sequelize.DataTypes.DATEONLY,
      allowNull: false
    },
    projectId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    workerId: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Staff',
        key: 'id'
      }
    },
    start: {
      type: Sequelize.DataTypes.TIME,
      allowNull: true
    },
    finish: {
      type: Sequelize.DataTypes.TIME,
      allowNull: true
    },
    breakMins: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true
    },
    totalHours: {
      type: Sequelize.DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    ordinaryHours: {
      type: Sequelize.DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    ot1Hours: {
      type: Sequelize.DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    ot2Hours: {
      type: Sequelize.DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    costs: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    revenues: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    marginPct: {
      type: Sequelize.DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    canvasData: {
      type: Sequelize.DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    additionalCosts: {
      type: Sequelize.DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    attachments: {
      type: Sequelize.DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    gpsData: {
      type: Sequelize.DataTypes.JSON,
      allowNull: true
    },
    weatherData: {
      type: Sequelize.DataTypes.JSON,
      allowNull: true
    },
    totalCost: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    totalRevenue: {
      type: Sequelize.DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    },
    productivityScore: {
      type: Sequelize.DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    diaryType: {
      type: Sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: 'legacy'
    }
  }, {
    tableName: 'Diaries',
    timestamps: true
  });

  return Diary;
};
