const mongoose = require("mongoose");

const thresholdConfigSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "default" },
    underUtilizationPct: { type: Number, default: 40, min: 0, max: 100 },
    underUtilizationTimeElapsedPct: { type: Number, default: 70, min: 0, max: 100 },
    spikeThresholdPct: { type: Number, default: 25, min: 0, max: 100 },
    paceDeviationPct: { type: Number, default: 20, min: 0, max: 100 },
  },
  { timestamps: true }
);

thresholdConfigSchema.statics.getConfig = async function getConfig() {
  let doc = await this.findOne({ key: "default" });
  if (!doc) {
    doc = await this.create({ key: "default" });
  }
  return doc;
};

module.exports = mongoose.model("ThresholdConfig", thresholdConfigSchema);
