const User = require("../models/userModel");
const mongoose = require("mongoose");
const sendResponse = require("../helperUtils/responseUtil");

//get all workouts

const allUsers = async (req, res) => {
  const data = await User.find({}).sort({ createdAt: -1 });
  sendResponse(res, 200, "Suggested friends", data)
};


module.exports = {
  allUsers,
};
