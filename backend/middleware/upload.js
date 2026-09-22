const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { HttpError } = require("../utils/httpError");

function createUploader(env) {
  const dest = path.resolve(process.cwd(), env.uploadDir);
  fs.mkdirSync(dest, { recursive: true });

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, dest),
    filename: (_req, file, cb) => {
      const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
      cb(null, `${Date.now()}-${safe}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
      if (!allowed.includes(file.mimetype)) {
        return cb(new HttpError(400, "Only PDF, JPEG, PNG, or WebP files are allowed"));
      }
      return cb(null, true);
    },
  });
}

module.exports = { createUploader };
