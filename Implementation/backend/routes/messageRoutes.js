const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const {
  getConversations,
  getMessages,
  sendMessage,
  getMessageableUsers,
  deleteConversation
} = require("../controller/messageController");

router.get("/conversations", protect, getConversations);
router.get("/users", protect, getMessageableUsers);
router.get("/:otherId", protect, getMessages);
router.post("/send", protect, sendMessage);
router.delete("/conversation/:userId", protect, deleteConversation);

module.exports = router;