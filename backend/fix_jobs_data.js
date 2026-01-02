const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Check for rows with NULL clientName
    db.all("SELECT id, jobNumber FROM Jobs WHERE clientName IS NULL", (err, rows) => {
        if (err) {
            console.error("Error checking Jobs:", err);
            return;
        }
        
        if (rows.length > 0) {
            console.log(`Found ${rows.length} jobs with NULL clientName.`);
            
            // 2. Update them
            db.run("UPDATE Jobs SET clientName = 'Unknown Client' WHERE clientName IS NULL", function(err) {
                if (err) {
                    console.error("Error updating Jobs:", err);
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
            console.log("No jobs with NULL clientName found.");
            db.run("DROP TABLE IF EXISTS Jobs_backup", (err) => {
                 if (err) console.error("Error dropping backup:", err);
                 else console.log("Dropped Jobs_backup.");
                 db.close();
            });
        }
    });
});
