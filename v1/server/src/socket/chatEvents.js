// import fs from "fs";
// import path from "path";
// import { v2 as cloudinary } from "cloudinary";
// import { fileURLToPath } from "url";
// import sanitize from "sanitize-filename";
// import Chat from "../models/chatModel.js";
// import Message from "../models/messageModel.js";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export const setupChatEvents = (io, connectedUsers) => {
//   io.on("connection", (socket) => {
//     const userId = socket.user.id;
//     console.log(`✅ User connected: ${userId}`);

//     // Store socket ID for the user (supports multiple connections)
//     if (!connectedUsers.has(userId)) {
//       connectedUsers.set(userId, new Set());
//     }
//     connectedUsers.get(userId).add(socket.id);

//     // Emit the full list of online users to everyone
//     const onlineUsers = Array.from(connectedUsers.keys());
//     io.emit("ONLINE_STATUS", { onlineUsers });

//     // Join user-specific room
//     socket.join(userId);

//     // Handle joining a chat room
//     socket.on("JOIN_CHAT", ({ chatId }) => {
//       if (!chatId) {
//         return socket.emit("ERROR", { message: "Invalid chatId" });
//       }

//       socket.join(chatId);
//       console.log(`💬 User ${socket.user.id} joined chat ${chatId}`);
//     });

//     // Handle sending messages
//     socket.on("SEND_MESSAGE", async ({ chatId, content }) => {
//       console.log("Send message");
//       if (!chatId || !content) {
//         return socket.emit("ERROR", { message: "Invalid chatId or content" });
//       }

//       try {
//         // Validate chat existence
//         const chat = await Chat.findById(chatId);
//         if (!chat) {
//           return socket.emit("ERROR", { message: "Chat not found" });
//         }

//         // Create a new message
//         const message = await Message.create({
//           chat: chatId,
//           sender: socket.user.id,
//           content,
//           timestamp: new Date(),
//           status: "sent",
//         });

//         // Update chat's last message
//         await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

//         // Log before emitting
//         console.log(`📩 Emitting NEW_MESSAGE:`, {
//           chatId,
//           message: {
//             messageId: message._id,
//             content: message.content,
//             sender: {
//               id: socket.user.id,
//             },
//             timestamp: message.timestamp,
//           },
//         });

//         // Broadcast the new message
//         io.to(chatId).emit("NEW_MESSAGE", {
//           chatId,
//           message: {
//             messageId: message._id,
//             content: message.content,
//             sender: {
//               id: socket.user.id,
//             },
//             timestamp: message.timestamp,
//           },
//         });
//       } catch (error) {
//         console.error("🔥 Error sending message:", error.message);
//         socket.emit("ERROR", { message: "Failed to send message" });
//       }
//     });

//     // Handle file upload in chunks (streaming)
//     socket.on("UPLOAD_FILE", async ({ chatId, fileName, fileType, chunk, isLastChunk }) => {
//       console.log("Upload file in chunks");
//       try {
//         if (!chatId || !fileName || !fileType || !chunk) {
//           return socket.emit("ERROR", { message: "Invalid file data" });
//         }

//         // Store chunks in memory
//         if (!socket.fileChunks) {
//           socket.fileChunks = {};
//         }
//         if (!socket.fileChunks[chatId]) {
//           socket.fileChunks[chatId] = [];
//         }

//         // Append chunk to memory
//         socket.fileChunks[chatId].push(Buffer.from(chunk, "base64"));

//         if (isLastChunk) {
//           console.log(`✅ Final chunk received for ${fileName}. Uploading to Cloudinary...`);

//           // Combine all chunks into a single file buffer
//           const fileBuffer = Buffer.concat(socket.fileChunks[chatId]);

//           // Create the uploads directory if it doesn't exist
//           const tempDir = path.join(__dirname, "..", "uploads");
//           if (!fs.existsSync(tempDir)) {
//             fs.mkdirSync(tempDir, { recursive: true });
//           }

//           // Sanitize the file name
//           const sanitizedFileName = sanitize(fileName);
//           const tempFilePath = path.join(tempDir, sanitizedFileName);

//           // Save buffer to a temp file
//           fs.writeFileSync(tempFilePath, fileBuffer);

//           // Upload to Cloudinary
//           const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
//             resource_type: "auto",
//             folder: `chat_files/${chatId}`,
//           });

//           console.log("✅ Uploaded to Cloudinary:", cloudinaryResponse.secure_url);

//           // Delete temp file after successful upload
//           fs.unlinkSync(tempFilePath);
//           delete socket.fileChunks[chatId]; // Clear memory buffer

//           // Store in Database
//           const message = await Message.create({
//             chat: chatId,
//             sender: socket.user.id,
//             content: "📎 Attachment",
//             attachment: cloudinaryResponse.secure_url,
//             fileType,
//             timestamp: new Date(),
//             status: "sent",
//           });

//           await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

//           // Notify Chat Participants
//           io.to(chatId).emit("NEW_MESSAGE", {
//             chatId,
//             message: {
//               messageId: message._id,
//               content: "📎 Attachment",
//               attachment: cloudinaryResponse.secure_url,
//               sender: { id: socket.user.id },
//               timestamp: message.timestamp,
//               fileType,
//             },
//           });
//         }

//         console.log("Emitted message");
//       } catch (error) {
//         console.error("🔥 Error uploading file:", error.message);
//         socket.emit("ERROR", { message: "Failed to upload file" });
//       }
//     });

//     // Handle typing indicators
//     socket.on("TYPING", ({ chatId, isTyping }) => {
//       if (!chatId) {
//         return socket.emit("ERROR", { message: "Invalid chatId" });
//       }

//       socket.to(chatId).emit("TYPING_STATUS", { chatId, isTyping });
//     });

//     // Handle marking messages as read
//     socket.on("MARK_AS_READ", async ({ messageId }) => {
//       try {
//         // Validate messageId
//         if (!messageId) {
//           return socket.emit("ERROR", { message: "Invalid messageId" });
//         }

//         // Find and update the message
//         const message = await Message.findByIdAndUpdate(
//           messageId,
//           { $addToSet: { readBy: socket.user.id }, status: "read" },
//           { new: true }
//         );

//         if (!message) {
//           return socket.emit("ERROR", { message: "Message not found" });
//         }

//         // Broadcast the read status to all participants in the chat
//         io.to(message.chat.toString()).emit("MESSAGE_READ", {
//           messageId: message._id,
//           status: "read",
//         });
//       } catch (error) {
//         console.error("🔥 Error marking message as read:", error.message);
//         socket.emit("ERROR", { message: "Failed to mark message as read" });
//       }
//     });

//     // Handle chat deletion
//     socket.on("DELETE_CHAT", async ({ chatId }) => {
//       try {
//         const chat = await Chat.findById(chatId);
//         if (!chat) {
//           return socket.emit("ERROR", { message: "Chat not found" });
//         }

//         // Notify all participants in the chat
//         io.to(chatId).emit("CHAT_DELETED", { chatId });

//         // Delete the chat and its messages
//         await Message.deleteMany({ chat: chatId });
//         await Chat.findByIdAndDelete(chatId);

//         console.log(`✅ Chat ${chatId} deleted`);
//       } catch (error) {
//         console.error("🔥 Error deleting chat via WebSocket:", error);
//         socket.emit("ERROR", { message: "Failed to delete chat" });
//       }
//     });

//     // Handle disconnection
//     socket.on("disconnect", () => {
//       const userSockets = connectedUsers.get(userId);
//       if (userSockets) {
//         userSockets.delete(socket.id);

//         // If no sockets remain for this user, mark them offline
//         if (userSockets.size === 0) {
//           connectedUsers.delete(userId);
//         }
//       }

//       // Broadcast updated list of online users after disconnection
//       const updatedOnlineUsers = Array.from(connectedUsers.keys());
//       io.emit("ONLINE_STATUS", { onlineUsers: updatedOnlineUsers });

//       console.log(`❌ User disconnected: ${userId}`);
//     });
//   });
// };

import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import sanitize from "sanitize-filename";
import Community from "../models/communityModel.js";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupChatEvents = (io, connectedUsers) => {
  io.on("connection", (socket) => {
    const userId = socket.user?.id;
    console.log(`✅ User connected: ${userId}`);

    // Track user connections
    if (userId) {
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId).add(socket.id);
    }

    // Update online status
    const updateOnlineStatus = async () => {
      const onlineUsers = Array.from(connectedUsers.keys());
      io.emit("ONLINE_STATUS", { onlineUsers });

      if (userId) {
        const communities = await Community.find({ members: userId });
        communities.forEach((community) => {
          io.to(community.chat.toString()).emit("MEMBER_PRESENCE", {
            userId,
            online: true,
          });
        });
      }
    };

    updateOnlineStatus();

    // Join initial rooms
    const joinRooms = async () => {
      try {
        if (userId) {
          // Join personal room
          socket.join(userId);

          // Join community chats
          const communities = await Community.find({ members: userId });
          communities.forEach((community) => {
            socket.join(community.chat.toString());
          });
        }
      } catch (error) {
        console.error("Error joining rooms:", error);
      }
    };

    socket.on("JOIN_CHATS", joinRooms);

    // Add this to your server's socket event handlers
socket.on("JOIN_COMMUNITY_ROOM", async (communityId) => {
  try {
    
    const chat = await Chat.findOne({ community: communityId });
    if (!chat) throw new Error("Community chat not found");
    
    // Send last 50 messages via WS
    const initialMessages = await Message.find({ chat: chat._id })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
      
    socket.emit("COMMUNITY_HISTORY", initialMessages.reverse());
    
    // Join room only after validation
    socket.join(communityId);
    
  } catch (error) {
    socket.emit("ERROR", { message: error.message });
  }
});

// Keep LEAVE_COMMUNITY_ROOM handler
socket.on("LEAVE_COMMUNITY_ROOM", (communityId) => {
  socket.leave(communityId);
});

    // Handle joining specific chat
    socket.on("JOIN_CHAT", ({ chatId }) => {
      if (!chatId) return socket.emit("ERROR", { message: "Invalid chatId" });
      socket.join(chatId);
      console.log(`💬 User ${userId} joined chat ${chatId}`);
    });

    socket.on("SEND_MESSAGE", async ({ chatId, content, isSystem = false }) => {
      try {
        const chat = await Chat.findById(chatId).populate(
          "community",
          "admins members chatType"
        );
        if (!chat) return socket.emit("ERROR", { message: "Chat not found" });

        const chatType = chat.chatType || "direct"; // Ensure chatType exists
        console.log(`📩 Chat Type: ${chatType}`);

        // Authorization checks
        if (chatType === "community") {
          const community = await Community.findById(chat.community);
          if (!community.members.some((m) => m.equals(userId))) {
            return socket.emit("ERROR", "Not a community member");
          }
          if (isSystem && !community.admins.some((a) => a.equals(userId))) {
            return socket.emit("ERROR", "Admin privileges required");
          }
        } else {
          if (!chat.participants.some((p) => p.equals(userId))) {
            return socket.emit("ERROR", "Not part of this chat");
          }
        }

        // Create message
        const message = new Message({
          chat: chatId,
          sender: isSystem ? null : userId,
          content,
          isSystemMessage: isSystem,
          timestamp: new Date(),
          status: "sent",
        });

        await message.save();

        // Update chat with lastMessage and unread count
        const updateData = {
          lastMessage: message._id,
          $set: { updatedAt: new Date() },
        };

        if (chatType === "direct") {
          updateData.$inc = {
            [`unreadCount.${chat.participants.find(
              (p) => !p.equals(userId)
            )}`]: 1,
          };
        } else if (chatType === "community") {
          const membersToUpdate = chat.community.members.filter(
            (m) => !m.equals(userId)
          );
          updateData.$inc = membersToUpdate.reduce(
            (acc, member) => ({ ...acc, [`unreadCount.${member}`]: 1 }),
            {}
          );
        }

        const updatedChat = await Chat.findByIdAndUpdate(chatId, updateData, {
          new: true,
          populate: { path: "lastMessage", populate: { path: "sender" } },
        });

        // Prepare response
        const response = {
          message: await Message.findById(message._id)
            .populate("sender", "name avatar")
            .lean(),
          chat: {
            _id: chatId,
            chatType, // ✅ Ensuring chatType is included
            lastMessage: updatedChat.lastMessage,
            unreadCount: updatedChat.unreadCount,
          },
        };

        // In your SEND_MESSAGE handler
        if (chat.chatType === "community") {
          const communityId = chat.community._id.toString();
          // Add community ID to the response
          response.communityId = chat.community._id.toString();
          io.to(communityId).emit("NEW_COMMUNITY_MESSAGE", response);
          // console.log("🟢 NEW_COMMUNITY_MESSAGE emitted successfully:", response);
        } else {
          io.to(chatId).emit("NEW_MESSAGE", response);
        }
      } catch (error) {
        console.error("Message error:", error);
        socket.emit("ERROR", { message: error.message });
      }
    });

    // File upload handler for both chat types
    socket.on(
      "UPLOAD_FILE",
      async ({ chatId, fileName, fileType, chunk, isLastChunk }) => {
        try {
          const chat = await Chat.findById(chatId);
          if (!chat) return socket.emit("ERROR", "Chat not found");

          // Authorization checks
          if (chat.chatType === "community") {
            const community = await Community.findOne({ chat: chatId });
            if (!community.members.includes(userId)) {
              return socket.emit("ERROR", "Not a community member");
            }
          } else {
            if (!chat.participants.includes(userId)) {
              return socket.emit("ERROR", "Not part of this chat");
            }
          }

          // Handle file chunks
          if (!socket.fileChunks) socket.fileChunks = {};
          if (!socket.fileChunks[chatId]) socket.fileChunks[chatId] = [];
          socket.fileChunks[chatId].push(Buffer.from(chunk, "base64"));

          if (isLastChunk) {
            const fileBuffer = Buffer.concat(socket.fileChunks[chatId]);
            const tempDir = path.join(__dirname, "../uploads");
            if (!fs.existsSync(tempDir))
              fs.mkdirSync(tempDir, { recursive: true });

            const sanitizedFileName = sanitize(fileName);
            const tempFilePath = path.join(tempDir, sanitizedFileName);
            fs.writeFileSync(tempFilePath, fileBuffer);

            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(tempFilePath, {
              resource_type: "auto",
              folder: `chat_files/${chatId}`,
            });

            fs.unlinkSync(tempFilePath);
            delete socket.fileChunks[chatId];

            // Create message
            const message = new Message({
              chat: chatId,
              sender: userId,
              content: "📎 File shared",
              attachment: result.secure_url,
              fileType,
              fileName,
              timestamp: new Date(),
              status: "sent",
            });

            await message.save();

            // Update chat
            chat.lastMessage = message._id;
            chat.updatedAt = new Date();
            await chat.save();

            // Broadcast message
            const sender = await User.findById(userId, "name avatar");
            io.to(chatId).emit("NEW_MESSAGE", {
              messageId: message._id,
              content: message.content,
              attachment: message.attachment,
              fileName,
              fileType,
              sender: {
                id: userId,
                name: sender.name,
                avatar: sender.avatar,
              },
              timestamp: message.timestamp,
              chatId,
            });
          }
        } catch (error) {
          console.error("Upload error:", error);
          socket.emit("ERROR", { message: error.message });
        }
      }
    );




// setupChatEvents.js
socket.on("LEAVE_COMMUNITY", async ({ communityId, userId }) => {
  try {
    const [community, user] = await Promise.all([
      Community.findById(communityId),
      User.findById(userId)
    ]);

    // Remove from community members
    community.members = community.members.filter(m => !m.equals(userId));
    await community.save();

    // Remove from chat participants
    await Chat.findByIdAndUpdate(
      community.chat,
      { $pull: { participants: userId } }
    );

    // System message
    const sysMsg = await Message.create({
      chat: community.chat,
      content: `${user.name} left the community`,
      isSystemMessage: true,
      timestamp: new Date()
    });

    // Notify everyone in community
    io.to(communityId).emit("MEMBER_LEFT", {
      communityId,
      userId,
      message: sysMsg
    });

    // Direct confirmation to leaving user
    socket.emit("YOU_LEFT_COMMUNITY", { communityId });

    // Remove from presence tracking
    socket.leave(communityId);

  } catch (error) {
    socket.emit("ERROR", { message: error.message });
  }
});

    // Typing indicators
    socket.on("TYPING", ({ chatId, isTyping }) => {
      if (!chatId) return socket.emit("ERROR", { message: "Invalid chatId" });
      socket.to(chatId).emit("TYPING_STATUS", { userId, chatId, isTyping });
    });

    // Message read status
    socket.on("MARK_AS_READ", async ({ messageId }) => {
      try {
        const message = await Message.findByIdAndUpdate(
          messageId,
          { $addToSet: { readBy: userId }, status: "read" },
          { new: true }
        );

        if (!message) return socket.emit("ERROR", "Message not found");

        const chat = await Chat.findById(message.chat);
        chat.unreadCount.set(userId, 0);
        await chat.save();

        io.to(message.chat.toString()).emit("MESSAGE_READ", {
          messageId: message._id,
          readerId: userId,
        });
      } catch (error) {
        console.error("Read error:", error);
        socket.emit("ERROR", { message: error.message });
      }
    });

    // Chat deletion handler
    socket.on("DELETE_CHAT", async ({ chatId }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return socket.emit("ERROR", "Chat not found");

        // Authorization
        if (chat.chatType === "community") {
          const community = await Community.findOne({ chat: chatId });
          if (!community.admins.includes(userId)) {
            return socket.emit("ERROR", "Admin privileges required");
          }
        } else if (!chat.participants.includes(userId)) {
          return socket.emit("ERROR", "Not authorized");
        }

        // Delete operations
        await Message.deleteMany({ chat: chatId });
        await Chat.findByIdAndDelete(chatId);

        if (chat.chatType === "community") {
          await Community.findOneAndDelete({ chat: chatId });
        }

        io.to(chatId).emit("CHAT_DELETED", { chatId });
      } catch (error) {
        console.error("Delete error:", error);
        socket.emit("ERROR", { message: error.message });
      }
    });

    // Community management
    socket.on("INVITE_TO_COMMUNITY", async ({ communityId, email }) => {
      try {
        const [community, user] = await Promise.all([
          Community.findById(communityId).populate("admins"),
          User.findOne({ email }),
        ]);

        if (!community.admins.some((a) => a._id.equals(userId))) {
          return socket.emit("ERROR", "Admin privileges required");
        }
        if (!user) return socket.emit("ERROR", "User not found");

        if (!community.members.includes(user._id)) {
          community.members.push(user._id);
          await community.save();

          // Add to community chat
          await Chat.findByIdAndUpdate(community.chat, {
            $addToSet: { participants: user._id },
          });

          // System message
          const sysMsg = new Message({
            chat: community.chat,
            content: `${user.name} joined the community`,
            isSystemMessage: true,
            timestamp: new Date(),
          });
          await sysMsg.save();

          io.to(community.chat.toString()).emit("NEW_MESSAGE", {
            messageId: sysMsg._id,
            content: sysMsg.content,
            timestamp: sysMsg.timestamp,
            isSystem: true,
            chatId: community.chat,
          });
        }

        socket.emit("INVITE_SUCCESS", { userId: user._id });
      } catch (error) {
        socket.emit("ERROR", error.message);
      }
    });

    // Disconnection handler
    socket.on("disconnect", async () => {
      if (userId && connectedUsers.has(userId)) {
        const userSockets = connectedUsers.get(userId);
        userSockets.delete(socket.id);

        if (userSockets.size === 0) {
          connectedUsers.delete(userId);

          // Notify communities
          const communities = await Community.find({ members: userId });
          communities.forEach((community) => {
            socket.to(community.chat.toString()).emit("MEMBER_PRESENCE", {
              userId,
              online: false,
            });
          });
        }
      }
      updateOnlineStatus();
      console.log(`❌ User disconnected: ${userId}`);
    });
  });
};
