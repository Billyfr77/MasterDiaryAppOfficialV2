const db = require('../src/models');

async function addColumns() {
  try {
    console.log('Starting manual schema update...');
    
    // Helper to add column if missing
    const addColumn = async (table, column, type) => {
      try {
        await db.sequelize.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${type};`);
        console.log(`✅ Added ${column} to ${table}`);
      } catch (error) {
        if (error.message.includes('duplicate column name')) {
          console.log(`ℹ️  Column ${column} already exists in ${table}`);
        } else {
          console.error(`❌ Failed to add ${column} to ${table}:`, error.message);
        }
      }
    };

    // SQLite UUID is usually stored as STRING or BINARY, but Sequelize uses UUID type which maps to CHAR(36) or similar.
    // In raw SQL for SQLite, we can just use TEXT or UUID (SQLite ignores type affinity mostly, but TEXT is safe).
    // Using 'UUID' to match Sequelize's likely expectation.
    
    await addColumn('Projects', 'clientId', 'UUID');
    await addColumn('Quotes', 'clientId', 'UUID');
    await addColumn('Invoices', 'clientId', 'UUID');
    await addColumn('Diaries', 'clientId', 'UUID');

    console.log('Schema update complete.');
  } catch (err) {
    console.error('Fatal error:', err);
  } finally {
    process.exit();
  }
}

addColumns();
