const mongoose = require("mongoose");

const TYPES = ["UnderUtilization", "Overspending", "Spike", "PaceDeviation"];
const SEVERITIES = ["Low", "Medium", "High"];

const alertSchema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget", required: true },
  type: { type: String, enum: TYPES, required: true },
  severity: { type: String, enum: SEVERITIES, required: true },
  message: { type: String, required: true, maxlength: 1000 },
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  resolvedAt: { type: Date, default: null },
});

alertSchema.index({ resolved: 1, timestamp: -1 });
alertSchema.index({ budgetId: 1, type: 1, resolved: 1 });
alertSchema.index({ departmentId: 1, resolved: 1 });

module.exports = mongoose.model("Alert", alertSchema);
module.exports.TYPES = TYPES;
module.exports.SEVERITIES = SEVERITIES;
