const express = require("express");
const { param } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleGuard");
const { handleValidation } = require("../middleware/validate");
const { userController, createValidators, updateValidators, listValidators } = require("../controllers/userController");

function createUserRouter(env) {
  const router = express.Router();
  const admin = [requireAuth(env), requireRole(["Admin"])];
  router.get("/", ...admin, listValidators, userController.list);
  router.get("/:id", ...admin, param("id").isMongoId(), handleValidation, userController.get);
  router.post("/", ...admin, createValidators, userController.create);
  router.patch("/:id", ...admin, updateValidators, userController.update);
  router.delete("/:id", ...admin, param("id").isMongoId(), handleValidation, userController.remove);
  return router;
}

module.exports = { createUserRouter };
