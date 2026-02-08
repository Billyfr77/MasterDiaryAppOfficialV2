const { sequelize } = require('../src/models');

async function forceFix() {
  const queryInterface = sequelize.getQueryInterface();
  console.log('--- Force Schema Fix Starting ---');
  
  try {
    const table = await queryInterface.describeTable('Diaries');
    if (!table.userId) {
      console.log('Adding userId column to Diaries...');
      await queryInterface.addColumn('Diaries', 'userId', {
        type: sequelize.Sequelize.UUID,
        allowNull: true
      });
      console.log('Successfully added userId to Diaries');
    } else {
      console.log('userId column already exists in Diaries');
    }

    // Also check for projectId and other missing columns that might cause issues
    const missingColumns = [
        { name: 'diaryType', type: sequelize.Sequelize.STRING },
        { name: 'canvasData', type: sequelize.Sequelize.JSON },
        { name: 'totalCost', type: sequelize.Sequelize.DECIMAL(10, 2) },
        { name: 'totalRevenue', type: sequelize.Sequelize.DECIMAL(10, 2) }
    ];

    for (const col of missingColumns) {
        if (!table[col.name]) {
            console.log(`Adding ${col.name} column to Diaries...`);
            await queryInterface.addColumn('Diaries', col.name, {
                type: col.type,
                allowNull: true
            });
            console.log(`Successfully added ${col.name} to Diaries`);
        }
    }

  } catch (error) {
    console.error('Error during force fix:', error);
  } finally {
    process.exit();
  }
}

forceFix();
