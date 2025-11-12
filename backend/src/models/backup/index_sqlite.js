'use strict';

const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);

const sequelize = new Sequelize('sqlite:../database.sqlite');

const db = {};

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    const modelName = model.name;
    db[modelName] = model;
  });

// Associations
if (db.Diary && db.Project) {
  db.Diary.belongsTo(db.Project, { foreignKey: 'projectId' });
}
if (db.Diary && db.Staff) {
  db.Diary.belongsTo(db.Staff, { foreignKey: 'workerId' });
}
// Add other associations as needed

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
