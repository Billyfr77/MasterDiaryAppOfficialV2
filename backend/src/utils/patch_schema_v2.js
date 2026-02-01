const { sequelize } = require('../models');

async function patchSchema() {
  console.log("🚀 Starting Database Schema Patch V2 (Multi-Tenancy)...");
  const queryInterface = sequelize.getQueryInterface();
  const tableNames = await queryInterface.showAllTables();

  const patches = [
    { table: 'Invoices', column: 'userId', type: 'UUID' },
    { table: 'Jobs', column: 'userId', type: 'UUID' },
    { table: 'Clients', column: 'userId', type: 'UUID' },
    { table: 'MapAssets', column: 'createdBy', type: 'UUID' }, // Already exists in model but check just in case
    { table: 'Allocations', column: 'userId', type: 'UUID' }
  ];

  for (const patch of patches) {
    if (tableNames.includes(patch.table)) {
      try {
        const tableInfo = await queryInterface.describeTable(patch.table);
        if (!tableInfo[patch.column]) {
          console.log(`➕ Adding column ${patch.column} to ${patch.table}...`);
          await queryInterface.addColumn(patch.table, patch.column, {
            type: sequelize.Sequelize[patch.type],
            allowNull: true
          });
          console.log(`✅ Column ${patch.column} added to ${patch.table}.`);
        } else {
          console.log(`ℹ️ Column ${patch.column} already exists in ${patch.table}.`);
        }
      } catch (err) {
        console.error(`❌ Error patching table ${patch.table}:`, err.message);
      }
    } else {
      console.warn(`⚠️ Table ${patch.table} does not exist. Skipping.`);
    }
  }

  console.log("🎯 Schema Patch V2 Completed.");
  process.exit(0);
}

patchSchema();
