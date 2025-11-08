'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // First, add the column as nullable
    await queryInterface.addColumn('Staff', 'userId', {
      type: Sequelize.UUID,
      allowNull: true, // Temporarily allow null
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // For existing records, we need to assign them to a default user
    // Let's assume there's at least one user in the Users table
    const users = await queryInterface.sequelize.query(
      'SELECT id FROM "Users" LIMIT 1;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0) {
      // Update existing staff records to belong to the first user
      await queryInterface.sequelize.query(
        `UPDATE "Staff" SET "userId" = '${users[0].id}' WHERE "userId" IS NULL;`,
        { type: Sequelize.QueryTypes.UPDATE }
      );
    }

    // Now make the column NOT NULL
    await queryInterface.changeColumn('Staff', 'userId', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Staff', 'userId');
  }
};