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
    console.log('Checking Staff columns...');
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Staff';
    `);
    
    const columns = res.rows.map(r => r.column_name);
    const required = ['fatigueLevel', 'skillTags', 'payRateNight'];
    
    const missing = required.filter(c => !columns.includes(c));
    
    if (missing.length === 0) {
        console.log('✅ ALL REQUIRED COLUMNS PRESENT.');
    } else {
        console.error('❌ STILL MISSING:', missing);
    }
    
    // Check Nodes
    console.log('Checking Nodes columns...');
    const resNodes = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'Nodes';
    `);
    const nodeCols = resNodes.rows.map(r => r.column_name);
    if (nodeCols.includes('stockQuantity')) {
        console.log('✅ stockQuantity PRESENT in Nodes.');
    } else {
        console.error('❌ stockQuantity MISSING in Nodes.');
    }

    // Check Projects
    console.log('Checking Projects columns...');
    const resProjects = await client.query(`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'Projects';
    `);
    const projCols = resProjects.rows.map(r => r.column_name);
    if (projCols.includes('version')) {
        console.log('✅ version PRESENT in Projects.');
    } else {
        console.error('❌ version MISSING in Projects.');
    }

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

run();
