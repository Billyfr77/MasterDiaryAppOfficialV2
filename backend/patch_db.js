const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log(`Patching database at: ${dbPath}`);

db.serialize(() => {
  // --- SAFETY FORMS ---
  const createSafetyForms = `
    CREATE TABLE IF NOT EXISTS SafetyForms (
      id UUID PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      type VARCHAR(255) DEFAULT 'SWMS',
      status VARCHAR(255) DEFAULT 'DRAFT',
      data JSON,
      signatures JSON,
      latitude DECIMAL(10, 7),
      longitude DECIMAL(10, 7),
      locationDetails VARCHAR(255),
      riskLevel VARCHAR(255) DEFAULT 'LOW',
      approvedBy UUID,
      approvedAt DATETIME,
      projectId UUID,
      templateId UUID,
      version INTEGER DEFAULT 1,
      createdBy UUID,
      createdAt DATETIME NOT NULL,
      updatedAt DATETIME NOT NULL
    )
  `;
  db.run(createSafetyForms, (err) => {
      if(err) console.error("SafetyForms Error:", err.message);
      else console.log("SafetyForms table checked/created.");
  });

  // --- QUOTES UPDATE ---
  db.run("ALTER TABLE Quotes ADD COLUMN visualData JSON", (err) => {
      if (err && !err.message.includes('duplicate column')) {
          console.error("Failed to add visualData to Quotes:", err.message);
      } else {
          console.log("Quotes table updated (visualData).");
      }
  });

  // --- ALLOCATIONS MIGRATION ---
  db.get("PRAGMA table_info(Allocations)", (err, row) => {
      if (err) return;
      console.log("Starting Allocations Schema Migration...");
      
      db.run("BEGIN TRANSACTION");
      
      try {
          db.run("ALTER TABLE Allocations RENAME TO Allocations_old", (err) => {
              if (err && !err.message.includes('no such table')) {
                  console.log("Allocations table might not exist or rename failed:", err.message);
              }
              
              const createNewAllocations = `
                CREATE TABLE Allocations (
                  id UUID PRIMARY KEY,
                  resourceType VARCHAR(255) NOT NULL,
                  resourceId UUID NOT NULL,
                  projectId UUID, 
                  startDate DATE NOT NULL,
                  endDate DATE NOT NULL,
                  startTime TIME,
                  endTime TIME,
                  category VARCHAR(255) DEFAULT 'project',
                  status VARCHAR(255) DEFAULT 'scheduled',
                  notes TEXT,
                  createdAt DATETIME NOT NULL,
                  updatedAt DATETIME NOT NULL
                )
              `;
              
              db.run(createNewAllocations, (err) => {
                  if (err) {
                      console.error("Failed to create new Allocations table:", err.message);
                      db.run("ROLLBACK");
                      return;
                  }
                  
                  const copyData = `
                    INSERT INTO Allocations (id, resourceType, resourceId, projectId, startDate, endDate, category, status, notes, createdAt, updatedAt)
                    SELECT id, resourceType, resourceId, projectId, startDate, endDate, category, status, notes, createdAt, updatedAt
                    FROM Allocations_old
                  `;
                  
                  db.run(copyData, (err) => {
                      if (err) {
                          console.log("Copy failed, trying fallback...", err.message);
                          const copyDataFallback = `
                            INSERT INTO Allocations (id, resourceType, resourceId, projectId, startDate, endDate, status, notes, createdAt, updatedAt)
                            SELECT id, resourceType, resourceId, projectId, startDate, endDate, status, notes, createdAt, updatedAt
                            FROM Allocations_old
                          `;
                          db.run(copyDataFallback, (err3) => {
                              if(err3) {
                                  console.error("Critical Migration Failure:", err3.message);
                                  db.run("ROLLBACK");
                              } else {
                                  console.log("Data migrated (fallback).");
                                  db.run("DROP TABLE Allocations_old");
                                  db.run("COMMIT");
                              }
                          });
                      } else {
                          console.log("Data migrated successfully.");
                          db.run("DROP TABLE Allocations_old");
                          db.run("COMMIT");
                      }
                  });
              });
          });
      } catch (e) {
          console.error("Migration Exception:", e);
          db.run("ROLLBACK");
      }
  });
});