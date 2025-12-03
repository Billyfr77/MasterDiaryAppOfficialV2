'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if columns already exist before adding them
    const tableDescription = await queryInterface.describeTable('Staff');

    if (!tableDescription.chargeOutBase) {
      await queryInterface.addColumn('Staff', 'chargeOutBase', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      });
    }

    if (!tableDescription.chargeOutOT1) {
      await queryInterface.addColumn('Staff', 'chargeOutOT1', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      });
    }

    if (!tableDescription.chargeOutOT2) {
      await queryInterface.addColumn('Staff', 'chargeOutOT2', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const tableDescription = await queryInterface.describeTable('Staff');

    if (tableDescription.chargeOutBase) {
      await queryInterface.removeColumn('Staff', 'chargeOutBase');
    }

    if (tableDescription.chargeOutOT1) {
      await queryInterface.removeColumn('Staff', 'chargeOutOT1');
    }

    if (tableDescription.chargeOutOT2) {
      await queryInterface.removeColumn('Staff', 'chargeOutOT2');
    }
  }
};

