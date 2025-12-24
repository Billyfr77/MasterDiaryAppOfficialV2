'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Staff', 'fatigueLevel', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('Staff', 'skillTags', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    });
    await queryInterface.addColumn('Staff', 'historicalPerformance', {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Staff', 'fatigueLevel');
    await queryInterface.removeColumn('Staff', 'skillTags');
    await queryInterface.removeColumn('Staff', 'historicalPerformance');
  }
};
