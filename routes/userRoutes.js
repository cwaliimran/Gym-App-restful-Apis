const express = require("express");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();


router.get("/profile", auth, (req, res) => {
  res.json(req.user);
});

module.exports = router;
