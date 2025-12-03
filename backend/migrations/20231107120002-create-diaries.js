'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Diaries', {
      id: {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false
      },
      date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      projectId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      workerId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Staff',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      start: {
        type: Sequelize.TIME,
        allowNull: false
      },
      finish: {
        type: Sequelize.TIME,
        allowNull: false
      },
      breakMins: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      totalHours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      ordinaryHours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false
      },
      ot1Hours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      ot2Hours: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true
      },
      costs: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      revenues: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      marginPct: {
        type: Sequelize.DECIMAL(5, 2),
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
    await queryInterface.dropTable('Diaries');
  }
};

