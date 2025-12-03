const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite')
});

async function checkProjects() {
  try {
    const [results, metadata] = await sequelize.query("SELECT * FROM Projects");
    console.log('Projects in SQLite:', results);
  } catch (error) {
    console.error('Error querying SQLite:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkProjects();
