const express = require("express");
const auth = require("../middlewares/authMiddleware");

const {
  createMessage,
  getFirstMessagesWithUsersList,
  getMessage,
  deleteMessage,
  updateMessage,
  getUserMessages,
} = require("../controllers/messageController");

const router = express.Router();

// Get all messages
router.get("/", auth, getFirstMessagesWithUsersList);

// Get a single message
router.get("/:id", auth, getMessage);

// Create a new message
router.post("/", auth, createMessage);

// Delete a message
router.delete("/:id", auth, deleteMessage);

// Update a message
router.patch("/:id", auth, updateMessage);

// Get messages between current user and another user
router.get("/chat/:otherUserId", auth, getUserMessages);


module.exports = router;
