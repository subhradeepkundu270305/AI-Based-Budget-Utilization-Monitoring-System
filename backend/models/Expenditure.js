const mongoose = require("mongoose");

const expenditureSchema = new mongoose.Schema(
  {
    budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget", required: true },
    amountSpent: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, trim: true, maxlength: 120 },
    date: { type: Date, required: true },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    supportingDocUrl: { type: String, default: null },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

expenditureSchema.index({ budgetId: 1, date: 1 });
expenditureSchema.index({ recordedBy: 1, createdAt: -1 });

module.exports = mongoose.model("Expenditure", expenditureSchema);
