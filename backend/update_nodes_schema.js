const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: console.log
});

const queryInterface = sequelize.getQueryInterface();

async function updateSchema() {
  try {
    console.log('Adding stockQuantity to Nodes...');
    try {
      await queryInterface.addColumn('Nodes', 'stockQuantity', {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      });
      console.log('stockQuantity added to Nodes.');
    } catch (e) {
      if (e.message.includes('duplicate column name')) {
        console.log('stockQuantity already exists in Nodes.');
      } else {
        throw e;
      }
    }
  } catch (error) {
    console.error('Error updating schema:', error);
  } finally {
    await sequelize.close();
  }
}

updateSchema();
