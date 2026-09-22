const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const { loadEnv } = require("./config/env");
const { connectDb } = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { createAuthRouter } = require("./routes/auth.routes");
const { createUserRouter } = require("./routes/user.routes");
const { createDepartmentRouter } = require("./routes/department.routes");
const { createBudgetRouter } = require("./routes/budget.routes");
const { createExpenditureRouter } = require("./routes/expenditure.routes");
const { createAlertRouter, createMonitoringRouter } = require("./routes/alert.routes");
const { createReportRouter, createAdminRouter } = require("./routes/report.routes");
const { createChatRouter } = require("./routes/chat.routes");
const { runDetectionAll } = require("./services/anomalyEngine");
const ThresholdConfig = require("./models/ThresholdConfig");

async function start() {
  const env = loadEnv();
  await connectDb(env.mongoUri);
  await ThresholdConfig.getConfig();

  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendOrigin,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.uploadDir)));

  app.get("/api/health", (_req, res) => res.json({ ok: true }));
  app.use("/api/auth", createAuthRouter(env));
  app.use("/api/users", createUserRouter(env));
  app.use("/api/departments", createDepartmentRouter(env));
  app.use("/api/budgets", createBudgetRouter(env));
  app.use("/api/expenditures", createExpenditureRouter(env));
  app.use("/api/alerts", createAlertRouter(env));
  app.use("/api/monitoring", createMonitoringRouter(env));
  app.use("/api/reports", createReportRouter(env));
  app.use("/api/admin", createAdminRouter(env));
  app.use("/api/chat", createChatRouter(env));
  app.use(notFound);
  app.use(errorHandler(env));

  if (env.cronEnabled) {
    cron.schedule("0 2 * * *", async () => {
      try {
        const summary = await runDetectionAll();
        console.log("[cron] anomaly scan", summary.budgetsScanned, "budgets,", summary.alertsCreated, "new alerts");
      } catch (err) {
        console.error("[cron] anomaly scan failed", err.message);
      }
    });
  }

  app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message);
  process.exit(1);
});
