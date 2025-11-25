const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '../.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    logging: false
  }
);

async function checkPostgres() {
  try {
    await sequelize.authenticate();
    console.log('Connected to Postgres.');
    const [results, metadata] = await sequelize.query('SELECT * FROM "Users"');
    console.log('Users in Postgres:', results);
  } catch (error) {
    console.error('Error querying Postgres:', error.message);
  } finally {
    await sequelize.close();
  }
}

checkPostgres();
