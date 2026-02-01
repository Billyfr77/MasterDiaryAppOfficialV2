const { Client } = require('pg');

const config = {
  user: 'postgres',
  password: 'MasterDiary2025!',
  host: '35.239.14.79',
  database: 'masterdiary_prod',
  port: 5432,
  ssl: { rejectUnauthorized: false }
};

const client = new Client(config);

async function run() {
  try {
    await client.connect();
    const res = await client.query(`
      SELECT tablename, tableowner 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public';
    `);
    console.table(res.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
