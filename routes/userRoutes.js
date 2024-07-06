const express = require("express");
const auth = require("../middlewares/authMiddleware");
const { allUsers } = require("../controllers/userController");
const router = express.Router();

router.get("/profile", auth, (req, res) => {
  res.json(req.user);
});

router.get("/allUsers", auth, allUsers);

module.exports = router;
