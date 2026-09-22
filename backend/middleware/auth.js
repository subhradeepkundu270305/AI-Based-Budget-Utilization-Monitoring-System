const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { HttpError } = require("../utils/httpError");

function requireAuth(env) {
  return async function requireAuthMiddleware(req, _res, next) {
    try {
      const header = req.headers.authorization || "";
      const [, token] = header.split(" ");
      if (!token) {
        throw new HttpError(401, "Authentication required");
      }
      let payload;
      try {
        payload = jwt.verify(token, env.jwtAccessSecret);
      } catch {
        throw new HttpError(401, "Invalid or expired access token");
      }
      const user = await User.findById(payload.sub).populate("departmentId", "name code");
      if (!user || !user.isActive) {
        throw new HttpError(401, "Account is inactive or does not exist");
      }
      req.user = user;
      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requireAuth };
