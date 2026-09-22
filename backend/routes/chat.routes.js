const express = require("express");
const chatController = require("../controllers/chatController");
const { requireAuth } = require("../middleware/auth");
const { loadEnv } = require("../config/env");

function createChatRouter() {
  const router = express.Router();
  const env = loadEnv();
  
  router.post("/", requireAuth(env), chatController.ask);
  
  return router;
}

module.exports = { createChatRouter };
