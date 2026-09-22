const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/roleGuard");
const {
  reportController,
  adminController,
  summaryValidators,
  exportValidators,
  thresholdValidators,
} = require("../controllers/reportController");
const { parsePagination } = require("../utils/pagination");
const { query } = require("express-validator");
const { handleValidation } = require("../middleware/validate");

function createReportRouter(env) {
  const router = express.Router();
  router.use(requireAuth(env));
  router.get("/dashboard", reportController.dashboard);
  router.get("/departments", summaryValidators, reportController.summaries);
  router.get("/export/csv", exportValidators, reportController.exportCsv);
  router.get("/export/pdf", exportValidators, reportController.exportPdf);
  return router;
}

function createAdminRouter(env) {
  const router = express.Router();
  router.use(requireAuth(env), requireRole(["Admin"]));
  router.get("/thresholds", adminController.getThresholds);
  router.patch("/thresholds", thresholdValidators, adminController.updateThresholds);
  router.get(
    "/audit-logs",
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 100 }),
    handleValidation,
    adminController.auditLogs
  );
  return router;
}

module.exports = { createReportRouter, createAdminRouter, parsePagination };
