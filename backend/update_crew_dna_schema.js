const { sequelize } = require('./src/models');

async function updateSchema() {
  const queryInterface = sequelize.getQueryInterface();
  
  try {
    console.log('Adding crew DNA fields to Staff table...');
    
    try {
      await queryInterface.addColumn('Staff', 'fatigueLevel', {
        type: sequelize.Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      });
      console.log('- Added fatigueLevel');
    } catch (e) {
      console.log('- fatigueLevel might already exist');
    }

    try {
      await queryInterface.addColumn('Staff', 'skillTags', {
        type: sequelize.Sequelize.JSON,
        allowNull: true,
        defaultValue: []
      });
      console.log('- Added skillTags');
    } catch (e) {
      console.log('- skillTags might already exist');
    }

    try {
      await queryInterface.addColumn('Staff', 'historicalPerformance', {
        type: sequelize.Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
      });
      console.log('- Added historicalPerformance');
    } catch (e) {
      console.log('- historicalPerformance might already exist');
    }

    try {
      await queryInterface.addColumn('Staff', 'payRateNight', {
        type: sequelize.Sequelize.DECIMAL(10, 2),
        allowNull: true
      });
      console.log('- Added payRateNight');
    } catch (e) {
      console.log('- payRateNight might already exist');
    }

    try {
      await queryInterface.addColumn('Staff', 'chargeOutNight', {
        type: sequelize.Sequelize.DECIMAL(10, 2),
        allowNull: true
      });
      console.log('- Added chargeOutNight');
    } catch (e) {
      console.log('- chargeOutNight might already exist');
    }

    console.log('Schema update complete.');
  } catch (error) {
    console.error('Schema update failed:', error);
  } finally {
    await sequelize.close();
  }
}

updateSchema();
