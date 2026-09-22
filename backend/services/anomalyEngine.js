const ThresholdConfig = require("../models/ThresholdConfig");

function round2(n) {
  return Math.round(n * 100) / 100;
}

function calculateUtilizationPct(allocatedAmount, spent) {
  if (!allocatedAmount) return 0;
  return round2((spent / allocatedAmount) * 100);
}

function calculateTimeElapsedPct(periodStart, periodEnd, now = new Date()) {
  const start = new Date(periodStart).getTime();
  const end = new Date(periodEnd).getTime();
  const current = new Date(now).getTime();
  if (end <= start) return 100;
  if (current <= start) return 0;
  if (current >= end) return 100;
  return round2(((current - start) / (end - start)) * 100);
}

function evaluateUnderUtilization({ utilizationPct, timeElapsedPct, config }) {
  if (timeElapsedPct >= config.underUtilizationTimeElapsedPct && utilizationPct < config.underUtilizationPct) {
    const severity = utilizationPct < config.underUtilizationPct / 2 ? "High" : "Medium";
    return {
      type: "UnderUtilization",
      severity,
      message: `Utilization is ${utilizationPct}% after ${timeElapsedPct}% of the budget period has elapsed (threshold ${config.underUtilizationPct}% by ${config.underUtilizationTimeElapsedPct}% elapsed).`,
    };
  }
  return null;
}

function evaluateOverspending({ spent, allocatedAmount }) {
  if (spent > allocatedAmount) {
    const overPct = round2(((spent - allocatedAmount) / allocatedAmount) * 100);
    return {
      type: "Overspending",
      severity: overPct > 10 ? "High" : "Medium",
      message: `Cumulative expenditure exceeds allocation by ${overPct}% (spent ${spent} against ${allocatedAmount}).`,
    };
  }
  return null;
}

function evaluateSpike({ amount, remainingBefore, config }) {
  if (remainingBefore <= 0) return null;
  const pctOfRemaining = round2((amount / remainingBefore) * 100);
  if (pctOfRemaining > config.spikeThresholdPct) {
    const severity = pctOfRemaining > config.spikeThresholdPct * 2 ? "High" : "Medium";
    return {
      type: "Spike",
      severity,
      message: `A single transaction of ${amount} is ${pctOfRemaining}% of remaining allocation (${remainingBefore}) versus spike threshold ${config.spikeThresholdPct}%.`,
    };
  }
  return null;
}

function evaluatePaceDeviation({ spent, allocatedAmount, timeElapsedPct, config }) {
  if (timeElapsedPct < 5) return null;
  const expected = allocatedAmount * (timeElapsedPct / 100);
  if (expected <= 0) return null;
  const deviationPct = round2((Math.abs(spent - expected) / expected) * 100);
  if (deviationPct > config.paceDeviationPct) {
    const direction = spent > expected ? "ahead of" : "behind";
    const severity = deviationPct > config.paceDeviationPct * 2 ? "High" : "Medium";
    return {
      type: "PaceDeviation",
      severity,
      message: `Spend is ${deviationPct}% ${direction} the prorated pace (spent ${round2(spent)} vs expected ${round2(expected)} at ${timeElapsedPct}% elapsed).`,
    };
  }
  return null;
}

function detectAnomalies({ budget, expenditures, config, now = new Date() }) {
  const sorted = [...expenditures].sort((a, b) => new Date(a.date) - new Date(b.date));
  const spent = sorted.reduce((sum, e) => sum + Number(e.amountSpent), 0);
  const utilizationPct = calculateUtilizationPct(budget.allocatedAmount, spent);
  const timeElapsedPct = calculateTimeElapsedPct(budget.periodStart, budget.periodEnd, now);

  const findings = [];
  const under = evaluateUnderUtilization({ utilizationPct, timeElapsedPct, config });
  if (under) findings.push(under);
  const over = evaluateOverspending({ spent, allocatedAmount: budget.allocatedAmount });
  if (over) findings.push(over);
  const pace = evaluatePaceDeviation({
    spent,
    allocatedAmount: budget.allocatedAmount,
    timeElapsedPct,
    config,
  });
  if (pace) findings.push(pace);

  let remaining = budget.allocatedAmount;
  for (const txn of sorted) {
    const spike = evaluateSpike({ amount: Number(txn.amountSpent), remainingBefore: remaining, config });
    if (spike) {
      findings.push({ ...spike, expenditureId: txn._id || txn.id || null });
    }
    remaining -= Number(txn.amountSpent);
  }

  return { spent, utilizationPct, timeElapsedPct, findings };
}

async function upsertAlert(Alert, budget, finding) {
  const existing = await Alert.findOne({
    budgetId: budget._id,
    type: finding.type,
    resolved: false,
  });
  if (existing) return existing;
  return Alert.create({
    departmentId: budget.department,
    budgetId: budget._id,
    type: finding.type,
    severity: finding.severity,
    message: finding.message,
    timestamp: new Date(),
  });
}

async function runDetectionForBudget(budgetId) {
  const Budget = require("../models/Budget");
  const Expenditure = require("../models/Expenditure");
  const Alert = require("../models/Alert");
  const budget = await Budget.findById(budgetId);
  if (!budget) return { created: 0 };
  const expenditures = await Expenditure.find({ budgetId: budget._id }).lean();
  const config = await ThresholdConfig.getConfig();
  const result = detectAnomalies({ budget, expenditures, config });
  let created = 0;
  for (const finding of result.findings) {
    const before = await Alert.findOne({ budgetId: budget._id, type: finding.type, resolved: false });
    const doc = await upsertAlert(Alert, budget, finding);
    if (!before) created += 1;
    void doc;
  }
  return { ...result, created };
}

async function runDetectionAll() {
  const Budget = require("../models/Budget");
  const budgets = await Budget.find({ status: "Active" });
  const summary = { budgetsScanned: budgets.length, alertsCreated: 0, details: [] };
  for (const budget of budgets) {
    const result = await runDetectionForBudget(budget._id);
    summary.alertsCreated += result.created || 0;
    summary.details.push({
      budgetId: budget._id,
      scheme: budget.scheme,
      created: result.created,
      findings: result.findings,
    });
  }
  return summary;
}

module.exports = {
  calculateUtilizationPct,
  calculateTimeElapsedPct,
  evaluateUnderUtilization,
  evaluateOverspending,
  evaluateSpike,
  evaluatePaceDeviation,
  detectAnomalies,
  runDetectionForBudget,
  runDetectionAll,
};
