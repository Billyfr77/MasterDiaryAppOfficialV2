'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Diaries', 'quoteId', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'Quotes',
        key: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Diaries', 'quoteId');
  }
};

