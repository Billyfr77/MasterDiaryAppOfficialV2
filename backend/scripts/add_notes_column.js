
const { sequelize } = require('../src/models');

async function migrate() {
    console.log("Running migration: Adding 'notes' to Diaries table...");
    try {
        await sequelize.query("ALTER TABLE Diaries ADD COLUMN notes TEXT DEFAULT '';");
        console.log("Migration successful!");
    } catch (error) {
        if (error.message.includes("duplicate column name")) {
            console.log("Column 'notes' already exists. Skipping.");
        } else {
            console.error("Migration failed:", error);
        }
    } finally {
        await sequelize.close();
    }
}

migrate();
