const { body, param, query } = require("express-validator");
const Expenditure = require("../models/Expenditure");
const Budget = require("../models/Budget");
const { HttpError } = require("../utils/httpError");
const { writeAudit, lean } = require("../utils/audit");
const { parsePagination, paginated } = require("../utils/pagination");
const { handleValidation } = require("../middleware/validate");
const { departmentScope } = require("../middleware/roleGuard");
const { runDetectionForBudget } = require("../services/anomalyEngine");

const createValidators = [
  body("budgetId").isMongoId().withMessage("Budget is required"),
  body("amountSpent").isFloat({ min: 0.01 }).withMessage("Amount must be greater than 0"),
  body("category").trim().isLength({ min: 2, max: 120 }).withMessage("Category is required"),
  body("date").isISO8601().toDate(),
  body("description").trim().isLength({ min: 3, max: 1000 }).withMessage("Description is required"),
  handleValidation,
];

const listValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("budgetId").optional().isMongoId(),
  query("department").optional().isMongoId(),
  query("from").optional().isISO8601(),
  query("to").optional().isISO8601(),
  handleValidation,
];

async function assertBudgetAccess(budgetId, user) {
  const budget = await Budget.findById(budgetId);
  if (!budget) throw new HttpError(400, "Budget not found");
  const scope = departmentScope(user);
  if (scope && String(budget.department) !== String(scope)) {
    throw new HttpError(403, "You can only record expenditure for your department");
  }
  if (budget.status === "Closed" && user.role === "DepartmentHead") {
    throw new HttpError(400, "Cannot record expenditure against a closed budget");
  }
  return budget;
}

const expenditureController = {
  list: async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const filter = {};
      if (req.query.budgetId) filter.budgetId = req.query.budgetId;
      if (req.query.from || req.query.to) {
        filter.date = {};
        if (req.query.from) filter.date.$gte = new Date(req.query.from);
        if (req.query.to) filter.date.$lte = new Date(req.query.to);
      }

      const scope = departmentScope(req.user);
      if (scope || req.query.department) {
        if (scope && req.query.department && String(scope) !== String(req.query.department)) {
          return res.json(paginated([], 0, page, limit));
        }
        const budgetIds = await Budget.find({
          department: req.query.department || scope,
        }).distinct("_id");
        if (req.query.budgetId) {
          if (!budgetIds.some((id) => String(id) === String(req.query.budgetId))) {
            return res.json(paginated([], 0, page, limit));
          }
        } else {
          filter.budgetId = { $in: budgetIds };
        }
      }

      const [items, total] = await Promise.all([
        Expenditure.find(filter)
          .populate({ path: "budgetId", populate: { path: "department", select: "name code" } })
          .populate("recordedBy", "name email")
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit),
        Expenditure.countDocuments(filter),
      ]);
      res.json(paginated(items, total, page, limit));
    } catch (err) {
      next(err);
    }
  },

  get: async (req, res, next) => {
    try {
      const item = await Expenditure.findById(req.params.id)
        .populate({ path: "budgetId", populate: { path: "department", select: "name code" } })
        .populate("recordedBy", "name email");
      if (!item) throw new HttpError(404, "Expenditure not found");
      const scope = departmentScope(req.user);
      if (scope && String(item.budgetId.department._id || item.budgetId.department) !== String(scope)) {
        throw new HttpError(403, "Access limited to your department");
      }
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const budget = await assertBudgetAccess(req.body.budgetId, req.user);
      const item = await Expenditure.create({
        budgetId: req.body.budgetId,
        amountSpent: req.body.amountSpent,
        category: req.body.category,
        date: req.body.date,
        description: req.body.description,
        supportingDocUrl: req.body.supportingDocUrl || null,
        recordedBy: req.user._id,
      });
      await writeAudit({
        userId: req.user._id,
        action: "expenditure.create",
        targetCollection: "Expenditure",
        targetId: item._id,
        after: lean(item),
      });
      await runDetectionForBudget(budget._id);
      res.status(201).json({ data: item });
    } catch (err) {
      next(err);
    }
  },

  upload: async (req, res, next) => {
    try {
      if (!req.file) throw new HttpError(400, "No file uploaded");
      const item = await Expenditure.findById(req.params.id);
      if (!item) throw new HttpError(404, "Expenditure not found");
      await assertBudgetAccess(item.budgetId, req.user);
      const before = lean(item);
      item.supportingDocUrl = `/uploads/${req.file.filename}`;
      await item.save();
      await writeAudit({
        userId: req.user._id,
        action: "expenditure.upload",
        targetCollection: "Expenditure",
        targetId: item._id,
        before,
        after: lean(item),
      });
      res.json({ data: item });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { expenditureController, createValidators, listValidators };
