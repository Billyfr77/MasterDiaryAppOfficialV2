const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

const columnsToAdd = [
    { name: 'status', type: 'TEXT DEFAULT "available"' },
    { name: 'hoursUsed', type: 'INTEGER DEFAULT 0' },
    { name: 'serviceInterval', type: 'INTEGER DEFAULT 500' },
    { name: 'lastServiceDate', type: 'TEXT' },
    { name: 'fuelLevel', type: 'INTEGER DEFAULT 100' },
    { name: 'assignedDriverId', type: 'TEXT' },
    { name: 'value', type: 'REAL' },
    { name: 'notes', type: 'TEXT' }
];

db.serialize(() => {
    console.log('Checking Equipment table schema...');
    
    columnsToAdd.forEach(col => {
        const sql = `ALTER TABLE Equipment ADD COLUMN ${col.name} ${col.type}`;
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
    console.log('Equipment schema update complete.');
});
