const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite')
});

async function checkUsers() {
  try {
    const [results, metadata] = await sequelize.query("SELECT * FROM Users");
    console.log('Users in SQLite:', results);
  } catch (error) {
    console.error('Error querying SQLite:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkUsers();
