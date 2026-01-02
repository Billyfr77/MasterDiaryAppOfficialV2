const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, rows) => {
        if (err) {
            console.error("Error getting tables:", err);
            return;
        }
        console.log("Tables in database:");
        rows.forEach(row => {
            console.log(row.name);
        });

        if (rows.find(r => r.name === 'Diaries')) {
            console.log("\nChecking Diaries table columns:");
            db.all("PRAGMA table_info(Diaries)", (err, cols) => {
                if (err) {
                    console.error("Error getting Diaries info:", err);
                    return;
                }
                cols.forEach(col => {
                    console.log(`${col.cid}: ${col.name} (${col.type})`);
                });
                console.log(`Total columns: ${cols.length}`);

                // Check backup too
                console.log("\nChecking Diaries_backup table columns:");
                db.all("PRAGMA table_info(Diaries_backup)", (err, bCols) => {
                     if (bCols) {
                        bCols.forEach(col => {
                            console.log(`${col.cid}: ${col.name} (${col.type})`);
                        });
                        console.log(`Total columns: ${bCols.length}`);
                     }
                     db.close();
                });
            });
        } else {
             db.close();
        }
    });
});
