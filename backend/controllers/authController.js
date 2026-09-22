const { body } = require("express-validator");
const User = require("../models/User");
const Department = require("../models/Department");
const { HttpError } = require("../utils/httpError");
const { writeAudit } = require("../utils/audit");
const {
  signAccessToken,
  issueRefreshCookie,
  rotateRefreshCookie,
  revokeRefreshCookie,
  hashPassword,
  verifyPassword,
  REFRESH_COOKIE,
} = require("../utils/tokens");
const { handleValidation } = require("../middleware/validate");

function authCookieClear(res, env) {
  return revokeRefreshCookie({ cookies: {} }, res, env);
}

function registerValidators() {
  return [
    body("name").trim().isLength({ min: 2, max: 120 }).withMessage("Name is required"),
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 8, max: 72 }).withMessage("Password must be at least 8 characters"),
    body("role").isIn(["Admin", "FinanceOfficer", "DepartmentHead", "User"]).withMessage("Invalid role"),
    body("departmentId").optional({ nullable: true }).isMongoId().withMessage("Invalid department"),
    handleValidation,
  ];
}

function loginValidators() {
  return [
    body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 1 }).withMessage("Password is required"),
    handleValidation,
  ];
}

async function respondWithSession(res, user, env) {
  const accessToken = signAccessToken(user, env);
  await issueRefreshCookie(res, user, env);
  return res.json({ accessToken, user: user.toSafeJSON() });
}

function createAuthController(env) {
  return {
    register: async (req, res, next) => {
      try {
        const userCount = await User.countDocuments();
        const { name, email, password, role, departmentId } = req.body;

        if (userCount === 0) {
          if (role !== "Admin") {
            throw new HttpError(400, "The first account must be an Admin");
          }
        } else {
          if (!req.user || req.user.role !== "Admin") {
            throw new HttpError(403, "Only an Admin can register new users");
          }
          if (role === "Admin" && req.user.role !== "Admin") {
            throw new HttpError(403, "Cannot assign Admin role");
          }
        }

        if (role === "DepartmentHead" && !departmentId) {
          throw new HttpError(400, "DepartmentHead accounts require a department");
        }
        if (departmentId) {
          const dept = await Department.findById(departmentId);
          if (!dept) throw new HttpError(400, "Department not found");
        }

        const exists = await User.findOne({ email });
        if (exists) throw new HttpError(409, "Email is already registered");

        const user = await User.create({
          name,
          email,
          passwordHash: await hashPassword(password),
          role: userCount === 0 ? "Admin" : role,
          departmentId: role === "DepartmentHead" ? departmentId : departmentId || null,
        });

        if (req.user) {
          await writeAudit({
            userId: req.user._id,
            action: "user.register",
            targetCollection: "User",
            targetId: user._id,
            after: user.toSafeJSON(),
          });
          return res.status(201).json({ user: user.toSafeJSON() });
        }

        await writeAudit({
          userId: user._id,
          action: "user.bootstrap",
          targetCollection: "User",
          targetId: user._id,
          after: user.toSafeJSON(),
        });
        return respondWithSession(res, user, env);
      } catch (err) {
        next(err);
      }
    },

    login: async (req, res, next) => {
      try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+passwordHash");
        if (!user || !(await verifyPassword(password, user.passwordHash))) {
          throw new HttpError(401, "Invalid email or password");
        }
        if (!user.isActive) {
          throw new HttpError(403, "Account is deactivated");
        }
        await writeAudit({
          userId: user._id,
          action: "auth.login",
          targetCollection: "User",
          targetId: user._id,
          after: { email: user.email },
        });
        return respondWithSession(res, user, env);
      } catch (err) {
        next(err);
      }
    },

    refresh: async (req, res, next) => {
      try {
        const raw = req.cookies?.[REFRESH_COOKIE];
        const userId = await rotateRefreshCookie(res, raw, env);
        if (!userId) {
          throw new HttpError(401, "Refresh token is missing or invalid");
        }
        const user = await User.findById(userId);
        if (!user || !user.isActive) {
          throw new HttpError(401, "Account is inactive or does not exist");
        }
        const accessToken = signAccessToken(user, env);
        await issueRefreshCookie(res, user, env);
        return res.json({ accessToken, user: user.toSafeJSON() });
      } catch (err) {
        next(err);
      }
    },

    logout: async (req, res, next) => {
      try {
        await revokeRefreshCookie(req, res, env);
        if (req.user) {
          await writeAudit({
            userId: req.user._id,
            action: "auth.logout",
            targetCollection: "User",
            targetId: req.user._id,
          });
        }
        return res.json({ ok: true });
      } catch (err) {
        next(err);
      }
    },

    me: async (req, res) => {
      res.json({ user: req.user.toSafeJSON() });
    },
  };
}

module.exports = {
  createAuthController,
  registerValidators,
  loginValidators,
  authCookieClear,
};
