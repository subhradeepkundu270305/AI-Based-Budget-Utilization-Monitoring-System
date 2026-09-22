const { HttpError } = require("../utils/httpError");

function requireRole(roles) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return function requireRoleMiddleware(req, _res, next) {
    if (!req.user) {
      return next(new HttpError(401, "Authentication required"));
    }
    if (!allowed.includes(req.user.role)) {
      return next(new HttpError(403, "You do not have permission to perform this action"));
    }
    return next();
  };
}

function departmentScope(user) {
  if (user.role === "DepartmentHead") {
    return user.departmentId?._id || user.departmentId;
  }
  return null;
}

module.exports = { requireRole, departmentScope };
