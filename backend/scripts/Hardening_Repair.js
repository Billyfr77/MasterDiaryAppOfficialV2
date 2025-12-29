/**
 * MasterDiaryOS // Database Hardening Core
 * Level 18 Sovereign Resilience Protocol
 * This script ensures the PostgreSQL (or SQLite) schema matches the Billion-Dollar Spec.
 */
const { sequelize } = require('../src/models');

async function hardenDatabase() {
    console.log("🛡️ INITIATING DATABASE HARDENING PROTOCOL...");
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();

    const tableHardening = {
        'Diaries': ['notes', 'version'],
        'Projects': ['version'],
        'Quotes': ['version'],
        'Staff': ['fatigueLevel', 'historicalPerformance']
    };

    try {
        for (const [table, columns] of Object.entries(tableHardening)) {
            if (!tables.includes(table)) {
                console.warn(`⚠️ Table ${table} missing. Skipping hardening.`);
                continue;
            }

            const tableInfo = await queryInterface.describeTable(table);
            
            for (const col of columns) {
                if (!tableInfo[col]) {
                    console.log(`➕ Table [${table}]: Adding missing column [${col}]`);
                    const type = col === 'version' ? 'INTEGER DEFAULT 0' : 'TEXT';
                    await sequelize.query(`ALTER TABLE "${table}" ADD COLUMN "${col}" ${type};`);
                } else {
                    console.log(`✅ Table [${table}]: Column [${col}] already verified.`);
                }
            }
        }

        console.log("\n💎 DATABASE HARDENING COMPLETE: SCHEMA IS MISSION-CRITICAL.");
    } catch (err) {
        console.error("❌ HARDENING FAILED:", err.message);
    } finally {
        await sequelize.close();
    }
}

hardenDatabase();
