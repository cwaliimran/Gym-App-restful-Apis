const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const groupMessageSchema = new Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      required: true,
      enum: ["text", "image", "file", "video", "audio", "other"], // You can add more types if needed
    },
    messageContent: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("GroupMessage", groupMessageSchema);
