const { sequelize } = require('../models');

async function runSchemaFix() {
  const queryInterface = sequelize.getQueryInterface();
  const results = [];

  try {
    // 1. Fix Staff Table
    try {
      console.log('Checking Staff table...');
      const table = await queryInterface.describeTable('Staff');
      const staffFields = [
        { name: 'payRateNight', type: sequelize.Sequelize.DECIMAL(10, 2) },
        { name: 'chargeOutNight', type: sequelize.Sequelize.DECIMAL(10, 2) },
        { name: 'fatigueLevel', type: sequelize.Sequelize.INTEGER, defaultValue: 0 },
        { name: 'skillTags', type: sequelize.Sequelize.JSON, defaultValue: [] },
        { name: 'historicalPerformance', type: sequelize.Sequelize.JSON, defaultValue: {} },
        { name: 'allowances', type: sequelize.Sequelize.JSON, defaultValue: [] }
      ];
      for (const field of staffFields) {
        if (!table[field.name]) {
          await queryInterface.addColumn('Staff', field.name, { type: field.type, allowNull: true, defaultValue: field.defaultValue });
          results.push(`Added ${field.name} to Staff`);
        }
      }
    } catch (e) { results.push(`Error checking Staff: ${e.message}`); }

    // 2. Fix Nodes Table
    try {
      console.log('Checking Nodes table...');
      const table = await queryInterface.describeTable('Nodes');
      if (!table.stockQuantity) {
        await queryInterface.addColumn('Nodes', 'stockQuantity', { type: sequelize.Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
        results.push('Added stockQuantity to Nodes');
      }
    } catch (e) { results.push(`Error checking Nodes: ${e.message}`); }

    // 3. Fix Projects Table
    try {
      console.log('Checking Projects table...');
      const table = await queryInterface.describeTable('Projects');
      if (!table.version) {
        await queryInterface.addColumn('Projects', 'version', { type: sequelize.Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
        results.push('Added version to Projects');
      }
    } catch (e) { results.push(`Error checking Projects: ${e.message}`); }

    // 4. Fix Quotes Table
    try {
      console.log('Checking Quotes table...');
      const table = await queryInterface.describeTable('Quotes');
      if (!table.version) {
        await queryInterface.addColumn('Quotes', 'version', { type: sequelize.Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
        results.push('Added version to Quotes');
      }
    } catch (e) { results.push(`Error checking Quotes: ${e.message}`); }

    // 5. Fix Diaries Table
    try {
      console.log('Checking Diaries table...');
      const table = await queryInterface.describeTable('Diaries');
      const diaryFields = ['diaryType', 'canvasData', 'attachments', 'gpsData', 'weatherData', 'totalCost', 'totalRevenue', 'productivityScore', 'jobId', 'invoiceId'];
      for (const field of diaryFields) {
        if (!table[field]) {
            let type = sequelize.Sequelize.STRING;
            if (['canvasData', 'attachments', 'gpsData', 'weatherData'].includes(field)) type = sequelize.Sequelize.JSON;
            if (['totalCost', 'totalRevenue'].includes(field)) type = sequelize.Sequelize.DECIMAL(10, 2);
            if (['productivityScore'].includes(field)) type = sequelize.Sequelize.INTEGER;
            if (['jobId', 'invoiceId'].includes(field)) type = sequelize.Sequelize.UUID;
            await queryInterface.addColumn('Diaries', field, { type, allowNull: true });
            results.push(`Added ${field} to Diaries`);
        }
      }
      if (!table.version) {
        await queryInterface.addColumn('Diaries', 'version', { type: sequelize.Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
        results.push('Added version to Diaries');
      }
    } catch (e) { results.push(`Error checking Diaries: ${e.message}`); }

    // 6. Fix Equipment Table
    try {
      console.log('Checking Equipment table...');
      const table = await queryInterface.describeTable('Equipment');
      if (!table.value) {
        await queryInterface.addColumn('Equipment', 'value', { type: sequelize.Sequelize.DECIMAL(10, 2), allowNull: true });
        results.push('Added value to Equipment');
      }
      if (!table.serviceHistory) {
        await queryInterface.addColumn('Equipment', 'serviceHistory', { type: sequelize.Sequelize.JSON, defaultValue: [] });
        results.push('Added serviceHistory to Equipment');
      }
    } catch (e) { results.push(`Error checking Equipment: ${e.message}`); }

    // 7. Fix Allocations Table
    try {
      console.log('Checking Allocations table...');
      const table = await queryInterface.describeTable('Allocations');
      if (!table.category) {
        await queryInterface.addColumn('Allocations', 'category', { type: sequelize.Sequelize.STRING, defaultValue: 'project' });
        results.push('Added category to Allocations');
      }
      if (!table.startTime) {
        await queryInterface.addColumn('Allocations', 'startTime', { type: sequelize.Sequelize.TIME, allowNull: true });
        results.push('Added startTime to Allocations');
      }
      if (!table.endTime) {
        await queryInterface.addColumn('Allocations', 'endTime', { type: sequelize.Sequelize.TIME, allowNull: true });
        results.push('Added endTime to Allocations');
      }
    } catch (e) { results.push(`Error checking Allocations: ${e.message}`); }

    // 8. Fix SafetyForms Table
    try {
      console.log('Checking SafetyForms table...');
      try {
        const table = await queryInterface.describeTable('SafetyForms');
        if (!table.version) {
          await queryInterface.addColumn('SafetyForms', 'version', { type: sequelize.Sequelize.INTEGER, defaultValue: 1 });
          results.push('Added version to SafetyForms');
        }
        if (!table.locationDetails) {
          await queryInterface.addColumn('SafetyForms', 'locationDetails', { type: sequelize.Sequelize.STRING, allowNull: true });
          results.push('Added locationDetails to SafetyForms');
        }
      } catch (e) {
        // Create Table if missing
        console.log('SafetyForms missing, skipping creation (rely on sync for full table) or implement createTable here if needed.');
        // For now, let's trust sync({alter:true}) might pick it up if we fix the crash.
      }
    } catch (e) { results.push(`Error checking SafetyForms: ${e.message}`); }

    // 10. Fix Jobs Table
    try {
      console.log('Checking Jobs table...');
      try {
          await queryInterface.describeTable('Jobs');
      } catch (e) {
          console.log('Jobs table missing, creating...');
          await queryInterface.createTable('Jobs', {
              id: { type: sequelize.Sequelize.UUID, primaryKey: true, defaultValue: sequelize.Sequelize.UUIDV4 },
              jobNumber: { type: sequelize.Sequelize.STRING, allowNull: false },
              clientName: { type: sequelize.Sequelize.STRING, allowNull: false },
              clientId: { type: sequelize.Sequelize.UUID, allowNull: true },
              projectId: { type: sequelize.Sequelize.UUID, allowNull: true },
              serviceType: { type: sequelize.Sequelize.STRING, allowNull: true },
              wasteType: { type: sequelize.Sequelize.STRING, allowNull: true },
              pricingType: { type: sequelize.Sequelize.STRING, defaultValue: 'flat' },
              rate: { type: sequelize.Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
              hours: { type: sequelize.Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
              cost: { type: sequelize.Sequelize.DECIMAL(10, 2), defaultValue: 0.00 },
              status: { type: sequelize.Sequelize.STRING, defaultValue: 'pending' },
              date: { type: sequelize.Sequelize.DATEONLY, allowNull: false },
              resourceId: { type: sequelize.Sequelize.STRING, allowNull: true },
              notes: { type: sequelize.Sequelize.TEXT, allowNull: true },
              createdAt: { type: sequelize.Sequelize.DATE, allowNull: false },
              updatedAt: { type: sequelize.Sequelize.DATE, allowNull: false }
          });
          results.push('Created Jobs table');
      }
    } catch (e) { results.push(`Error checking Jobs: ${e.message}`); }

    // 11. Fix DiaryTemplates Table
    try {
      console.log('Checking DiaryTemplates table...');
      try {
          await queryInterface.describeTable('DiaryTemplates');
      } catch (e) {
          console.log('DiaryTemplates table missing, creating...');
          await queryInterface.createTable('DiaryTemplates', {
              id: { type: sequelize.Sequelize.UUID, primaryKey: true, defaultValue: sequelize.Sequelize.UUIDV4 },
              name: { type: sequelize.Sequelize.STRING, allowNull: false },
              type: { type: sequelize.Sequelize.STRING, defaultValue: 'node-group' },
              description: { type: sequelize.Sequelize.TEXT, allowNull: true },
              category: { type: sequelize.Sequelize.STRING, defaultValue: 'General' },
              tags: { type: sequelize.Sequelize.JSON, defaultValue: [] },
              version: { type: sequelize.Sequelize.INTEGER, defaultValue: 1 },
              usageCount: { type: sequelize.Sequelize.INTEGER, defaultValue: 0 },
              preview: { type: sequelize.Sequelize.JSON, allowNull: true },
              data: { type: sequelize.Sequelize.JSON, allowNull: false },
              userId: { type: sequelize.Sequelize.UUID, allowNull: false },
              projectId: { type: sequelize.Sequelize.UUID, allowNull: true },
              isPublic: { type: sequelize.Sequelize.BOOLEAN, defaultValue: false },
              createdAt: { type: sequelize.Sequelize.DATE, allowNull: false },
              updatedAt: { type: sequelize.Sequelize.DATE, allowNull: false }
          });
          results.push('Created DiaryTemplates table');
      }
    } catch (e) { results.push(`Error checking DiaryTemplates: ${e.message}`); }

  } catch (err) {
    console.error('Fatal error in schema fix:', err);
    results.push(`Fatal Error: ${err.message}`);
  }

  return results;
}

module.exports = runSchemaFix;