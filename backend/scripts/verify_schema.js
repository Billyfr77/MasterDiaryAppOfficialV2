const db = require('../src/models');

async function verifySchema() {
  try {
    console.log('Verifying schema...');
    
    const checkTable = async (table) => {
        const [results] = await db.sequelize.query(`PRAGMA table_info(${table});`);
        const columns = results.map(c => c.name);
        console.log(`Table ${table} columns:`, columns.join(', '));
        
        if (!columns.includes('clientId')) {
            console.error(`❌ Missing 'clientId' in ${table}! Attempting to add...`);
            try {
                await db.sequelize.query(`ALTER TABLE ${table} ADD COLUMN clientId UUID;`);
                console.log(`✅ Added 'clientId' to ${table}`);
            } catch (e) {
                console.error(`Failed to add column: ${e.message}`);
            }
        } else {
            console.log(`✅ ${table} has 'clientId'.`);
        }
    };

    await checkTable('Projects');
    await checkTable('Quotes');
    await checkTable('Invoices');
    await checkTable('Diaries');

    console.log('Verification complete.');
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    process.exit();
  }
}

verifySchema();
