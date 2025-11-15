require('dotenv').config({ path: '../.env' });
const db = require('./src/models');

async function addDefaultUser() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected.');

    await db.sequelize.sync();

    const { User } = db;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email: 'admin@example.com' } });
    if (existingUser) {
      console.log('Default user already exists.');
      return;
    }

    // Create default user
    const user = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123', // Will be hashed by hook
      role: 'admin'
    });

    console.log('Default user created:', user.email);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

addDefaultUser();