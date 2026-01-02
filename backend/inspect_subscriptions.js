const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
console.log(`Opening database at: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

function query(sql) {
    return new Promise((resolve, reject) => {
        db.all(sql, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function run() {
    try {
        const tables = await query("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'Subscription%'");
        console.log('Tables found:', tables);

        for (const table of tables) {
            const rows = await query(`SELECT * FROM ${table.name}`);
            console.log(`\nTable: ${table.name} | Count: ${rows.length}`);
            
            const ids = rows.map(r => r.id);
            const uniqueIds = new Set(ids);
            if (ids.length !== uniqueIds.size) {
                console.error(`CRITICAL: Duplicate IDs found in ${table.name}!`);
                const counts = {};
                ids.forEach(id => counts[id] = (counts[id] || 0) + 1);
                const duplicates = Object.keys(counts).filter(id => counts[id] > 1);
                console.log('Duplicate IDs:', duplicates);
            } else {
                console.log(`No duplicates in ${table.name}.`);
            }
            if (rows.length > 0) {
                console.log('Sample row:', rows[0]);
            }
        }
    } catch (err) {
        console.error('Error during inspection:', err);
    } finally {
        db.close();
    }
}

run();
