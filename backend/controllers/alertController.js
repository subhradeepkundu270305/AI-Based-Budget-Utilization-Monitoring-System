const { param, query, body } = require("express-validator");
const Alert = require("../models/Alert");
const { HttpError } = require("../utils/httpError");
const { writeAudit, lean } = require("../utils/audit");
const { parsePagination, paginated } = require("../utils/pagination");
const { handleValidation } = require("../middleware/validate");
const { departmentScope } = require("../middleware/roleGuard");
const { runDetectionAll } = require("../services/anomalyEngine");

const listValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("resolved").optional().isIn(["true", "false"]),
  query("type").optional().isIn(["UnderUtilization", "Overspending", "Spike", "PaceDeviation"]),
  query("severity").optional().isIn(["Low", "Medium", "High"]),
  query("departmentId").optional().isMongoId(),
  handleValidation,
];

const resolveValidators = [param("id").isMongoId(), handleValidation];

const alertController = {
  list: async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const filter = {};
      const scope = departmentScope(req.user);
      if (scope) filter.departmentId = scope;
      if (req.query.departmentId) {
        if (scope && String(scope) !== String(req.query.departmentId)) {
          return res.json(paginated([], 0, page, limit));
        }
        filter.departmentId = req.query.departmentId;
      }
      if (req.query.resolved === "true") filter.resolved = true;
      if (req.query.resolved === "false") filter.resolved = false;
      if (req.query.type) filter.type = req.query.type;
      if (req.query.severity) filter.severity = req.query.severity;
      const [items, total] = await Promise.all([
        Alert.find(filter)
          .populate("departmentId", "name code")
          .populate("budgetId", "scheme financialYear allocatedAmount")
          .populate("resolvedBy", "name email")
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit),
        Alert.countDocuments(filter),
      ]);
      res.json(paginated(items, total, page, limit));
    } catch (err) {
      next(err);
    }
  },

  resolve: async (req, res, next) => {
    try {
      const alert = await Alert.findById(req.params.id);
      if (!alert) throw new HttpError(404, "Alert not found");
      const before = lean(alert);
      alert.resolved = true;
      alert.resolvedBy = req.user._id;
      alert.resolvedAt = new Date();
      await alert.save();
      await writeAudit({
        userId: req.user._id,
        action: "alert.resolve",
        targetCollection: "Alert",
        targetId: alert._id,
        before,
        after: lean(alert),
      });
      res.json({ data: alert });
    } catch (err) {
      next(err);
    }
  },

  run: async (req, res, next) => {
    try {
      const summary = await runDetectionAll();
      await writeAudit({
        userId: req.user._id,
        action: "monitoring.run",
        targetCollection: "Alert",
        after: { budgetsScanned: summary.budgetsScanned, alertsCreated: summary.alertsCreated },
      });
      res.json(summary);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { alertController, listValidators, resolveValidators };
