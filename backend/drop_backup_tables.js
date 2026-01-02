const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    const backupTables = ['Diaries_backup', 'Allocations_backup', 'Users_backup', 'Jobs_backup'];
    
    backupTables.forEach(table => {
        db.run(`DROP TABLE IF EXISTS ${table}`, (err) => {
            if (err) {
                console.error(`Error dropping ${table}:`, err.message);
            } else {
                console.log(`Dropped ${table} (if it existed).`);
            }
        });
    });
});

db.close((err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Database connection closed.');
});
