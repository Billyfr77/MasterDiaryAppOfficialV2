const path = require('path');
const config = require('./config/config.js');
const { Sequelize } = require('sequelize');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

console.log('Environment:', env);
console.log('Config Storage:', dbConfig.storage);
const resolvedPath = path.resolve(__dirname, dbConfig.storage);
console.log('Resolved DB Path:', resolvedPath);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: resolvedPath,
    logging: false
});

async function check() {
    try {
        const [results] = await sequelize.query("PRAGMA table_info(Staff);");
        const columns = results.map(c => c.name);
        console.log('Columns:', columns);
        if (columns.includes('fatigueLevel')) {
            console.log('SUCCESS: fatigueLevel exists.');
        } else {
            console.log('FAILURE: fatigueLevel MISSING.');
        }
    } catch (e) {
        console.error(e);
    }
}

check();
