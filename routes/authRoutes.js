const express = require("express");
const {
  register,
  login,
  generateOtp,
  verifyOtp,
  resetPassword,
} = require("../controllers/authController");

const router = express.Router();

// User auth
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", generateOtp);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
