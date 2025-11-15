require('dotenv').config({ path: '../.env' });
const db = require('./src/models');

async function listUsers() {
  try {
    await db.sequelize.authenticate();
    console.log('Database connected.');

    await db.sequelize.sync();

    const { User } = db;

    const users = await User.findAll({ attributes: ['id', 'username', 'email', 'role', 'createdAt'] });
    console.log('Existing users:');
    users.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}, Created: ${user.createdAt}`);
    });

    if (users.length === 0) {
      console.log('No users found in database.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

listUsers();