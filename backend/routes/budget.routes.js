const express = require("express");
const { param } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleGuard");
const { handleValidation } = require("../middleware/validate");
const {
  budgetController,
  createValidators,
  updateValidators,
  listValidators,
} = require("../controllers/budgetController");

function createBudgetRouter(env) {
  const router = express.Router();
  router.use(requireAuth(env));
  router.get("/", listValidators, budgetController.list);
  router.get("/:id", param("id").isMongoId(), handleValidation, budgetController.get);
  router.post("/", requireRole(["Admin", "FinanceOfficer"]), createValidators, budgetController.create);
  router.patch("/:id", requireRole(["Admin", "FinanceOfficer"]), updateValidators, budgetController.update);
  router.delete("/:id", requireRole(["Admin", "FinanceOfficer"]), param("id").isMongoId(), handleValidation, budgetController.remove);
  return router;
}

module.exports = { createBudgetRouter };
