'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to Diaries table
    await queryInterface.addColumn('Diaries', 'canvasData', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('Diaries', 'additionalCosts', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('Diaries', 'attachments', {
      type: Sequelize.JSONB,
      allowNull: true,
      defaultValue: []
    });

    await queryInterface.addColumn('Diaries', 'gpsData', {
      type: Sequelize.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('Diaries', 'weatherData', {
      type: Sequelize.JSONB,
      allowNull: true
    });

    await queryInterface.addColumn('Diaries', 'totalCost', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('Diaries', 'totalRevenue', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('Diaries', 'productivityScore', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });

    await queryInterface.addColumn('Diaries', 'diaryType', {
      type: Sequelize.ENUM('legacy', 'paint'),
      allowNull: false,
      defaultValue: 'legacy'
    });

    // Make some legacy fields nullable
    await queryInterface.changeColumn('Diaries', 'projectId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Projects',
        key: 'id'
      }
    });

    await queryInterface.changeColumn('Diaries', 'workerId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Staff',
        key: 'id'
      }
    });

    // Create Invoices table
    await queryInterface.createTable('Invoices', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
      },
      diaryId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Diaries',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id'
        }
      },
      invoiceType: {
        type: Sequelize.ENUM('customer', 'inhouse'),
        allowNull: false,
        defaultValue: 'customer'
      },
      invoiceNumber: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      invoiceData: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      totalAmount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      pdfUrl: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'sent', 'paid', 'overdue'),
        allowNull: false,
        defaultValue: 'draft'
      },
      dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Drop Invoices table
    await queryInterface.dropTable('Invoices');

    // Remove added columns from Diaries table
    await queryInterface.removeColumn('Diaries', 'canvasData');
    await queryInterface.removeColumn('Diaries', 'additionalCosts');
    await queryInterface.removeColumn('Diaries', 'attachments');
    await queryInterface.removeColumn('Diaries', 'gpsData');
    await queryInterface.removeColumn('Diaries', 'weatherData');
    await queryInterface.removeColumn('Diaries', 'totalCost');
    await queryInterface.removeColumn('Diaries', 'totalRevenue');
    await queryInterface.removeColumn('Diaries', 'productivityScore');
    await queryInterface.removeColumn('Diaries', 'diaryType');

    // Revert nullable changes
    await queryInterface.changeColumn('Diaries', 'projectId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Projects',
        key: 'id'
      }
    });

    await queryInterface.changeColumn('Diaries', 'workerId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Staff',
        key: 'id'
      }
    });
  }
};

