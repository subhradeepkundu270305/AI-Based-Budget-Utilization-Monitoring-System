function errorHandler(env) {
  return function errorHandlerMiddleware(err, _req, res, _next) {
    const status = err.status || err.statusCode || 500;
    const isProd = env.isProd;
    if (status >= 500) {
      console.error(err);
    }
    const payload = {
      error: status === 500 && isProd ? "Internal server error" : err.message || "Request failed",
    };
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ error: "File too large. Maximum size is 5 MB." });
    }
    return res.status(status).json(payload);
  };
}

function notFound(_req, res) {
  res.status(404).json({ error: "Route not found" });
}

module.exports = { errorHandler, notFound };
