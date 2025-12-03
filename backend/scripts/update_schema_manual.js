const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite'); // Matches config/config.js
const db = new sqlite3.Database(dbPath);

const columnsToAdd = [
    { name: 'client', type: 'TEXT' },
    { name: 'status', type: 'TEXT DEFAULT "active"' },
    { name: 'value', type: 'REAL' },
    { name: 'description', type: 'TEXT' },
    { name: 'startDate', type: 'TEXT' }, // SQLite stores dates as TEXT
    { name: 'endDate', type: 'TEXT' }
];

db.serialize(() => {
    console.log('Checking Projects table schema...');
    
    columnsToAdd.forEach(col => {
        const sql = `ALTER TABLE Projects ADD COLUMN ${col.name} ${col.type}`;
        db.run(sql, (err) => {
            if (err) {
                if (err.message.includes('duplicate column name')) {
                    console.log(`Column ${col.name} already exists.`);
                } else {
                    console.error(`Error adding column ${col.name}:`, err.message);
                }
            } else {
                console.log(`Successfully added column: ${col.name}`);
            }
        });
    });
});

db.close(() => {
    console.log('Schema update process complete.');
});
