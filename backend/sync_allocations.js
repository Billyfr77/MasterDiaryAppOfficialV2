const { sequelize } = require('./src/models');

async function sync() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synced!');
  } catch (err) {
    console.error('Sync failed:', err);
  } finally {
    await sequelize.close();
  }
}

sync();
