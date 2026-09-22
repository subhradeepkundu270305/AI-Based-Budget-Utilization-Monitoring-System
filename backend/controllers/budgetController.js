const { body, param, query } = require("express-validator");
const Budget = require("../models/Budget");
const Department = require("../models/Department");
const { HttpError } = require("../utils/httpError");
const { writeAudit, lean } = require("../utils/audit");
const { parsePagination, paginated } = require("../utils/pagination");
const { handleValidation } = require("../middleware/validate");
const { departmentScope } = require("../middleware/roleGuard");

const createValidators = [
  body("financialYear").trim().matches(/^\d{4}-\d{2}$/).withMessage("financialYear must look like 2026-27"),
  body("department").isMongoId().withMessage("Department is required"),
  body("allocatedAmount").isFloat({ min: 1 }).withMessage("Allocated amount must be greater than 0"),
  body("allocationDate").isISO8601().toDate(),
  body("periodStart").isISO8601().toDate(),
  body("periodEnd").isISO8601().toDate(),
  body("scheme").trim().isLength({ min: 3, max: 240 }).withMessage("Scheme/category name is required"),
  body("status").optional().isIn(["Active", "Closed"]),
  handleValidation,
];

const updateValidators = [
  param("id").isMongoId(),
  body("financialYear").optional().trim().matches(/^\d{4}-\d{2}$/),
  body("department").optional().isMongoId(),
  body("allocatedAmount").optional().isFloat({ min: 1 }),
  body("allocationDate").optional().isISO8601().toDate(),
  body("periodStart").optional().isISO8601().toDate(),
  body("periodEnd").optional().isISO8601().toDate(),
  body("scheme").optional().trim().isLength({ min: 3, max: 240 }),
  body("status").optional().isIn(["Active", "Closed"]),
  handleValidation,
];

const listValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("department").optional().isMongoId(),
  query("financialYear").optional().trim(),
  query("status").optional().isIn(["Active", "Closed"]),
  handleValidation,
];

function applyScope(filter, user) {
  const scope = departmentScope(user);
  if (scope) filter.department = scope;
  return filter;
}

const budgetController = {
  list: async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const filter = applyScope({}, req.user);
      if (req.query.department) {
        if (filter.department && String(filter.department) !== String(req.query.department)) {
          return res.json(paginated([], 0, page, limit));
        }
        filter.department = req.query.department;
      }
      if (req.query.financialYear) filter.financialYear = req.query.financialYear;
      if (req.query.status) filter.status = req.query.status;
      const [items, total] = await Promise.all([
        Budget.find(filter)
          .populate("department", "name code")
          .populate("createdBy", "name email")
          .sort({ allocationDate: -1 })
          .skip(skip)
          .limit(limit),
        Budget.countDocuments(filter),
      ]);
      res.json(paginated(items, total, page, limit));
    } catch (err) {
      next(err);
    }
  },

  get: async (req, res, next) => {
    try {
      const budget = await Budget.findById(req.params.id)
        .populate("department", "name code")
        .populate("createdBy", "name email");
      if (!budget) throw new HttpError(404, "Budget not found");
      const scope = departmentScope(req.user);
      if (scope && String(budget.department._id || budget.department) !== String(scope)) {
        throw new HttpError(403, "Access limited to your department");
      }
      res.json({ data: budget });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const dept = await Department.findById(req.body.department);
      if (!dept) throw new HttpError(400, "Department not found");
      if (new Date(req.body.periodEnd) <= new Date(req.body.periodStart)) {
        throw new HttpError(400, "periodEnd must be after periodStart");
      }
      const budget = await Budget.create({
        financialYear: req.body.financialYear,
        department: req.body.department,
        allocatedAmount: req.body.allocatedAmount,
        allocationDate: req.body.allocationDate,
        periodStart: req.body.periodStart,
        periodEnd: req.body.periodEnd,
        scheme: req.body.scheme,
        status: req.body.status || "Active",
        createdBy: req.user._id,
      });
      await writeAudit({
        userId: req.user._id,
        action: "budget.create",
        targetCollection: "Budget",
        targetId: budget._id,
        after: lean(budget),
      });
      res.status(201).json({ data: budget });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const budget = await Budget.findById(req.params.id);
      if (!budget) throw new HttpError(404, "Budget not found");
      const before = lean(budget);
      const fields = [
        "financialYear",
        "department",
        "allocatedAmount",
        "allocationDate",
        "periodStart",
        "periodEnd",
        "scheme",
        "status",
      ];
      for (const field of fields) {
        if (req.body[field] !== undefined) budget[field] = req.body[field];
      }
      if (budget.periodEnd <= budget.periodStart) {
        throw new HttpError(400, "periodEnd must be after periodStart");
      }
      await budget.save();
      await writeAudit({
        userId: req.user._id,
        action: "budget.update",
        targetCollection: "Budget",
        targetId: budget._id,
        before,
        after: lean(budget),
      });
      res.json({ data: budget });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const budget = await Budget.findById(req.params.id);
      if (!budget) throw new HttpError(404, "Budget not found");
      const before = lean(budget);
      await budget.deleteOne();
      await writeAudit({
        userId: req.user._id,
        action: "budget.delete",
        targetCollection: "Budget",
        targetId: budget._id,
        before,
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { budgetController, createValidators, updateValidators, listValidators };
