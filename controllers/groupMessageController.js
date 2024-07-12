const GroupMessage = require("../models/groupMessageModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const { populateFields } = require("../helperUtils/queryUtil");

const {
  sendResponse,
  parsePaginationParams,
  generateMeta,
  validateObjectIds,
} = require("../helperUtils/responseUtil");

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
      "Group message",
      groupMessage
    );
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};


//delete a group message
const deleteGroupMessage = async (req, res) => {
    const { groupId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(404).json({ error: "No such message" });
    }
    const message = await GroupMessage.findByIdAndDelete(groupId);
    if (!message) {
      return res.status(404).json({ error: "No such message found" });
    }
    return res.status(200).json(message);
  };

// Get group messages by groupId
const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  const { _id: senderId } = req.user;
  const { page, limit } = parsePaginationParams(req);

  if (!validateObjectIds(res, [groupId, senderId])) return;
  console.time("getGroupMessages");  // Start timing

  try {
    const query = { groupId };
    const fieldsToPopulate = [{ path: "senderId", select: "username", alias: "sender" }];
    const [documents, totalDocuments] = await Promise.all([
      populateFields(GroupMessage, query, fieldsToPopulate, { page, limit }),
      GroupMessage.countDocuments(query),
    ]);

    const meta = generateMeta(page, limit, totalDocuments);
    console.timeEnd("getGroupMessages");  // End timing

    return sendResponse(
      res,
      null,
      "Group messges",
      documents,
      meta
    );
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

module.exports = {
  createGroupMessage,
  getGroupMessages,
  deleteGroupMessage,
};
