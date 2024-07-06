const User = require("../models/userModel");
const mongoose = require("mongoose");
const sendResponse = require("../helperUtils/sendResponse");
//register

const register = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = user.generateAuthToken();
    sendResponse(res, 201, "Signup success", user);
  } catch (error) {
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.username === 1
    ) {
      // Duplicate username error
      sendResponse(
        res,
        400,
        "Username already exists. Please choose a different username."
      );
    } else {
      // Other validation or server errors
      sendResponse(res, 400, error.message);
    }
  }
};

//login

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findByCredentials(username, password);
    const token = user.generateAuthToken();

    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Generate OTP
const generateOtp = async (req, res) => {
  try {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return sendResponse(res, 404, "User not found");
    }

    const otp = user.generateOtp();
    await user.save();

    sendResponse(res, 200, "OTP generated successfully", { otp }); // In a real app, don't send OTP in response
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;
    const user = await User.findOne({
      username,
      otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return sendResponse(res, 400, "Invalid or expired OTP");
    }

    sendResponse(res, 200, "OTP verified successfully");
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return sendResponse(res, 400, "Account not found");
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    sendResponse(res, 200, "Password has been reset");
  } catch (error) {
    sendResponse(res, 500, error.message);
  }
};

module.exports = {
  register,
  login,
  generateOtp,
  verifyOtp,
  resetPassword,
};
