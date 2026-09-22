const AuditLog = require("../models/AuditLog");

async function writeAudit({ userId, action, targetCollection, targetId, before = null, after = null }) {
  await AuditLog.create({
    userId,
    action,
    targetCollection,
    targetId: targetId || null,
    changes: { before, after },
  });
}

function lean(doc) {
  if (!doc) return null;
  if (typeof doc.toObject === "function") return doc.toObject();
  return JSON.parse(JSON.stringify(doc));
}

module.exports = { writeAudit, lean };
