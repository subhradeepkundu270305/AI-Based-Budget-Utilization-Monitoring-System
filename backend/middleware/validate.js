const { validationResult } = require("express-validator");
const { HttpError } = require("../utils/httpError");

function handleValidation(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = errors
      .array()
      .map((e) => e.msg)
      .join("; ");
    return next(new HttpError(400, message));
  }
  return next();
}

module.exports = { handleValidation };
