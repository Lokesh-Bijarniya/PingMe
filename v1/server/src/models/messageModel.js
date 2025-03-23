import mongoose from "mongoose";
import { Schema } from "mongoose";

const messageSchema = new mongoose.Schema({
  chat: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Chat",  // ✅ Direct reference to "Chat" instead of refPath
    required: true 
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  attachment: { type: String },
  fileType: { type: String },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["sent", "delivered", "read"],
    default: "sent",
  },
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  isPinned: { type: Boolean, default: false },
  isSystemMessage: { type: Boolean, default: false }
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
