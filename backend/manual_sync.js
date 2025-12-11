const db = require('./src/models');

async function syncDB() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected.');
    await db.sequelize.sync({ alter: true });
    console.log('Database synced successfully (Alter).');
    process.exit(0);
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  }
}

syncDB();
