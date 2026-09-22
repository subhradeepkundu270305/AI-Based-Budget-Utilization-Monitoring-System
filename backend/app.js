const path = require("path");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const { loadEnv } = require("./config/env");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const { createAuthRouter } = require("./routes/auth.routes");
const { createUserRouter } = require("./routes/user.routes");
const { createDepartmentRouter } = require("./routes/department.routes");
const { createBudgetRouter } = require("./routes/budget.routes");
const { createExpenditureRouter } = require("./routes/expenditure.routes");
const { createAlertRouter, createMonitoringRouter } = require("./routes/alert.routes");
const { createReportRouter, createAdminRouter } = require("./routes/report.routes");
const { createChatRouter } = require("./routes/chat.routes");

function createApp(env = loadEnv()) {
  const app = express();
  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(
    cors({
      origin: env.frontendOrigin ? [env.frontendOrigin, "http://localhost:4200"] : true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());
  app.use("/uploads", express.static(path.resolve(process.cwd(), env.uploadDir)));

  app.get("/api/health", (_req, res) => res.json({ ok: true, timestamp: new Date().toISOString() }));
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

  // Serve static Angular SPA client if built
  const clientDist = path.resolve(__dirname, "../frontend/dist/frontend/browser");
  if (fs.existsSync(clientDist)) {
    app.use(express.static(clientDist));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) return next();
      res.sendFile(path.join(clientDist, "index.html"));
    });
  }

  app.use(notFound);
  app.use(errorHandler(env));

  return app;
}

module.exports = { createApp };
