const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleGuard");
const { alertController, listValidators, resolveValidators } = require("../controllers/alertController");

function createAlertRouter(env) {
  const router = express.Router();
  router.use(requireAuth(env));
  router.get("/", listValidators, alertController.list);
  router.post("/:id/resolve", requireRole(["Admin", "FinanceOfficer"]), resolveValidators, alertController.resolve);
  return router;
}

function createMonitoringRouter(env) {
  const router = express.Router();
  router.post("/run", requireAuth(env), requireRole(["Admin", "FinanceOfficer"]), alertController.run);
  return router;
}

module.exports = { createAlertRouter, createMonitoringRouter };
