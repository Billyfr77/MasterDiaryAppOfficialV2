const { AuditLog } = require('../models');

const logAudit = async (userId, action, entity, entityId, details = {}, ipAddress = null) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      details,
      ipAddress
    });
  } catch (error) {
    console.error("Audit Log Failure:", error);
    // Don't throw, we don't want to block the main action if logging fails
  }
};

module.exports = { logAudit };
