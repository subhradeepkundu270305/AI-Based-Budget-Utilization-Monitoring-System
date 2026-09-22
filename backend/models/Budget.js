const mongoose = require("mongoose");

const STATUSES = ["Active", "Closed"];

const budgetSchema = new mongoose.Schema(
  {
    financialYear: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    allocatedAmount: { type: Number, required: true, min: 0 },
    allocationDate: { type: Date, required: true },
    periodStart: { type: Date, required: true },
    periodEnd: { type: Date, required: true },
    scheme: { type: String, required: true, trim: true, maxlength: 240 },
    status: { type: String, enum: STATUSES, default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

budgetSchema.index({ department: 1, financialYear: 1 });
budgetSchema.index({ status: 1, periodEnd: 1 });

module.exports = mongoose.model("Budget", budgetSchema);
module.exports.STATUSES = STATUSES;
