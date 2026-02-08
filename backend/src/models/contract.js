'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Contract extends Model {
    static associate(models) {
      Contract.belongsTo(models.Project, { foreignKey: 'projectId', as: 'project' });
    }
  }
  Contract.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING, // 'draft', 'active', 'expired', 'disputed'
      defaultValue: 'active'
    },
    fileUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // The "Brain" of the contract - Extracted by Grok
    intelligence: {
      type: DataTypes.JSON,
      defaultValue: {
        contractSum: 0,
        retentionPercent: 0,
        defectPeriod: 12, // months
        paymentTerms: 'NET30',
        liquidatedDamages: 0, // per day/week
        inclusions: [],
        exclusions: [],
        keyClauses: []
      }
    },
    // Raw text for search/indexing
    extractedText: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Contract',
  });
  return Contract;
};
