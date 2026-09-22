const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true, trim: true },
  targetCollection: { type: String, required: true, trim: true },
  targetId: { type: mongoose.Schema.Types.Mixed, default: null },
  changes: {
    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  timestamp: { type: Date, default: Date.now },
});

auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ targetCollection: 1, targetId: 1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
