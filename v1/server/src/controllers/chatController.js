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
        select: "content sender timestamp attachment fileType fileName",
        populate: { path: "sender", select: "name" },
      })
      .sort({ updatedAt: -1 });

    // 🔹 Fetch all messages for each chat
    const chatsWithMessages = await Promise.all(
      chats.map(async (chat) => {
        const friend = chat.participants.find(p => p._id.toString() !== userId);

        // ✅ Fetch all messages for the chat
        const messages = await Message.find({ chat: chat._id })
          .sort({ timestamp: 1 }) // Ensure oldest messages come first
          .select("content sender timestamp attachment fileType fileName")
          .populate("sender", "name");

        // ✅ Format messages correctly
        const formattedMessages = messages.map((msg) => ({
          messageId: msg._id,
          content: msg.attachment ? "" : msg.content, // Empty content if file exists
          sender: msg.sender.name,
          timestamp: msg.timestamp,
          attachment: msg.attachment || null,
          fileType: msg.fileType || null,
          fileName: msg.fileName || null,
        }));

        // console.log(formattedMessages);

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
                content: chat.lastMessage.attachment ? "📎 Attachment" : chat.lastMessage.content,
                sender: chat.lastMessage.sender.name,
                timestamp: chat.lastMessage.timestamp,
                attachment: chat.lastMessage.attachment || null,
                fileType: chat.lastMessage.fileType || null,
                fileName: chat.lastMessage.fileName || null,
              }
            : { content: "No messages yet", sender: null, timestamp: null },
          messages: formattedMessages, // 🔹 Include all messages in the response
          updatedAt: chat.updatedAt,
        };
      })
    );

    

    res.json(chatsWithMessages);
  } catch (error) {
    console.error("❌ Error fetching chats:", error);
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