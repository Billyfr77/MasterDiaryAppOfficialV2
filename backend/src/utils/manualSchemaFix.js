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

    // 1.1 Fix Clients Table
    try {
      console.log('Checking Clients table...');
      try {
          await queryInterface.describeTable('Clients');
      } catch (e) {
          console.log('Clients table missing, creating...');
          await queryInterface.createTable('Clients', {
              id: { type: sequelize.Sequelize.UUID, primaryKey: true, defaultValue: sequelize.Sequelize.UUIDV4 },
              name: { type: sequelize.Sequelize.STRING, allowNull: false },
              company: { type: sequelize.Sequelize.STRING, allowNull: true },
              email: { type: sequelize.Sequelize.STRING, allowNull: true },
              phone: { type: sequelize.Sequelize.STRING, allowNull: true },
              address: { type: sequelize.Sequelize.TEXT, allowNull: true },
              notes: { type: sequelize.Sequelize.TEXT, allowNull: true },
              status: { type: sequelize.Sequelize.STRING, defaultValue: 'active' }, // Use STRING instead of ENUM for better compatibility during alter
              userId: { type: sequelize.Sequelize.UUID, allowNull: true },
              tags: { type: sequelize.Sequelize.JSON, defaultValue: [] },
              createdAt: { type: sequelize.Sequelize.DATE, allowNull: false },
              updatedAt: { type: sequelize.Sequelize.DATE, allowNull: false }
          });
          results.push('Created Clients table');
      }
      
      const clientTable = await queryInterface.describeTable('Clients');
      if (!clientTable.userId) {
          await queryInterface.addColumn('Clients', 'userId', { type: sequelize.Sequelize.UUID, allowNull: true });
          results.push('Added userId to Clients');
      }
    } catch (e) { results.push(`Error checking Clients: ${e.message}`); }

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
      if (!table.clientId) {
        await queryInterface.addColumn('Projects', 'clientId', { type: sequelize.Sequelize.UUID, allowNull: true });
        results.push('Added clientId to Projects');
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
      if (!table.edges) {
        await queryInterface.addColumn('Quotes', 'edges', { type: sequelize.Sequelize.JSON, allowNull: false, defaultValue: [] });
        results.push('Added edges to Quotes');
      }
      if (!table.clientId) {
        await queryInterface.addColumn('Quotes', 'clientId', { type: sequelize.Sequelize.UUID, allowNull: true });
        results.push('Added clientId to Quotes');
      }
      if (!table.totalCost) {
        await queryInterface.addColumn('Quotes', 'totalCost', { type: sequelize.Sequelize.DECIMAL(10, 2), defaultValue: 0 });
        results.push('Added totalCost to Quotes');
      }
      if (!table.totalRevenue) {
        await queryInterface.addColumn('Quotes', 'totalRevenue', { type: sequelize.Sequelize.DECIMAL(10, 2), defaultValue: 0 });
        results.push('Added totalRevenue to Quotes');
      }
      if (!table.items) {
        await queryInterface.addColumn('Quotes', 'items', { type: sequelize.Sequelize.JSON, allowNull: false, defaultValue: [] });
        results.push('Added items to Quotes');
      }
      // Relax projectId constraint (Force Nullable)
      try {
          // Attempt Sequelize Interface first
          await queryInterface.changeColumn('Quotes', 'projectId', {
              type: sequelize.Sequelize.UUID,
              allowNull: true
          });
          
          // Force Raw SQL for Postgres to be absolutely sure
          if (sequelize.getDialect() === 'postgres') {
              await sequelize.query('ALTER TABLE "Quotes" ALTER COLUMN "projectId" DROP NOT NULL;');
              await sequelize.query('ALTER TABLE "Quotes" ALTER COLUMN "clientId" DROP NOT NULL;');
              await sequelize.query('ALTER TABLE "Projects" ALTER COLUMN "clientId" DROP NOT NULL;');
              results.push('Executed RAW ALTER for Quotes and Projects (Postgres)');
          }
          
          results.push('Relaxed constraints on Quotes and Projects');
      } catch (e) {
          console.warn('Failed to relax constraints (might already be nullable):', e.message);
      }
    } catch (e) { results.push(`Error checking Quotes: ${e.message}`); }

    // 5. Fix Diaries Table
    try {
      console.log('Checking Diaries table...');
      const table = await queryInterface.describeTable('Diaries');
      const diaryFields = [
          { name: 'diaryType', type: sequelize.Sequelize.STRING },
          { name: 'canvasData', type: sequelize.Sequelize.JSON },
          { name: 'attachments', type: sequelize.Sequelize.JSON },
          { name: 'gpsData', type: sequelize.Sequelize.JSON },
          { name: 'weatherData', type: sequelize.Sequelize.JSON },
          { name: 'totalCost', type: sequelize.Sequelize.DECIMAL(10, 2) },
          { name: 'totalRevenue', type: sequelize.Sequelize.DECIMAL(10, 2) },
          { name: 'productivityScore', type: sequelize.Sequelize.INTEGER },
          { name: 'jobId', type: sequelize.Sequelize.UUID },
          { name: 'invoiceId', type: sequelize.Sequelize.UUID },
          { name: 'clientId', type: sequelize.Sequelize.UUID },
          { name: 'userId', type: sequelize.Sequelize.UUID }
      ];
      
      for (const field of diaryFields) {
        if (!table[field.name]) {
            await queryInterface.addColumn('Diaries', field.name, { type: field.type, allowNull: true });
            results.push(`Added ${field.name} to Diaries`);
        }
      }
      
      // Explicit check for notes column (Critical for AI)
      if (!table.notes) {
          await queryInterface.addColumn('Diaries', 'notes', { type: sequelize.Sequelize.TEXT, allowNull: true });
          results.push('Added notes column to Diaries');
      }
      if (!table.diaryType) {
          await queryInterface.addColumn('Diaries', 'diaryType', { type: sequelize.Sequelize.STRING, defaultValue: 'paint' });
          results.push('Added diaryType column to Diaries');
      }

      if (!table.version) {
        await queryInterface.addColumn('Diaries', 'version', { type: sequelize.Sequelize.INTEGER, allowNull: false, defaultValue: 0 });
        results.push('Added version to Diaries');
      }
    } catch (e) { results.push(`Error checking Diaries: ${e.message}`); }

    try {
        if (sequelize.getDialect() === 'postgres') {
            await sequelize.query('ALTER TABLE "Invoices" ALTER COLUMN "clientId" DROP NOT NULL;');
            await sequelize.query('ALTER TABLE "Invoices" ALTER COLUMN "projectId" DROP NOT NULL;');
            await sequelize.query('ALTER TABLE "Invoices" ALTER COLUMN "diaryId" DROP NOT NULL;');
            results.push('Executed RAW ALTER for Invoices (Postgres)');
        }
    } catch (e) { results.push(`Error checking Invoices: ${e.message}`); }

    try {
        if (sequelize.getDialect() === 'postgres') {
            await sequelize.query('ALTER TABLE "Diaries" ALTER COLUMN "clientId" DROP NOT NULL;');
            await sequelize.query('ALTER TABLE "Diaries" ALTER COLUMN "projectId" DROP NOT NULL;');
            
            // AGGRESSIVE COLUMN SYNC: Check multiple possible table names (quoted/unquoted)
            const checkColumnQuery = `
                SELECT column_name 
                FROM information_schema.columns 
                WHERE LOWER(table_name) = 'diaries' AND LOWER(column_name) = 'userid';
            `;
            const [cols] = await sequelize.query(checkColumnQuery);
            
            if (cols.length === 0) {
                console.log("userId missing on Diaries, performing emergency injection...");
                try {
                    await sequelize.query('ALTER TABLE "Diaries" ADD COLUMN "userId" UUID;');
                    results.push('Force injected userId column to Diaries (Postgres)');
                } catch (addErr) {
                    // Fallback to unquoted if quoted fails
                    await sequelize.query('ALTER TABLE diaries ADD COLUMN "userId" UUID;');
                    results.push('Force injected userId column to diaries (Unquoted)');
                }
            } else {
                results.push('userId column already verified on Diaries');
            }
            
            results.push('Executed RAW ALTER for Diaries (Postgres)');
        }
    } catch (e) { 
        console.error('Diaries raw alter failed:', e.message);
        results.push(`Diaries raw alter failed: ${e.message}`);
    }

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
      if (!table.userId) {
        await queryInterface.addColumn('Allocations', 'userId', { type: sequelize.Sequelize.UUID, allowNull: true });
        results.push('Added userId to Allocations');
      }

      // AGGRESSIVE SYNC FOR POSTGRES
      if (sequelize.getDialect() === 'postgres') {
          const checkAllocQuery = `
              SELECT column_name 
              FROM information_schema.columns 
              WHERE LOWER(table_name) = 'allocations' AND LOWER(column_name) = 'userid';
          `;
          const [allocCols] = await sequelize.query(checkAllocQuery);
          if (allocCols.length === 0) {
              await sequelize.query('ALTER TABLE "Allocations" ADD COLUMN IF NOT EXISTS "userId" UUID;');
              results.push('Force injected userId to Allocations (Postgres)');
          }
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

    // 12. Fix Notifications Table (Sentinel Upgrade)
    try {
        console.log('Checking Notifications table...');
        const table = await queryInterface.describeTable('Notifications');
        if (!table.data) {
            await queryInterface.addColumn('Notifications', 'data', { type: sequelize.Sequelize.JSON, allowNull: true });
            results.push('Added data to Notifications');
        }
        
        // Handle 'read' vs 'isRead' migration
        if (table.read && !table.isRead) {
            await queryInterface.renameColumn('Notifications', 'read', 'isRead');
            results.push('Renamed read to isRead in Notifications');
        } else if (!table.isRead) {
            await queryInterface.addColumn('Notifications', 'isRead', { type: sequelize.Sequelize.BOOLEAN, defaultValue: false });
            results.push('Added isRead to Notifications');
        }
    } catch (e) { results.push(`Error checking Notifications: ${e.message}`); }

    // 13. Fix Contracts Table (Ironclad Engine)
    try {
        console.log('Checking Contracts table...');
        try {
            await queryInterface.describeTable('Contracts');
        } catch (e) {
            console.log('Contracts table missing, creating...');
            await queryInterface.createTable('Contracts', {
                id: { type: sequelize.Sequelize.UUID, primaryKey: true, defaultValue: sequelize.Sequelize.UUIDV4 },
                projectId: { type: sequelize.Sequelize.UUID, allowNull: false },
                title: { type: sequelize.Sequelize.STRING, allowNull: false },
                status: { type: sequelize.Sequelize.STRING, defaultValue: 'active' },
                fileUrl: { type: sequelize.Sequelize.STRING, allowNull: true },
                intelligence: { type: sequelize.Sequelize.JSON, defaultValue: {} },
                extractedText: { type: sequelize.Sequelize.TEXT, allowNull: true },
                createdAt: { type: sequelize.Sequelize.DATE, allowNull: false },
                updatedAt: { type: sequelize.Sequelize.DATE, allowNull: false }
            });
            results.push('Created Contracts table');
        }
    } catch (e) { results.push(`Error checking Contracts: ${e.message}`); }

  } catch (err) {
    console.error('Fatal error in schema fix:', err);
    results.push(`Fatal Error: ${err.message}`);
  }

  return results;
}

module.exports = runSchemaFix;