import mongoose from "mongoose";
import { Schema } from 'mongoose';

const messageSchema = new mongoose.Schema({
  chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: { type: String, required: true },
  attachment: { type :String},
  reactions: [{ userId: mongoose.Schema.Types.ObjectId, reaction: String }],
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read'],
    default: 'sent'
  },
  readBy: [{
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: Date
  }]
});

const Message = mongoose.model("Message", messageSchema);
export default Message;
