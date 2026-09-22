const { body, param, query } = require("express-validator");
const Department = require("../models/Department");
const User = require("../models/User");
const { HttpError } = require("../utils/httpError");
const { writeAudit, lean } = require("../utils/audit");
const { parsePagination, paginated } = require("../utils/pagination");
const { handleValidation } = require("../middleware/validate");

const createValidators = [
  body("name").trim().isLength({ min: 2, max: 200 }).withMessage("Name is required"),
  body("code").trim().isLength({ min: 2, max: 20 }).withMessage("Code is required"),
  body("headUserId").optional({ nullable: true }).isMongoId(),
  handleValidation,
];

const updateValidators = [
  param("id").isMongoId(),
  body("name").optional().trim().isLength({ min: 2, max: 200 }),
  body("code").optional().trim().isLength({ min: 2, max: 20 }),
  body("headUserId").optional({ nullable: true }).isMongoId(),
  handleValidation,
];

const listValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  handleValidation,
];

const departmentController = {
  list: async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const filter = {};
      const scope = req.user.role === "DepartmentHead" ? req.user.departmentId : null;
      if (scope) filter._id = scope._id || scope;
      const [items, total] = await Promise.all([
        Department.find(filter).populate("headUserId", "name email").sort({ name: 1 }).skip(skip).limit(limit),
        Department.countDocuments(filter),
      ]);
      res.json(paginated(items, total, page, limit));
    } catch (err) {
      next(err);
    }
  },

  get: async (req, res, next) => {
    try {
      const dept = await Department.findById(req.params.id).populate("headUserId", "name email");
      if (!dept) throw new HttpError(404, "Department not found");
      if (req.user.role === "DepartmentHead") {
        const own = String(req.user.departmentId?._id || req.user.departmentId);
        if (String(dept._id) !== own) throw new HttpError(403, "Access limited to your department");
      }
      res.json({ data: dept });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, code, headUserId } = req.body;
      if (await Department.findOne({ code: code.toUpperCase() })) {
        throw new HttpError(409, "Department code already exists");
      }
      if (headUserId) {
        const head = await User.findById(headUserId);
        if (!head) throw new HttpError(400, "Head user not found");
      }
      const dept = await Department.create({
        name,
        code: code.toUpperCase(),
        headUserId: headUserId || null,
      });
      await writeAudit({
        userId: req.user._id,
        action: "department.create",
        targetCollection: "Department",
        targetId: dept._id,
        after: lean(dept),
      });
      res.status(201).json({ data: dept });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const dept = await Department.findById(req.params.id);
      if (!dept) throw new HttpError(404, "Department not found");
      const before = lean(dept);
      if (req.body.name) dept.name = req.body.name;
      if (req.body.code) {
        const clash = await Department.findOne({ code: req.body.code.toUpperCase(), _id: { $ne: dept._id } });
        if (clash) throw new HttpError(409, "Department code already exists");
        dept.code = req.body.code.toUpperCase();
      }
      if (req.body.headUserId !== undefined) {
        if (req.body.headUserId) {
          const head = await User.findById(req.body.headUserId);
          if (!head) throw new HttpError(400, "Head user not found");
        }
        dept.headUserId = req.body.headUserId || null;
      }
      await dept.save();
      await writeAudit({
        userId: req.user._id,
        action: "department.update",
        targetCollection: "Department",
        targetId: dept._id,
        before,
        after: lean(dept),
      });
      res.json({ data: dept });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const dept = await Department.findById(req.params.id);
      if (!dept) throw new HttpError(404, "Department not found");
      const before = lean(dept);
      await dept.deleteOne();
      await writeAudit({
        userId: req.user._id,
        action: "department.delete",
        targetCollection: "Department",
        targetId: dept._id,
        before,
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { departmentController, createValidators, updateValidators, listValidators };
