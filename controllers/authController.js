const User = require("../models/userModel");
const mongoose = require("mongoose");
const sendResponse = require('../helperUtils/sendResponse'); 
//register

const register = async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    const token = user.generateAuthToken();
    sendResponse(res, 201, "Signup success", user)
  }  catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.username === 1) {
      // Duplicate username error
      sendResponse(res, 400, "Username already exists. Please choose a different username.")
    } else {
      // Other validation or server errors
      sendResponse(res, 400, error.message)
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

module.exports = {
  register,
  login,
};
