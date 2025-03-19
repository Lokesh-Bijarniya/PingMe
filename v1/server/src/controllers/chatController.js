// import Chat from "../models/chatModel.js";
// import User from "../models/userModel.js";
// import Message from "../models/messageModel.js";

// // ✅ Start or get a chat (direct messaging)
// export const getOrCreateChat = async (req, res) => {
//   try {
//     const { email } = req.body;
//     const userId = req.user.id;

//     if (!email) return res.status(400).json({ message: "Email is required" });

//     // Find recipient user
//     const recipient = await User.findOne({ email });
//     if (!recipient) return res.status(404).json({ message: "User not found" });

//     // Check if chat already exists
//     let chat = await Chat.findOne({
//       participants: { $all: [userId, recipient._id] },
//     });

//     if (!chat) {
//       // Create new chat
//       chat = new Chat({
//         participants: [userId, recipient._id],
//       });
//       await chat.save();
//     }

//     res.status(200).json({
//       chatId: chat._id,
//       friend: { // Use "friend" instead of "recipient"
//         id: recipient._id,
//         name: recipient.name,
//         email: recipient.email,
//         avatar: recipient.avatar,
//       },
//       message: "Chat is ready",
//     });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // ✅ Get all user chats
// export const getChats = async (req, res) => {
//   // console.log("🔹 Fetching chats...");
//   try {
//     if (!req.user) {
//       return res.status(401).json({ message: "User not authenticated" });
//     }

//     const userId = req.user.id;
//     // console.log("userId", userId);

//     const chats = await Chat.find({ participants: userId })
//       .populate("participants", "name email avatar online")
//       .populate({
//         path: "lastMessage",
//         select: "content sender timestamp attachment fileType fileName",
//         populate: { path: "sender", select: "name" },
//       })
//       .sort({ updatedAt: -1 });

//     // 🔹 Fetch all messages for each chat
//     const chatsWithMessages = await Promise.all(
//       chats.map(async (chat) => {
//         if (!chat.participants || chat.participants.length < 2) {
//           // console.error(`Invalid chat data: ${chat._id}`, chat);
//           return null; // Skip processing this chat
//         }
    
//         const friend = chat.participants.find(p => p._id.toString() !== userId.toString());
        
//         if (!friend) {
//           console.error(`No friend found for chat: ${chat._id}`);
//           return null;
//         }
    
//         // ✅ Fetch all messages for the chat
//         const messages = await Message.find({ chat: chat._id })
//           .sort({ timestamp: 1 })
//           .select("content sender timestamp attachment fileType fileName")
//           .populate("sender", "name");
    
//         return {
//           chatId: chat._id,
//           friend: {
//             id: friend._id,
//             name: friend.name,
//             email: friend.email,
//             avatar: friend.avatar,
//             online: friend.online,
//           },
//           lastMessage: chat.lastMessage
//             ? {
//                 content: chat.lastMessage.attachment ? "📎 Attachment" : chat.lastMessage.content,
//                 sender: chat.lastMessage.sender.name,
//                 timestamp: chat.lastMessage.timestamp,
//                 attachment: chat.lastMessage.attachment || null,
//                 fileType: chat.lastMessage.fileType || null,
//                 fileName: chat.lastMessage.fileName || null,
//               }
//             : { content: "No messages yet", sender: null, timestamp: null },
//           messages: messages.map(msg => ({
//             messageId: msg._id,
//             content: msg.attachment ? "" : msg.content,
//             sender: msg.sender.name,
//             timestamp: msg.timestamp,
//             attachment: msg.attachment || null,
//             fileType: msg.fileType || null,
//             fileName: msg.fileName || null,
//           })),
//           updatedAt: chat.updatedAt,
//         };
//       })
//     );
    
//     // Filter out null results
//     res.json(chatsWithMessages.filter(chat => chat !== null));
//   } catch (error) {
//     console.error("❌ Error fetching chats:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



// // controllers/chatController.js
// export const deleteChat = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const userId = req.user.id;

//     // Find the chat and ensure the user is a participant
//     const chat = await Chat.findOne({ _id: chatId, participants: userId });
//     if (!chat) {
//       return res.status(404).json({ message: "Chat not found or you are not authorized" });
//     }

//     // Delete the chat and its associated messages
//     await Message.deleteMany({ chat: chatId });
//     await Chat.findByIdAndDelete(chatId);

//     res.status(200).json({ message: "Chat deleted successfully" });
//   } catch (error) {
//     console.error("🔥 Error deleting chat:", error);
//     res.status(500).json({ message: error.message });
//   }
// };



// controllers/chatController.js
import Chat from "../models/chatModel.js";
import User from "../models/userModel.js";
import Community from "../models/communityModel.js";
import Message from "../models/messageModel.js";


const processLastMessage = (lastMessage) => {
  if (!lastMessage) return null;
  
  return {
    content: lastMessage.attachment ? "📎 Attachment" : lastMessage.content,
    sender: lastMessage.sender?.name || "System",
    timestamp: lastMessage.timestamp,
    attachment: lastMessage.attachment || null,
    fileType: lastMessage.fileType || null,
    isSystem: lastMessage.isSystemMessage || false
  };
};

// Helper function to get unread count
const getUnreadCount = (chat, userId) => {
  return chat.chatType === "direct" 
    ? chat.unreadCount.get(userId) || 0
    : Array.from(chat.unreadCount.values()).reduce((a, b) => a + b, 0);
};

// ✅ Get all chats (direct + community)
export const getChats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const chats = await Chat.find({
      $or: [
        { participants: userId, chatType: "direct" },
        { chatType: "community", "community.members": userId }
      ]
    })
    .populate({
      path: "participants",
      select: "name email avatar online",
      match: { _id: { $ne: userId } }
    })
    .populate({
      path: "community",
      select: "name description avatar members admins"
    })
    .populate({
      path: "lastMessage",
      populate: { 
        path: "sender", 
        select: "name",
        model: "User"
      }
    })
    .sort({ updatedAt: -1 });

    const processedChats = await Promise.all(chats.map(async (chat) => {
      try {
        const unreadCount = getUnreadCount(chat, userId);
        
        if (chat.chatType === "community") {
          const community = await Community.findById(chat.community)
            .populate("members", "_id")
            .populate("admins", "_id");

          return {
            chatId: chat._id,
            type: "community",
            community: {
              id: community._id,
              name: community.name,
              avatar: community.avatar,
              description: community.description,
              membersCount: community.members.length,
              isAdmin: community.admins.some(a => a._id.equals(userId))
            },
            lastMessage: processLastMessage(chat.lastMessage),
            unreadCount,
            updatedAt: chat.updatedAt
          };
        }
        else {
          const friend = chat.participants.find(p => !p._id.equals(userId));
          if (!friend) return null;

          return {
            chatId: chat._id,
            type: "direct",
            friend: {
              id: friend._id,
              name: friend.name,
              email: friend.email,
              avatar: friend.avatar,
              online: friend.online
            },
            lastMessage: processLastMessage(chat.lastMessage),
            unreadCount,
            updatedAt: chat.updatedAt
          };
        }
      } catch (error) {
        console.error("Error processing chat:", error);
        return null;
      }
    }));

    res.json(processedChats.filter(chat => chat !== null));
  } catch (error) {
    console.error("🔥 Error fetching chats:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Get or create direct chat (updated)
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
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete chat (updated for community)
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    // Authorization check
    if (chat.chatType === "direct") {
      if (!chat.participants.includes(userId)) {
        return res.status(403).json({ message: "Not authorized" });
      }
    } else if (chat.chatType === "community") {
      const community = await Community.findOne({ chat: chatId });
      if (!community.admins.includes(userId)) {
        return res.status(403).json({ message: "Admin privileges required" });
      }
    }

    // Delete messages and chat
    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    // Delete community if it's a community chat
    if (chat.chatType === "community") {
      await Community.findOneAndDelete({ chat: chatId });
    }

    // WebSocket notification
    req.io.to(chatId).emit("CHAT_DELETED", { chatId });

    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("🔥 Error deleting chat:", error);
    res.status(500).json({ message: error.message });
  }
};