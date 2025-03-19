import mongoose from "mongoose";
import { Schema } from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true }, // ✅ Store text OR Base64 file data
  attachment: { type: String }, // ✅ Store file URL (if applicable)
  fileType: { type: String }, // ✅ Store file type (e.g., "image/png")
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  readBy: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date
  }],
  isPinned: { type: Boolean, default: false }, // ✅ Important messages
  isSystemMessage: { type: Boolean, default: false } // ✅ System notifications for community
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
