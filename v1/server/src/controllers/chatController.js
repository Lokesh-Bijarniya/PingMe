import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import Message from "../models/messageModel.js";

// ✅ Start or get a chat (direct messaging)
export const getOrCreateChat = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    if (!email) return res.status(400).json({ message: "Email is required" });

    // Find recipient user
    const recipient = await User.findOne({ email });
    if (!recipient) return res.status(404).json({ message: "User not found" });

    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [userId, recipient._id] },
    });

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [userId, recipient._id],
      });
      await chat.save();
    }

    res.status(200).json({
      chatId: chat._id,
      friend: { // Use "friend" instead of "recipient"
        id: recipient._id,
        name: recipient.name,
        email: recipient.email,
        avatar: recipient.avatar,
      },
      message: "Chat is ready",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get all user chats
export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;

    const chats = await Chat.find({ participants: userId })
      .populate("participants", "name email avatar online")
      .populate({
        path: "lastMessage",
        select: "content sender timestamp",
        populate: { path: "sender", select: "name" },
      })
      .sort({ updatedAt: -1 });

    const chatsWithUnread = await Promise.all(
      chats.map(async (chat) => {
        const friend = chat.participants.find(p => p._id.toString() !== userId);

        // 🔹 Count unread messages where `readBy` array does NOT include current user
        const unreadCount = await Message.countDocuments({
          chat: chat._id,
          "readBy.user": { $ne: userId }, // Not read by current user
        });

        return {
          chatId: chat._id,
          friend: {
            id: friend._id,
            name: friend.name,
            email: friend.email,
            avatar: friend.avatar,
            online: friend.online,
          },
          lastMessage: chat.lastMessage
            ? {
                content: chat.lastMessage.content,
                sender: chat.lastMessage.sender.name,
                timestamp: chat.lastMessage.timestamp,
              }
            : { content: "No messages yet", sender: null, timestamp: null },
          updatedAt: chat.updatedAt,
          unreadCount :unreadCount || 0, // 🔹 Add unread count to response
        };
      })
    );

    res.json(chatsWithUnread);

  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ message: error.message });
  }
};



// controllers/chatController.js
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    // Find the chat and ensure the user is a participant
    const chat = await Chat.findOne({ _id: chatId, participants: userId });
    if (!chat) {
      return res.status(404).json({ message: "Chat not found or you are not authorized" });
    }

    // Delete the chat and its associated messages
    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("🔥 Error deleting chat:", error);
    res.status(500).json({ message: error.message });
  }
};