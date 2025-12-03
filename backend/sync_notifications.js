const db = require('./src/models');

async function syncNotifications() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected.');
    
    // Force sync the Notification model
    if (db.Notification) {
      await db.Notification.sync({ alter: true });
      console.log('Notification table synced successfully.');
    } else {
      console.error('Notification model not found in db object.');
    }
    
  } catch (error) {
    console.error('Error syncing notifications:', error);
  } finally {
    await db.sequelize.close();
  }
}

syncNotifications();
