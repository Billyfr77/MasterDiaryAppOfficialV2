const { sequelize } = require('../models');

async function patchMapAssets() {
  console.log("🚀 Patching MapAssets table...");
  const queryInterface = sequelize.getQueryInterface();
  const tableInfo = await queryInterface.describeTable('MapAssets');

  if (!tableInfo.userId) {
    console.log("➕ Adding userId column to MapAssets...");
    await queryInterface.addColumn('MapAssets', 'userId', {
      type: sequelize.Sequelize.UUID,
      allowNull: true
    });
    
    if (tableInfo.createdBy) {
      console.log("🚚 Migrating data from createdBy to userId...");
      await sequelize.query("UPDATE MapAssets SET userId = createdBy WHERE userId IS NULL");
    }
    console.log("✅ MapAssets patched.");
  } else {
    console.log("ℹ️ userId column already exists in MapAssets.");
  }
  process.exit(0);
}

patchMapAssets();
