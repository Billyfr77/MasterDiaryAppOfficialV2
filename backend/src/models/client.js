'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    static associate(models) {
      Client.hasMany(models.Project, { foreignKey: 'clientId' });
      Client.hasMany(models.Quote, { foreignKey: 'clientId' });
      Client.hasMany(models.Invoice, { foreignKey: 'clientId' });
      Client.hasMany(models.Diary, { foreignKey: 'clientId' });
    }
  }

  Client.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Primary contact name'
    },
    company: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'lead'),
      defaultValue: 'active'
    },
    tags: {
      type: DataTypes.JSON,
      defaultValue: []
    }
  }, {
    sequelize,
    modelName: 'Client',
    tableName: 'Clients',
    timestamps: true,
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['company']
      }
    ]
  });

  return Client;
};
