const express = require("express");
const rateLimit = require("express-rate-limit");
const { createAuthController, registerValidators, loginValidators } = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");

function optionalAuth(env) {
  return async (req, res, next) => {
    if (!req.headers.authorization) return next();
    return requireAuth(env)(req, res, next);
  };
}

function authLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many authentication attempts. Try again later." },
  });
}

function createAuthRouter(env) {
  const router = express.Router();
  const ctrl = createAuthController(env);
  router.post("/register", authLimiter(), optionalAuth(env), registerValidators(), ctrl.register);
  router.post("/login", authLimiter(), loginValidators(), ctrl.login);
  router.post("/refresh", authLimiter(), ctrl.refresh);
  router.post("/logout", optionalAuth(env), ctrl.logout);
  router.get("/me", requireAuth(env), ctrl.me);
  return router;
}

module.exports = { createAuthRouter };
