/*
 * MasterDiaryApp Official - Document Model
 * Handles unstructured records, reports, and knowledge base entries.
 * Supports Polymorphic associations to link to Projects, Diaries, etc.
 */
'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    static associate(models) {
      // Polymorphic association (optional implementation detail for advanced queries)
      // For simplicity in search, we store relatedId and relatedModel as strings
      Document.belongsTo(models.User, { foreignKey: 'userId', as: 'author' });
    }
  }

  Document.init({
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('REPORT', 'MEMO', 'SPECIFICATION', 'INCIDENT', 'MEETING_MINUTES'),
      defaultValue: 'REPORT'
    },
    content: {
      type: DataTypes.TEXT, // Supports Markdown or HTML
      allowNull: true
    },
    tags: {
      type: DataTypes.JSON, // Array of strings for facetted search
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('DRAFT', 'FINAL', 'ARCHIVED'),
      defaultValue: 'DRAFT'
    },
    // Polymorphic Links
    relatedModel: {
      type: DataTypes.STRING, // e.g., 'Project', 'Client', 'Invoice'
      allowNull: true
    },
    relatedId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON, // For AI analysis results, sentiment, etc.
      defaultValue: {}
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    // Full Text Search Vector (Postgres specific, ignored by SQLite)
    searchVector: {
      type: DataTypes.TSVECTOR,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Document',
    tableName: 'Documents',
    timestamps: true,
    hooks: {
        // Auto-update vector on save (Simulated for SQLite compatibility)
        beforeSave: (doc) => {
            // In a real Postgres setup, we'd update the TSVECTOR column here
            // doc.searchVector = sequelize.fn('to_tsvector', `${doc.title} ${doc.content}`);
        }
    }
  });

  return Document;
};
