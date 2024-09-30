const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const {sendResponse} = require("../helperUtils/responseUtil");


const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      sendResponse(res, 401, "Authorization header missing");
    }

    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      sendResponse(res, 401, "Authorization Token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = null;
    if (process.env.NODE_ENV === "dev") {
      user = { _id: decoded._id, username: "Dev user" };
    } else {
      user = await User.findOne({ _id: decoded._id });
    }
    if (!user) {
      sendResponse(res, 401, "User not found");
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    sendResponse(res, 401, "Invalid Authorization token");
  }
};

module.exports = auth;
