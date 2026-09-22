const express = require("express");
const { param } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleGuard");
const { handleValidation } = require("../middleware/validate");
const {
  departmentController,
  createValidators,
  updateValidators,
  listValidators,
} = require("../controllers/departmentController");

function createDepartmentRouter(env) {
  const router = express.Router();
  router.use(requireAuth(env));
  router.get("/", listValidators, departmentController.list);
  router.get("/:id", param("id").isMongoId(), handleValidation, departmentController.get);
  router.post("/", requireRole(["Admin"]), createValidators, departmentController.create);
  router.patch("/:id", requireRole(["Admin"]), updateValidators, departmentController.update);
  router.delete("/:id", requireRole(["Admin"]), param("id").isMongoId(), handleValidation, departmentController.remove);
  return router;
}

module.exports = { createDepartmentRouter };
