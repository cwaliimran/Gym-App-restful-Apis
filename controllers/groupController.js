const Group = require("../models/groupModel");
const mongoose = require("mongoose");
const { sendResponse } = require("../helperUtils/responseUtil");

// Create a new group message
const createGroup = async (req, res) => {
  const creatorId = req.user._id;
  const { title, description, image } = req.body;

  try {
    const group = await Group.create({
      creatorId,
      title,
      description,
      image,
    });

    return sendResponse(res, 200, "Group created successfully", group);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};



module.exports = {
  createGroup,
};
