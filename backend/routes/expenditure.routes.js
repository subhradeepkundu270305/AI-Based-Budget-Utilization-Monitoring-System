const express = require("express");
const { param } = require("express-validator");
const { requireAuth } = require("../middleware/auth");
const { handleValidation } = require("../middleware/validate");
const { createUploader } = require("../middleware/upload");
const {
  expenditureController,
  createValidators,
  listValidators,
} = require("../controllers/expenditureController");

function createExpenditureRouter(env) {
  const router = express.Router();
  const upload = createUploader(env);
  router.use(requireAuth(env));
  router.get("/", listValidators, expenditureController.list);
  router.get("/:id", param("id").isMongoId(), handleValidation, expenditureController.get);
  router.post("/", createValidators, expenditureController.create);
  router.post(
    "/:id/document",
    param("id").isMongoId(),
    handleValidation,
    upload.single("file"),
    expenditureController.upload
  );
  return router;
}

module.exports = { createExpenditureRouter };
