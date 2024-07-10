const Message = require("../models/messageModel");
const mongoose = require("mongoose");
const User = require("../models/userModel");
const {
  sendResponse,
  parsePaginationParams,
  generateMeta,
} = require("../helperUtils/responseUtil");

// Fetch the first message from each conversation along with users list
const getFirstMessagesWithUsersList = async (req, res) => {
  const { _id } = req.user; // Current user's ID
  const { page, limit } = parsePaginationParams(req);

  try {
    // Aggregate to find the first message from each conversation
    const firstMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: _id },
            { receiverId: _id },
          ],
        },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ['$senderId', _id] },
              then: '$receiverId',
              else: '$senderId',
            },
          },
          firstMessage: { $first: '$$ROOT' }, // Get the first message in each group
        },
      },
      {
        $replaceRoot: { newRoot: '$firstMessage' }, // Replace root with the first message
      },
      {
        $sort: { createdAt: -1 }, // Sort by createdAt descending (latest message first)
      },
      {
        $skip: (page - 1) * limit, // Skip records based on pagination
      },
      {
        $limit: limit, // Limit records based on pagination
      },
    ]);

    // Fetch details of users involved in these conversations
    const userIds = firstMessages.map(message => message.senderId.equals(_id) ? message.receiverId : message.senderId);
    const userQueryPromise = User.find({ _id: { $in: userIds } }).lean(); // Use lean() for performance if you're not modifying user objects

    // Calculate total count for pagination meta
    const totalMessagesQuery = Message.distinct('senderId', {
      $or: [
        { senderId: _id },
        { receiverId: _id },
      ],
    });

    // Execute promises concurrently using Promise.all
    const [users, totalMessages] = await Promise.all([
      userQueryPromise,
      totalMessagesQuery,
    ]);

    // Prepare response data with first messages and user details
    const responseData = firstMessages.map(message => {
      const otherUser = users.find(user => user._id.equals(message.senderId.equals(_id) ? message.receiverId : message.senderId));
      return {
        message,
        otherUser: otherUser ? {
          _id: otherUser._id,
          username: otherUser.username,
          // Include other relevant user details as needed
        } : null,
      };
    });

    // Calculate total pages for pagination meta
    const totalPages = Math.ceil(totalMessages.length / limit);
    const meta = generateMeta(page, limit, totalMessages.length, totalPages);

    return sendResponse(res, 200, 'Chats fetched successfully', responseData, meta);
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};


// Get a single message
const getMessage = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    sendResponse(res, 404, "No such message");
  }
  const message = await Message.findById(id);
  if (!message) {
    sendResponse(res, 404, "No such message");
  }
  sendResponse(res, 200, "Message fetched successfully", message);
};

// Create a new message
const createMessage = async (req, res) => {
  const {
    senderId,
    receiverId,
    messageType,
    messageContent,
    mediaUrl,
    status,
  } = req.body;
  try {
    const message = await Message.create({
      senderId,
      receiverId,
      messageType,
      messageContent,
      mediaUrl,
    });
    return res.status(200).json(message);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such message" });
  }
  const message = await Message.findByIdAndDelete(id);
  if (!message) {
    return res.status(404).json({ error: "No such message" });
  }
  return res.status(200).json(message);
};

// Update a message
const updateMessage = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such message" });
  }
  const { messageType, messageContent, mediaUrl, status } = req.body;

  const message = await Message.findByIdAndUpdate(
    { _id: id },
    {
      messageType,
      messageContent,
      mediaUrl,
      status,
    },
    { new: true }
  );
  if (!message) {
    return res.status(404).json({ error: "No such message" });
  }
  return res.status(200).json(message);
};

// Get messages between current user and another user
const getUserMessages = async (req, res) => {
  const { _id } = req.user;
  const { otherUserId } = req.params;
  const { page, limit } = parsePaginationParams(req);

  if (
    !mongoose.Types.ObjectId.isValid(_id) ||
    !mongoose.Types.ObjectId.isValid(otherUserId) ||
    _id === otherUserId
  ) {
    return sendResponse(res, 400, "Invalid user ID");
  }
  try {
    const query = {
      $or: [
        { senderId: _id, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: _id },
      ],
    };

  // Execute operations concurrently using Promise.all
  const [messages, totalMessages, otherUser] = await Promise.all([
    Message.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Message.countDocuments(query),
    User.findById(otherUserId),
  ]);

    const totalPages = Math.ceil(totalMessages / limit);
    const meta = generateMeta(page, limit, totalMessages, totalPages);

     // Prepare response including messages and other user details
     const responseData = {
      messages,
      otherUser: otherUser ? {
        _id: otherUser._id,
        username: otherUser.username,
        // Include other relevant user details as needed
      } : null,
    };

    return sendResponse(
      res,
      200,
      "Messages fetched successfully",
      responseData,
      meta
    );
  } catch (error) {
    return sendResponse(res, 500, error.message);
  }
};

module.exports = {
  createMessage,
  getFirstMessagesWithUsersList,
  getMessage,
  deleteMessage,
  updateMessage,
  getUserMessages,
};
