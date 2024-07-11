const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const {
  createGroup,
} = require('../controllers/groupController');

// POST a new group message
router.post('/', auth, createGroup);

// GET group messages by groupId
// router.get('/:userId', auth, getUserGroups);

module.exports = router;
