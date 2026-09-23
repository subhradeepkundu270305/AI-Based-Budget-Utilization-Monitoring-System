const { loadEnv } = require("../backend/config/env");
const { connectDb } = require("../backend/config/db");
const { createApp } = require("../backend/app");
const ThresholdConfig = require("../backend/models/ThresholdConfig");

let appInstance = null;
let initPromise = null;

async function initServerless() {
  const env = loadEnv();
  await connectDb(env.mongoUri);
  if (!appInstance) {
    appInstance = createApp(env);
  }
  return appInstance;
}

module.exports = async (req, res) => {
  try {
    if (!initPromise) {
      initPromise = initServerless();
    }
    const app = await initPromise;
    return app(req, res);
  } catch (err) {
    initPromise = null;
    console.error("Vercel Serverless Invocation Error:", err);
    res.status(500).json({
      error: "Internal Server Error",
      message: err.message,
      hint: "Check MONGODB_URI and JWT environment variables in Vercel project settings."
    });
  }
};
