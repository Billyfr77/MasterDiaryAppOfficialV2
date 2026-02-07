
const { sequelize } = require('../models');

exports.inspectQuotesTable = async (req, res) => {
  try {
    const tableInfo = await sequelize.getQueryInterface().describeTable('Quotes');
    res.json({
      success: true,
      projectId_column: tableInfo.projectId,
      full_schema: tableInfo
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

exports.forceFixQuotesTable = async (req, res) => {
  try {
    const dialect = sequelize.getDialect();
    let result = "No action taken.";

    if (dialect === 'postgres') {
      await sequelize.query('ALTER TABLE "Quotes" ALTER COLUMN "projectId" DROP NOT NULL;');
      result = "Executed Postgres ALTER COLUMN DROP NOT NULL";
    } else if (dialect === 'sqlite') {
        // SQLite is harder, but we are fixing Prod (Postgres)
        result = "Skipped SQLite (Local Dev environment)";
    }

    // Double check after fix
    const tableInfo = await sequelize.getQueryInterface().describeTable('Quotes');

    res.json({
      success: true,
      action: result,
      new_projectId_state: tableInfo.projectId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
