/*
 * MasterDiaryApp Official - Construction SaaS Platform
 * Copyright (c) 2025 Billy Fraser. All rights reserved.
 *
 * Invoice Model for Paint Diary PDF Generation
 */'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Invoice extends Model {
    static associate(models) {
      Invoice.belongsTo(models.Diary, { foreignKey: 'diaryId' });
      Invoice.belongsTo(models.Project, { foreignKey: 'projectId' });
    }
  }

  Invoice.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    diaryId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Diaries',
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    invoiceType: {
      type: DataTypes.ENUM('customer', 'inhouse'),
      allowNull: false,
      defaultValue: 'customer'
    },
    invoiceNumber: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    invoiceData: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    pdfUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('draft', 'sent', 'paid', 'overdue'),
      allowNull: false,
      defaultValue: 'draft'
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Invoice',
    tableName: 'Invoices',
    timestamps: true
  });

  return Invoice;
};