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
      Invoice.hasMany(models.Diary, { foreignKey: 'invoiceId' }); // Changed to HasMany
      Invoice.belongsTo(models.Project, { foreignKey: 'projectId' });
      Invoice.belongsTo(models.Client, { foreignKey: 'clientId' });
    }
  }

  Invoice.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    // diaryId is now optional or removed in favor of hasMany relationship on Diary side
    diaryId: {
      type: DataTypes.UUID,
      allowNull: true, // Relaxed constraint
      references: {
        model: 'Diaries',
        key: 'id'
      }
    },
    projectId: {
      type: DataTypes.UUID,
      allowNull: true, // Relaxed for general invoices
      references: {
        model: 'Projects',
        key: 'id'
      }
    },
    clientId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Clients',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
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
      type: DataTypes.JSON,
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
      type: DataTypes.ENUM('draft', 'approved', 'sent', 'paid', 'overdue'), // Added 'approved'
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
