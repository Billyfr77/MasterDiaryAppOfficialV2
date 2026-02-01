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
    console.log('Connecting...');
    await client.connect();
    
    console.log('Attempting to grant role master_admin to postgres...');
    // This requires postgres to be a superuser or have admin option
    await client.query('GRANT master_admin TO postgres;');
    console.log('Role granted!');
    
    // Now verify by selecting from a table
    console.log('Verifying access...');
    const res = await client.query('SELECT count(*) FROM "Users";');
    console.log('User count:', res.rows[0].count);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await client.end();
  }
}

run();