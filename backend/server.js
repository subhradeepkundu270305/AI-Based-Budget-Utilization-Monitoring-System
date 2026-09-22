const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const cron = require("node-cron");
const { loadEnv } = require("./config/env");
const { connectDb } = require("./config/db");
const { createApp } = require("./app");
const { runDetectionAll } = require("./services/anomalyEngine");
const ThresholdConfig = require("./models/ThresholdConfig");

async function start() {
  const env = loadEnv();
  await connectDb(env.mongoUri);
  await ThresholdConfig.getConfig();

  const app = createApp(env);

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

  return app;
}

if (require.main === module) {
  start().catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
}

module.exports = { start };
