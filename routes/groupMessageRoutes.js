const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createGroupMessage,
  getGroupMessages,
} = require('../controllers/groupMessageController');

// POST a new group message
router.post('/:groupId', auth, createGroupMessage);

// GET group messages by groupId
router.get('/chat/:groupId', auth, getGroupMessages);

module.exports = router;
