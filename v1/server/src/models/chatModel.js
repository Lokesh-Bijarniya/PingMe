import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  unreadCount: { type: Map, of: Number, default: {} },
  chatType: { 
    type: String, 
    enum: ["direct", "group", "community"], 
    required: true 
  },
  community: { type: mongoose.Schema.Types.ObjectId, ref: "Community" } // ✅ Only for community chats
}, { timestamps: true });

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;