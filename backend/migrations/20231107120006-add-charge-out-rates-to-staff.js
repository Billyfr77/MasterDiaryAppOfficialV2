'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Staff', 'chargeOutBase', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.addColumn('Staff', 'chargeOutOT1', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
    await queryInterface.addColumn('Staff', 'chargeOutOT2', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Staff', 'chargeOutBase');
    await queryInterface.removeColumn('Staff', 'chargeOutOT1');
    await queryInterface.removeColumn('Staff', 'chargeOutOT2');
  }
};