const { body, param, query } = require("express-validator");
const User = require("../models/User");
const Department = require("../models/Department");
const { HttpError } = require("../utils/httpError");
const { writeAudit, lean } = require("../utils/audit");
const { hashPassword } = require("../utils/tokens");
const { parsePagination, paginated } = require("../utils/pagination");
const { handleValidation } = require("../middleware/validate");

const createValidators = [
  body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8, max: 72 }).withMessage("Password must be at least 8 characters"),
  body("role").isIn(["Admin", "FinanceOfficer", "DepartmentHead", "User"]).withMessage("Invalid role"),
  body("departmentId").optional({ nullable: true }).isMongoId().withMessage("Invalid department"),
  body("isActive").optional().isBoolean().withMessage("isActive must be boolean"),
  handleValidation,
];

const updateValidators = [
  param("id").isMongoId(),
  body("name").optional().trim().isLength({ min: 2, max: 120 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("password").optional().isLength({ min: 8, max: 72 }),
  body("role").optional().isIn(["Admin", "FinanceOfficer", "DepartmentHead", "User"]),
  body("departmentId").optional({ nullable: true }).isMongoId(),
  body("isActive").optional().isBoolean(),
  handleValidation,
];

const listValidators = [
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
  query("role").optional().isIn(["Admin", "FinanceOfficer", "DepartmentHead", "User"]),
  query("departmentId").optional().isMongoId(),
  handleValidation,
];

async function assertDepartment(departmentId) {
  if (!departmentId) return;
  const dept = await Department.findById(departmentId);
  if (!dept) throw new HttpError(400, "Department not found");
}

const userController = {
  list: async (req, res, next) => {
    try {
      const { page, limit, skip } = parsePagination(req.query);
      const filter = {};
      if (req.query.role) filter.role = req.query.role;
      if (req.query.departmentId) filter.departmentId = req.query.departmentId;
      const [items, total] = await Promise.all([
        User.find(filter).populate("departmentId", "name code").sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(filter),
      ]);
      res.json(paginated(items.map((u) => u.toSafeJSON()), total, page, limit));
    } catch (err) {
      next(err);
    }
  },

  get: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).populate("departmentId", "name code");
      if (!user) throw new HttpError(404, "User not found");
      res.json({ data: user.toSafeJSON() });
    } catch (err) {
      next(err);
    }
  },

  create: async (req, res, next) => {
    try {
      const { name, email, password, role, departmentId, isActive } = req.body;
      if (role === "DepartmentHead" && !departmentId) {
        throw new HttpError(400, "DepartmentHead accounts require a department");
      }
      await assertDepartment(departmentId);
      if (await User.findOne({ email })) throw new HttpError(409, "Email is already registered");
      const user = await User.create({
        name,
        email,
        passwordHash: await hashPassword(password),
        role,
        departmentId: departmentId || null,
        isActive: isActive !== false,
      });
      await writeAudit({
        userId: req.user._id,
        action: "user.create",
        targetCollection: "User",
        targetId: user._id,
        after: user.toSafeJSON(),
      });
      res.status(201).json({ data: user.toSafeJSON() });
    } catch (err) {
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id).select("+passwordHash");
      if (!user) throw new HttpError(404, "User not found");
      const before = user.toSafeJSON();
      const { name, email, password, role, departmentId, isActive } = req.body;
      if (email && email !== user.email && (await User.findOne({ email }))) {
        throw new HttpError(409, "Email is already registered");
      }
      if (role === "DepartmentHead" && departmentId === undefined && !user.departmentId) {
        throw new HttpError(400, "DepartmentHead accounts require a department");
      }
      if (departmentId) await assertDepartment(departmentId);
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.passwordHash = await hashPassword(password);
      if (role) user.role = role;
      if (departmentId !== undefined) user.departmentId = departmentId;
      if (typeof isActive === "boolean") user.isActive = isActive;
      await user.save();
      const after = user.toSafeJSON();
      await writeAudit({
        userId: req.user._id,
        action: "user.update",
        targetCollection: "User",
        targetId: user._id,
        before,
        after,
      });
      res.json({ data: after });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) throw new HttpError(404, "User not found");
      if (String(user._id) === String(req.user._id)) {
        throw new HttpError(400, "You cannot delete your own account");
      }
      if (user.role === "Admin") {
        const adminCount = await User.countDocuments({ role: "Admin", isActive: true });
        if (adminCount <= 1) throw new HttpError(400, "Cannot delete the last Admin");
      }
      const before = lean(user);
      await user.deleteOne();
      await writeAudit({
        userId: req.user._id,
        action: "user.delete",
        targetCollection: "User",
        targetId: user._id,
        before,
      });
      res.json({ ok: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = { userController, createValidators, updateValidators, listValidators };
