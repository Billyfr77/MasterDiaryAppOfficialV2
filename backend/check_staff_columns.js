const { sequelize } = require('./src/models');

async function checkColumns() {
  try {
    const [results, metadata] = await sequelize.query("PRAGMA table_info(Staff);");
    console.log('Columns in Staff table:', results.map(c => c.name));
  } catch (error) {
    console.error('Error checking columns:', error);
  } finally {
    await sequelize.close();
  }
}

checkColumns();
