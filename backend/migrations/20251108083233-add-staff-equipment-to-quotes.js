'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Quotes', 'staff', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: []
    });

    await queryInterface.addColumn('Quotes', 'equipment', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: []
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Quotes', 'staff');
    await queryInterface.removeColumn('Quotes', 'equipment');
  }
};

