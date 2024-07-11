const GroupMessage = require("../models/groupMessageModel");
const mongoose = require("mongoose");
const User = require('../models/userModel');

const { sendResponse, parsePaginationParams, generateMeta, validateObjectIds } = require('../helperUtils/responseUtil');


// Create a new group message
const createGroupMessage = async (req, res) => {
  const senderId = req.user._id;
  const { groupId } = req.params;

  if (!validateObjectIds(res, [senderId, groupId])) return;

  const { messageContent, messageType, mediaUrl } = req.body;

  try {
    const groupMessage = await GroupMessage.create({
      groupId: new mongoose.Types.ObjectId(groupId),
      senderId: senderId,
      messageType,
      messageContent,
      mediaUrl,
    });

    return sendResponse(
      res,
      200,
      "Group message created successfully",
      groupMessage
    );
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

// Get group messages by groupId
const getGroupMessages = async (req, res) => {
    const { groupId } = req.params;
    const { _id: senderId } = req.user;
    const { page, limit } = parsePaginationParams(req);
  
    if (!validateObjectIds(res, [groupId, senderId])) return;
  
    try {
      const query = { groupId };
  
      // Execute operations concurrently using Promise.all
      const [messages, totalMessages] = await Promise.all([
        GroupMessage.find(query)
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .populate('senderId', 'username') // Populate sender details
          .lean(), // Convert Mongoose documents to plain JavaScript objects
        GroupMessage.countDocuments(query)
      ]);
  
      const totalPages = Math.ceil(totalMessages / limit);
      const meta = generateMeta(page, limit, totalMessages, totalPages);
  
      // Prepare response including messages and user details
      const responseData = messages.map(message => ({
        message: {
          ...message,
          senderId: message.senderId._id, // Ensure senderId is just the string representation of the ID
        },
        sender: {
          _id: message.senderId._id,
          username: message.senderId.username,
          // Include other relevant user details as needed
        },
      }));
  
      return sendResponse(
        res,
        200,
        "Group messages fetched successfully",
        responseData,
        meta
      );
    } catch (error) {
      return sendResponse(res, 500, error.message);
    }
  };
  

module.exports = {
  createGroupMessage,
  getGroupMessages,
};
