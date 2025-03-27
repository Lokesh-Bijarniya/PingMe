import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import Community from "../models/communityModel.js";
import Message from "../models/messageModel.js";
import { fetchChats } from "../utils/chatHandler.js";
import redis from '../config/redis.js';



// ✅ Get or create direct chat 
export const getOrCreateChat = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) return res.status(400).json({ message: "Email required" });

    const recipient = await User.findOne({ email });
    if (!recipient) return res.status(404).json({ message: "User not found" });

    let chat = await Chat.findOne({
      participants: { $all: [userId, recipient._id] },
      chatType: "direct"
    });

    if (!chat) {
      chat = new Chat({
        participants: [userId, recipient._id],
        chatType: "direct"
      });
      await chat.save();
    }

    res.json({
      chatId: chat._id,
      friend: {
        id: recipient._id,
        name: recipient.name,
        email: recipient.email,
        avatar: recipient.avatar,
        online: recipient.online
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all chats (direct + community)
export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    const chats = await fetchChats(userId);
    const updatedChats = chats.map(chat => ({
      ...chat,
      unreadCount: chat.unreadCount
        ? Object.values(chat.unreadCount).reduce((sum, count) => sum + count, 0)
        : 0, // Default to 0 if unreadCount is undefined
    }));
    
    res.json(updatedChats);
  } catch (error) {
    console.error("🔥 Error fetching chats:", error);
    res.status(500).json({ message: error.message });
  }
};




// ✅ Get chat messages
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    // Check if chat exists in Redis
    const cachedMessages = await redis.get(`chat:${chatId}:messages`);
    if (cachedMessages) {
      console.log("✅ Serving messages from Redis cache");
      return res.json(JSON.parse(cachedMessages));
    }

    // If cache miss, fetch from database
    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate("sender", "name avatar");

    const formattedMessages = messages.map(msg => ({
      messageId: msg._id,
      sender: msg.isSystemMessage ? null : { id: msg.sender._id, name: msg.sender.name, avatar: msg.sender.avatar },
      content: msg.content,
      attachment: msg.attachment,
      timestamp: msg.timestamp,
      isSystem: msg.isSystemMessage,
      fileType: msg.fileType
    }));

    // Store the messages in Redis with expiration time (e.g., 5 minutes)
    await redis.setEx(`chat:${chatId}:messages`, 300, JSON.stringify(formattedMessages));

    res.json(formattedMessages);
  } catch (error) {
    console.error("🔥 Error fetching messages:", error);
    res.status(500).json({ message: error.message });
  }
};


// ✅ Update message status
export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid messageId" });
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.status = status;

    if (status === "read") {
      const alreadyRead = message.readBy.some((r) => r.user.toString() === userId);
      if (!alreadyRead) {
        message.readBy.push({ user: userId, timestamp: new Date() });
      }
    }

    await message.save();

    req.io.to(message.chat.toString()).emit("MESSAGE_STATUS_UPDATE", {
      messageId: message._id,
      status: message.status,
      readBy: message.readBy.map((r) => r.user.toString()),
    });

    res.json({ messageId: message._id, status: message.status });
  } catch (error) {
    console.error("🔥 Error updating message status:", error);
    res.status(500).json({ message: error.message });
  }
};


// ✅ Delete chat (updated for community)
export const deleteDirectChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (chat.chatType !== "direct") {
      return res.status(400).json({ message: "This is not a direct chat" });
    }

    if (!chat.participants.includes(userId)) {
      return res.status(403).json({ message: "Not authorized to delete this chat" });
    }

    // Delete messages & chat
    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    // Notify the other participant
    const io = req.app.locals.io;
    if (io) io.to(chatId).emit("CHAT_DELETED", { chatId });

    res.json({ message: "Direct chat deleted successfully" });
  } catch (error) {
    console.error("🔥 Error deleting direct chat:", error);
    res.status(500).json({ message: error.message });
  }
};
