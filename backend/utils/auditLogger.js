const AuditLog = require("../models/AuditLog");

const recordAuditLog = async ({ req, action, entityType, entityId = null, metadata = {} }) => {
  await AuditLog.create({
    actor: req.user?._id || null,
    action,
    entityType,
    entityId,
    metadata,
  });
};

module.exports = recordAuditLog;
