const { sequelize } = require('./src/models');

async function repair() {
  try {
    console.log('--- Database Repair Script ---');
    const [results] = await sequelize.query("PRAGMA table_info(DiaryTemplates);");
    const columns = results.map(r => r.name);
    console.log('Current columns in DiaryTemplates:', columns);

    const requiredColumns = [
      { name: 'category', type: 'VARCHAR(255) DEFAULT "General"' },
      { name: 'tags', type: 'JSON DEFAULT "[]"' },
      { name: 'version', type: 'INTEGER DEFAULT 1' },
      { name: 'usageCount', type: 'INTEGER DEFAULT 0' },
      { name: 'preview', type: 'JSON' },
      { name: 'isPublic', type: 'BOOLEAN DEFAULT 0' }
    ];

    for (const col of requiredColumns) {
      if (!columns.includes(col.name)) {
        console.log(`Adding missing column: ${col.name}...`);
        await sequelize.query(`ALTER TABLE DiaryTemplates ADD COLUMN ${col.name} ${col.type};`);
      }
    }

    console.log('Repair complete!');
    process.exit(0);
  } catch (err) {
    console.error('Repair failed:', err);
    process.exit(1);
  }
}

repair();
