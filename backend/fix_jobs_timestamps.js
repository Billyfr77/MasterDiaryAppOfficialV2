const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    const now = new Date().toISOString();

    // 1. Check for rows with NULL timestamps
    db.all("SELECT id FROM Jobs WHERE createdAt IS NULL OR updatedAt IS NULL", (err, rows) => {
        if (err) {
            console.error("Error checking Jobs timestamps:", err);
            return;
        }
        
        if (rows.length > 0) {
            console.log(`Found ${rows.length} jobs with NULL timestamps.`);
            
            // 2. Update them
            db.run("UPDATE Jobs SET createdAt = COALESCE(createdAt, ?), updatedAt = COALESCE(updatedAt, ?) WHERE createdAt IS NULL OR updatedAt IS NULL", [now, now], function(err) {
                if (err) {
                    console.error("Error updating Jobs timestamps:", err);
                } else {
                    console.log(`Updated ${this.changes} rows.`);
                }
                
                // 3. Drop backup table if exists to be safe
                db.run("DROP TABLE IF EXISTS Jobs_backup", (err) => {
                    if (err) console.error("Error dropping backup:", err);
                    else console.log("Dropped Jobs_backup.");
                    db.close();
                });
            });
        } else {
            console.log("No jobs with NULL timestamps found.");
            db.run("DROP TABLE IF EXISTS Jobs_backup", (err) => {
                 if (err) console.error("Error dropping backup:", err);
                 else console.log("Dropped Jobs_backup.");
                 db.close();
            });
        }
    });
});
