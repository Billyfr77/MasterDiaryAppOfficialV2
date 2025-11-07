'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');

module.exports = (sequelize, DataTypes) => {
  class Staff extends Model {
    static associate(models) {
      // define association here
      Staff.hasMany(models.Diary, { foreignKey: 'workerId' });
    }

    // Instance method to check password
    async checkPassword(password) {
      return bcrypt.compare(password, this.password);
    }
  }

  Staff.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false
    },
    payRateBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    payRateOT1: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    payRateOT2: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    chargeOutBase: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    chargeOutOT1: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    chargeOutOT2: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Staff',
    tableName: 'Staff',
    timestamps: true,
    hooks: {
      beforeCreate: async (staff) => {
        if (staff.password) {
          const salt = await bcrypt.genSalt(10);
          staff.password = await bcrypt.hash(staff.password, salt);
        }
      },
      beforeUpdate: async (staff) => {
        if (staff.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          staff.password = await bcrypt.hash(staff.password, salt);
        }
      }
    }
  });

  return Staff;
};