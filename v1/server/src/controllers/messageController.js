// controllers/messageController.js
import Message from "../models/messageModel.js";
import Chat from "../models/chatModel.js";
import Community from "../models/communityModel.js";
import User from "../models/userModel.js";
import mongoose from "mongoose";

// // Helper function to process last message
// const processLastMessage = (lastMessage) => {
//   if (!lastMessage) return null;
  
//   return {
//     content: lastMessage.attachment ? "📎 Attachment" : lastMessage.content,
//     sender: lastMessage.sender?.name || "System",
//     timestamp: lastMessage.timestamp,
//     attachment: lastMessage.attachment || null,
//     fileType: lastMessage.fileType || null,
//     isSystem: lastMessage.isSystemMessage || false
//   };
// };

// ✅ Send a message (handles both direct and community chats)
// export const sendMessage = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { content, attachment, recipientEmail, isSystemMessage } = req.body;
//     const userId = req.user.id;

//     let chat;

//     // Find or create chat
//     if (chatId) {
//       chat = await Chat.findById(chatId)
//         .populate("community");
      
//       // Verify chat access
//       if (chat.chatType === "direct") {
//         if (!chat.participants.includes(userId)) {
//           return res.status(403).json({ message: "Not part of this chat" });
//         }
//       } else if (chat.chatType === "community") {
//         const community = await Community.findOne({ chat: chatId });
//         if (!community.members.includes(userId)) {
//           return res.status(403).json({ message: "Not a community member" });
//         }
        
//         // System message validation
//         if (isSystemMessage && !community.admins.includes(userId)) {
//           return res.status(403).json({ message: "Admin privileges required" });
//         }
//       }
//     } else if (recipientEmail) {
//       // Direct chat creation (existing logic)
//       const recipient = await User.findOne({ email: recipientEmail });
//       if (!recipient) return res.status(404).json({ message: "Recipient not found" });

//       chat = await Chat.findOne({
//         participants: { $all: [userId, recipient._id] },
//         chatType: "direct"
//       });

//       if (!chat) {
//         chat = new Chat({
//           participants: [userId, recipient._id],
//           chatType: "direct"
//         });
//         await chat.save();
//       }
//     } else {
//       return res.status(400).json({ message: "Invalid request parameters" });
//     }

//     // Create message
//     const message = new Message({
//       chat: chat._id,
//       sender: chat.chatType === "community" && isSystemMessage ? null : userId,
//       content,
//       attachment,
//       isSystemMessage: chat.chatType === "community" ? isSystemMessage : false,
//       timestamp: new Date(),
//     });

//     await message.save();

//     // Update chat's last message and timestamp
//     chat.lastMessage = message._id;
//     chat.updatedAt = new Date();
    
//     // Update unread counts
//     if (chat.chatType === "direct") {
//       const recipientId = chat.participants.find(p => p.toString() !== userId);
//       chat.unreadCount.set(recipientId, (chat.unreadCount.get(recipientId) || 0) + 1);
//     } else if (chat.chatType === "community") {
//       const community = await Community.findOne({ chat: chat._id });
//       community.members.forEach(member => {
//         if (member.toString() !== userId) {
//           chat.unreadCount.set(member, (chat.unreadCount.get(member) || 0) + 1);
//         }
//       });
//     }
    
//     await chat.save();

//     // Populate sender details if not system message
//     if (!message.isSystemMessage) {
//       await message.populate("sender", "name avatar");
//     }

//     // Prepare response
//     const responseMessage = {
//       messageId: message._id,
//       content: message.content,
//       attachment: message.attachment,
//       timestamp: message.timestamp,
//       isSystem: message.isSystemMessage,
//       fileType: message.fileType
//     };

//     if (!message.isSystemMessage) {
//       responseMessage.sender = {
//         id: message.sender._id,
//         name: message.sender.name,
//         avatar: message.sender.avatar
//       };
//     }

//     // WebSocket broadcast
//     req.io.to(chat._id.toString()).emit("NEW_MESSAGE", {
//       chatId: chat._id,
//       message: responseMessage
//     });

//     res.status(201).json(responseMessage);
//   } catch (error) {
//     console.error("🔥 Error sending message:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// ✅ Get chat messages (updated for community)
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    // Validate chat access
    const chat = await Chat.findById(chatId)
      .populate("community");
    
    if (chat.chatType === "direct" && !chat.participants.includes(userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    
    if (chat.chatType === "community") {
      const community = await Community.findOne({ chat: chatId });
      if (!community.members.includes(userId)) {
        return res.status(403).json({ message: "Not a community member" });
      }
    }

    const messages = await Message.find({ chat: chatId })
      .sort({ timestamp: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate("sender", "name avatar");

    // Reset unread count for this user
    if (chat.unreadCount.get(userId)) {
      chat.unreadCount.set(userId, 0);
      await chat.save();
    }

    res.json(messages.map(msg => ({
      messageId: msg._id,
      sender: msg.isSystemMessage ? null : {
        id: msg.sender._id,
        name: msg.sender.name,
        avatar: msg.sender.avatar
      },
      content: msg.content,
      attachment: msg.attachment,
      timestamp: msg.timestamp,
      isSystem: msg.isSystemMessage,
      fileType: msg.fileType
    })));
  } catch (error) {
    console.error("🔥 Error fetching messages:", error);
    res.status(500).json({ message: error.message });
  }
};





// ✅ Send a message (creates chat if not exists)
// export const sendMessage = async (req, res) => {
//   console.log("📤 Sending message");
//   try {
//     const { chatId } = req.params;
//     const { content, attachment, recipientEmail } = req.body;
//     const userId = req.user.id;

//     let chat;

//     // Find or create chat
//     if (chatId) {
//       chat = await Chat.findOne({ _id: chatId, participants: userId });
//       if (!chat) return res.status(404).json({ message: "Chat not found" });
//     } else if (recipientEmail) {
//       const recipient = await User.findOne({ email: recipientEmail });
//       if (!recipient) return res.status(404).json({ message: "Recipient not found" });

//       chat = await Chat.findOne({
//         participants: { $all: [userId, recipient._id] },
//       });

//       if (!chat) {
//         chat = new Chat({
//           participants: [userId, recipient._id],
//           startedAt: new Date(),
//         });
//         await chat.save();
//       }
//     } else {
//       return res.status(400).json({ message: "Provide either chatId or recipientEmail" });
//     }

//     // Create message
//     const message = new Message({
//       chat: chat._id,
//       sender: userId,
//       content,
//       attachment,
//       timestamp: new Date(),
//     });

//     await message.save();

//     // Update chat's last message and timestamp
//     chat.lastMessage = message._id;
//     chat.updatedAt = new Date();
//     await chat.save();

//     // Populate sender details
//     await message.populate("sender", "name avatar");

//     // Broadcast via WebSocket
//     req.io.to(chat._id.toString()).emit("NEW_MESSAGE", {
//       messageId: message._id, // Ensure this is included
//       content: message.content,
//       attachment: message.attachment,
//       sender: { id: message.sender._id, name: message.sender.name, avatar: message.sender.avatar },
//       timestamp: message.timestamp,
//     });

//     // console.log("Broadcasting NEW_MESSAGE:", {
//     //   messageId: message._id,
//     //   content: message.content,
//     //   attachment: message.attachment,
//     //   sender: { id: message.sender._id, name: message.sender.name, avatar: message.sender.avatar },
//     //   timestamp: message.timestamp,
//     // });

//     res.status(201).json({
//       messageId: message._id, // Ensure this is included
//       content: message.content,
//       attachment: message.attachment,
//       sender: { id: message.sender._id, name: message.sender.name, avatar: message.sender.avatar },
//       timestamp: message.timestamp,
//     });
//   } catch (error) {
//     console.error("🔥 Error sending message:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// ✅ Get chat messages
// export const getMessages = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const { limit = 50, offset = 0 } = req.query;
//     const userId = req.user.id;

//     // Validate chat access
//     const chat = await Chat.findOne({ _id: chatId, participants: userId });
//     if (!chat) return res.status(404).json({ message: "Chat not found" });

//     const messages = await Message.find({ chat: chatId })
//       .sort({ timestamp: -1 })
//       .skip(parseInt(offset))
//       .limit(parseInt(limit))
//       .populate("sender", "name avatar");

//     res.json(messages.map(msg => ({
//       messageId: msg._id,
//       sender: { id: msg.sender._id, name: msg.sender.name, avatar: msg.sender.avatar },
//       content: msg.content,
//       attachment: msg.attachment,
//       timestamp: msg.timestamp,
//     })));

//   } catch (error) {
//     console.error("🔥 Error fetching messages:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// ✅ Update message status
export const updateMessageStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status, userId } = req.body;

    // Validate messageId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid messageId" });
    }

    // Find and update the message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Update status and mark as read
    message.status = status;
    if (status === "read") {
      message.readBy.push({ user: userId, timestamp: new Date() });
    }

    await message.save();

    // Broadcast status update via WebSocket
    req.io.to(message.chat.toString()).emit("MESSAGE_STATUS_UPDATE", {
      messageId: message._id,
      status: message.status,
    });

    res.json(message);
  } catch (error) {
    console.error("🔥 Error updating message status:", error);
    res.status(500).json({ message: error.message });
  }
};




// export const markMessagesAsRead = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const userId = req.user.id; 

//     // Update unread messages in this chat
//     const result = await Message.updateMany(
//       { 
//         chat: chatId, 
//         "readBy.user": { $ne: userId },  // Messages not read by user
//         status: { $ne: "read" } // Only update messages that are not already "read"
//       },
//       { 
//         $push: { readBy: { user: userId, timestamp: new Date() } },
//         $set: { status: "read" }  // Update message status to "read"
//       }
//     );

//     // console.log("res", result);

//     res.json({ message: "Messages marked as read", updatedCount: result.modifiedCount });

//   } catch (error) {
//     console.error("Error marking messages as read:", error);
//     res.status(500).json({ message: "Failed to mark messages as read" });
//   }
// };