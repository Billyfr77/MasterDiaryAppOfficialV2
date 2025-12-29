/**
 * MasterDiaryOS // Audit Dispatcher
 * The Sovereign Archive // Level 18 Immutable Traceability
 */
const { AuditLog, User } = require('../models');

const logAudit = async (userId, action, entity, entityId, details = {}, ip = null) => {
    try {
        console.log(`[Audit] 📜 Logging ${action} on ${entity}:${entityId}`);
        await AuditLog.create({
            userId,
            action,
            entity,
            entityId,
            details,
            ipAddress: ip
        });
    } catch (err) {
        console.error("[Audit] Failed to record log:", err.message);
    }
};

const getGlobalAuditHistory = async (filters = {}) => {
    const { entity, action, userId, startDate, endDate } = filters;
    const where = {};
    
    if (entity) where.entity = entity;
    if (action) where.action = action;
    if (userId) where.userId = userId;
    
    return await AuditLog.findAll({
        where,
        include: [{ model: User, as: 'actor', attributes: ['username', 'email'] }],
        order: [['createdAt', 'DESC']],
        limit: 500
    });
};

module.exports = { logAudit, getGlobalAuditHistory };