const { query, body } = require("express-validator");
const Budget = require("../models/Budget");
const Expenditure = require("../models/Expenditure");
const Department = require("../models/Department");
const Alert = require("../models/Alert");
const ThresholdConfig = require("../models/ThresholdConfig");
const AuditLog = require("../models/AuditLog");
const { Parser } = require("json2csv");
const PDFDocument = require("pdfkit");
const { handleValidation } = require("../middleware/validate");
const { departmentScope } = require("../middleware/roleGuard");
const { parsePagination, paginated } = require("../utils/pagination");
const { writeAudit } = require("../utils/audit");
const { calculateUtilizationPct, calculateTimeElapsedPct } = require("../services/anomalyEngine");
const { HttpError } = require("../utils/httpError");

const summaryValidators = [
  query("financialYear").optional().trim(),
  query("department").optional().isMongoId(),
  handleValidation,
];

const exportValidators = [
  query("financialYear").optional().trim(),
  query("department").optional().isMongoId(),
  query("format").optional().isIn(["pdf", "csv"]),
  handleValidation,
];

const thresholdValidators = [
  body("underUtilizationPct").optional().isFloat({ min: 0, max: 100 }),
  body("underUtilizationTimeElapsedPct").optional().isFloat({ min: 0, max: 100 }),
  body("spikeThresholdPct").optional().isFloat({ min: 0, max: 100 }),
  body("paceDeviationPct").optional().isFloat({ min: 0, max: 100 }),
  handleValidation,
];

async function scopedDepartments(user, departmentQuery) {
  const scope = departmentScope(user);
  if (scope) return [scope];
  if (departmentQuery) return [departmentQuery];
  const ids = await Department.find().distinct("_id");
  return ids;
}

async function buildDepartmentSummaries(user, { financialYear, department }) {
  const deptIds = await scopedDepartments(user, department);
  const budgetFilter = { department: { $in: deptIds } };
  if (financialYear) budgetFilter.financialYear = financialYear;
  const budgets = await Budget.find(budgetFilter).populate("department", "name code").lean();
  const budgetIds = budgets.map((b) => b._id);
  const spentAgg = await Expenditure.aggregate([
    { $match: { budgetId: { $in: budgetIds } } },
    { $group: { _id: "$budgetId", spent: { $sum: "$amountSpent" }, count: { $sum: 1 } } },
  ]);
  const spentMap = new Map(spentAgg.map((s) => [String(s._id), s]));

  const byDept = new Map();
  for (const budget of budgets) {
    const deptId = String(budget.department._id);
    if (!byDept.has(deptId)) {
      byDept.set(deptId, {
        departmentId: budget.department._id,
        name: budget.department.name,
        code: budget.department.code,
        allocated: 0,
        spent: 0,
        schemes: 0,
        budgets: [],
      });
    }
    const row = byDept.get(deptId);
    const spent = spentMap.get(String(budget._id))?.spent || 0;
    row.allocated += budget.allocatedAmount;
    row.spent += spent;
    row.schemes += 1;
    row.budgets.push({
      id: budget._id,
      scheme: budget.scheme,
      financialYear: budget.financialYear,
      status: budget.status,
      allocatedAmount: budget.allocatedAmount,
      spent,
      utilizationPct: calculateUtilizationPct(budget.allocatedAmount, spent),
      timeElapsedPct: calculateTimeElapsedPct(budget.periodStart, budget.periodEnd),
    });
  }

  return [...byDept.values()].map((d) => ({
    ...d,
    remaining: d.allocated - d.spent,
    utilizationPct: calculateUtilizationPct(d.allocated, d.spent),
  }));
}

function sendPdf(res, filename, draw) {
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  const doc = new PDFDocument({ margin: 48 });
  doc.pipe(res);
  draw(doc);
  doc.end();
}

const reportController = {
  summaries: async (req, res, next) => {
    try {
      const data = await buildDepartmentSummaries(req.user, req.query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  },

  exportCsv: async (req, res, next) => {
    try {
      const rows = await buildDepartmentSummaries(req.user, req.query);
      const flat = rows.flatMap((d) =>
        d.budgets.map((b) => ({
          department: d.name,
          code: d.code,
          scheme: b.scheme,
          financialYear: b.financialYear,
          status: b.status,
          allocatedAmount: b.allocatedAmount,
          spent: b.spent,
          utilizationPct: b.utilizationPct,
        }))
      );
      const parser = new Parser({
        fields: [
          "department",
          "code",
          "scheme",
          "financialYear",
          "status",
          "allocatedAmount",
          "spent",
          "utilizationPct",
        ],
      });
      const csv = parser.parse(flat.length ? flat : [{ department: "" }]);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", "attachment; filename=budget-report.csv");
      res.send(csv);
    } catch (err) {
      next(err);
    }
  },

  exportPdf: async (req, res, next) => {
    try {
      const rows = await buildDepartmentSummaries(req.user, req.query);
      sendPdf(res, "budget-report.pdf", (doc) => {
        doc.fontSize(16).text("Budget Utilization Report", { align: "left" });
        doc.moveDown(0.3);
        doc.fontSize(9).fillColor("#444").text(`Generated ${new Date().toISOString()}`);
        doc.moveDown();
        rows.forEach((d) => {
          doc.fillColor("#000").fontSize(12).text(`${d.name} (${d.code})`);
          doc.fontSize(9).text(
            `Allocated ₹${d.allocated.toLocaleString("en-IN")}  |  Spent ₹${d.spent.toLocaleString("en-IN")}  |  Utilization ${d.utilizationPct}%`
          );
          d.budgets.forEach((b) => {
            doc.text(`  • ${b.scheme} [${b.financialYear}]: ${b.utilizationPct}% of ₹${b.allocatedAmount.toLocaleString("en-IN")}`);
          });
          doc.moveDown(0.6);
        });
        if (!rows.length) doc.text("No records for the selected filters.");
      });
    } catch (err) {
      next(err);
    }
  },

  dashboard: async (req, res, next) => {
    try {
      const summaries = await buildDepartmentSummaries(req.user, req.query);
      const allocated = summaries.reduce((s, d) => s + d.allocated, 0);
      const spent = summaries.reduce((s, d) => s + d.spent, 0);
      const alertFilter = { resolved: false };
      const scope = departmentScope(req.user);
      if (scope) alertFilter.departmentId = scope;
      const openAlerts = await Alert.countDocuments(alertFilter);
      const alertsByType = await Alert.aggregate([
        { $match: alertFilter },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]);

      const trendMatch = {};
      if (scope) {
        const ids = await Budget.find({ department: scope }).distinct("_id");
        trendMatch.budgetId = { $in: ids };
      }
      const trend = await Expenditure.aggregate([
        { $match: trendMatch },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
            spent: { $sum: "$amountSpent" },
          },
        },
        { $sort: { _id: 1 } },
        { $limit: 24 },
      ]);

      const categoryAggMatch = { ...trendMatch };
      const byCategory = await Expenditure.aggregate([
        { $match: categoryAggMatch },
        { $group: { _id: "$category", spent: { $sum: "$amountSpent" } } },
        { $sort: { spent: -1 } },
        { $limit: 8 },
      ]);

      res.json({
        kpis: {
          allocated,
          spent,
          remaining: allocated - spent,
          utilizationPct: calculateUtilizationPct(allocated, spent),
          openAlerts,
          departments: summaries.length,
        },
        byDepartment: summaries.map((d) => ({
          name: d.name,
          code: d.code,
          allocated: d.allocated,
          spent: d.spent,
          utilizationPct: d.utilizationPct,
        })),
        byCategory,
        spendTrend: trend.map((t) => ({ month: t._id, spent: t.spent })),
        alertsByType,
      });
    } catch (err) {
      next(err);
    }
  },
};

const adminController = {
  getThresholds: async (_req, res, next) => {
    try {
      const config = await ThresholdConfig.getConfig();
      res.json({ data: config });
    } catch (err) {
      next(err);
    }
  },

  updateThresholds: async (req, res, next) => {
    try {
      const config = await ThresholdConfig.getConfig();
      const before = config.toObject();
      const fields = [
        "underUtilizationPct",
        "underUtilizationTimeElapsedPct",
        "spikeThresholdPct",
        "paceDeviationPct",
      ];
      for (const field of fields) {
        if (req.body[field] !== undefined) config[field] = req.body[field];
      }
      await config.save();
      await writeAudit({
        userId: req.user._id,
        action: "threshold.update",
        targetCollection: "ThresholdConfig",
        targetId: config._id,
        before,
        after: config.toObject(),
      });
      res.json({ data: config });
    } catch (err) {
      next(err);
    }
  },

  auditLogs: async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const filter = {};
      if (req.query.action) filter.action = req.query.action;
      if (req.query.targetCollection) filter.targetCollection = req.query.targetCollection;
      const [items, total] = await Promise.all([
        AuditLog.find(filter).populate("userId", "name email role").sort({ timestamp: -1 }).skip(skip).limit(limit),
        AuditLog.countDocuments(filter),
      ]);
      res.json(paginated(items, total, page, limit));
    } catch (err) {
      next(err);
    }
  },
};

module.exports = {
  reportController,
  adminController,
  summaryValidators,
  exportValidators,
  thresholdValidators,
};
