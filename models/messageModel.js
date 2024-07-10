const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const messageSchema = new Schema(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User"
    },
    messageType: {
      type: String,
      required: true,
      enum: ["text", "image", "file", "video", "audio", "other"] // You can add more types if needed
    },
    messageContent: {
      type: String,
      required: true
    },
    mediaUrl: {
      type: String,
      default: ""
    },
    status: {
      delivered: {
        type: Boolean,
        default: false
      },
      read: {
        type: Boolean,
        default: false
      },
      readAt: {
        type: Date,
        default: null
      }
    }
  },
  { timestamps: true }
);

// Middleware to update readAt when read is set to true
messageSchema.pre('save', async function (next) {
  if (this.isModified('status.read') && this.status.read === true) {
    this.status.readAt = new Date();
  }
  next();
});


module.exports = mongoose.model("Message", messageSchema);
