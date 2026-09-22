const required = [
  "MONGODB_URI",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "FRONTEND_ORIGIN",
];

function loadEnv() {
  const missing = required.filter((key) => !process.env[key] || !String(process.env[key]).trim());
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }

  if (process.env.JWT_ACCESS_SECRET.length < 32 || process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error("JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be at least 32 characters");
  }

  return {
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGODB_URI,
    jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
    jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || "15m",
    jwtRefreshExpires: process.env.JWT_REFRESH_EXPIRES || "7d",
    frontendOrigin: process.env.FRONTEND_ORIGIN,
    cookieSecure: process.env.COOKIE_SECURE === "true",
    cookieSameSite: process.env.COOKIE_SAMESITE || (process.env.COOKIE_SECURE === "true" ? "none" : "lax"),
    uploadDir: process.env.UPLOAD_DIR || "uploads",
    cronEnabled: process.env.CRON_ENABLED !== "false",
    isProd: (process.env.NODE_ENV || "development") === "production",
  };
}

module.exports = { loadEnv };
