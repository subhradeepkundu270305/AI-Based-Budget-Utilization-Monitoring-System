const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const RefreshToken = require("../models/RefreshToken");

const REFRESH_COOKIE = "refreshToken";
const SALT_ROUNDS = 12;

function signAccessToken(user, env) {
  return jwt.sign(
    { sub: String(user._id), role: user.role, departmentId: user.departmentId || null },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpires }
  );
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function parseDurationMs(value) {
  const match = String(value).match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(match[1]);
  const map = { s: 1000, m: 60 * 1000, h: 3600 * 1000, d: 86400 * 1000 };
  return n * map[match[2]];
}

function cookieOptions(env) {
  return {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path: "/api/auth",
    maxAge: parseDurationMs(env.jwtRefreshExpires),
  };
}

async function issueRefreshCookie(res, user, env) {
  const raw = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + parseDurationMs(env.jwtRefreshExpires));
  await RefreshToken.create({ userId: user._id, tokenHash, expiresAt });
  res.cookie(REFRESH_COOKIE, raw, cookieOptions(env));
}

async function rotateRefreshCookie(res, incomingRaw, env) {
  if (!incomingRaw) return null;
  const tokenHash = hashToken(incomingRaw);
  const stored = await RefreshToken.findOne({ tokenHash });
  if (!stored || stored.expiresAt < new Date()) {
    if (stored) await stored.deleteOne();
    return null;
  }
  await stored.deleteOne();
  return stored.userId;
}

async function revokeRefreshCookie(req, res, env) {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (raw) {
    await RefreshToken.deleteOne({ tokenHash: hashToken(raw) });
  }
  res.clearCookie(REFRESH_COOKIE, { ...cookieOptions(env), maxAge: 0 });
}

async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

module.exports = {
  REFRESH_COOKIE,
  SALT_ROUNDS,
  signAccessToken,
  hashToken,
  cookieOptions,
  issueRefreshCookie,
  rotateRefreshCookie,
  revokeRefreshCookie,
  hashPassword,
  verifyPassword,
};
