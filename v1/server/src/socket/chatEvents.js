import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import { fileURLToPath } from "url";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const setupChatEvents = (io, connectedUsers) => {
  io.on("connection", (socket) => {
    const userId = socket.user.id;
    console.log(`✅ User connected: ${userId}`);

    // Store socket ID for the user (supports multiple connections)
    if (!connectedUsers.has(userId)) {
      connectedUsers.set(userId, new Set());
    }
    connectedUsers.get(userId).add(socket.id);

     // 🔥 Emit the full list of online users to everyone
     const onlineUsers = Array.from(connectedUsers.keys()); // ✅ Get all online user IDs
     io.emit("ONLINE_STATUS", { onlineUsers }); // ✅ Send all online users, not just one

    // Join user-specific room
    socket.join(userId);

    // Handle joining a chat room
    socket.on("JOIN_CHAT", ({ chatId }) => {
      if (!chatId) {
        return socket.emit("ERROR", { message: "Invalid chatId" });
      }

      socket.join(chatId);
      console.log(`💬 User ${socket.user.id} joined chat ${chatId}`);
    });

    // Handle sending messages
    socket.on("SEND_MESSAGE", async ({ chatId, content }) => {
      if (!chatId || !content) {
        return socket.emit("ERROR", { message: "Invalid chatId or content" });
      }
    
      try {
        // Validate chat existence
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return socket.emit("ERROR", { message: "Chat not found" });
        }
    
        // Create a new message
        const message = await Message.create({
          chat: chatId,
          sender: socket.user.id,
          content,
          timestamp: new Date(),
          status: "sent",
        });
    
        // Update chat's last message
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
    
        // ✅ Log before emitting
        console.log(`📩 Emitting NEW_MESSAGE:`, {
          chatId,
          message: {
            messageId: message._id,
            content: message.content,
            sender: {
              id: socket.user.id,
            },
            timestamp: message.timestamp,
          },
        });
    
        // ✅ Broadcast the new message
        io.to(chatId).emit("NEW_MESSAGE", {
          chatId,
          message: {
            messageId: message._id,
            content: message.content,
            sender: {
              id: socket.user.id,
            },
            timestamp: message.timestamp,
          },
        });
    
      } catch (error) {
        console.error("🔥 Error sending message:", error.message);
        socket.emit("ERROR", { message: "Failed to send message" });
      }
    });




      // 🔹 Handle file upload in chunks (streaming)
      socket.on("UPLOAD_FILE", async ({ chatId, fileName, fileType, chunk, isLastChunk }) => {
        try {
          if (!chatId || !fileName || !fileType || !chunk) {
            return socket.emit("ERROR", { message: "Invalid file data" });
          }
      
          // 🔹 Store chunks in memory
          if (!socket.fileChunks) {
            socket.fileChunks = {};
          }
          if (!socket.fileChunks[chatId]) {
            socket.fileChunks[chatId] = [];
          }
      
          // 🔥 Append chunk to memory
          socket.fileChunks[chatId].push(Buffer.from(chunk, "base64"));
      
          if (isLastChunk) {
            console.log(`✅ Final chunk received for ${fileName}. Uploading to Cloudinary...`);
      
            // 🔹 Combine all chunks into a single file buffer
            const fileBuffer = Buffer.concat(socket.fileChunks[chatId]);
      
            // 🔹 Save buffer to a temp file (optional)
            const tempFilePath = path.join(__dirname, "..", "uploads", fileName);
            fs.writeFileSync(tempFilePath, fileBuffer);
      
            // 🔥 Upload to Cloudinary using Buffer
            const cloudinaryResponse = await cloudinary.uploader.upload(tempFilePath, {
              resource_type: "auto", // Auto-detect file type
              folder: `chat_files/${chatId}`, // Organize in Cloudinary
            });
      
            console.log("✅ Uploaded to Cloudinary:", cloudinaryResponse.secure_url);
      
            // 🔹 Delete temp file after successful upload
            fs.unlinkSync(tempFilePath);
            delete socket.fileChunks[chatId]; // Clear memory buffer
      
            // ✅ Store in Database
            const message = await Message.create({
              chat: chatId,
              sender: socket.user.id,
              content: "📎 Attachment",
              attachment: cloudinaryResponse.secure_url,
              fileType,
              timestamp: new Date(),
              status: "sent",
            });
      
            await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });
      
            // ✅ Notify Chat Participants
            io.to(chatId).emit("NEW_MESSAGE", {
              chatId,
              message: {
                messageId: message._id,
                content: "📎 Attachment",
                attachment: cloudinaryResponse.secure_url,
                sender: { id: socket.user.id },
                timestamp: message.timestamp,
                fileType,
              },
            });
          }
        } catch (error) {
          console.error("🔥 Error uploading file:", error.message);
          socket.emit("ERROR", { message: "Failed to upload file" });
        }
      });
      
    

    // Handle typing indicators
    socket.on("TYPING", ({ chatId, isTyping }) => {
      if (!chatId) {
        return socket.emit("ERROR", { message: "Invalid chatId" });
      }

      socket.to(chatId).emit("TYPING_STATUS", { chatId, isTyping });
    });

    // Handle marking messages as read
    socket.on("MARK_AS_READ", async ({ messageId }) => {
      try {
        // Validate messageId
        if (!messageId) {
          return socket.emit("ERROR", { message: "Invalid messageId" });
        }

        // Find and update the message
        const message = await Message.findByIdAndUpdate(
          messageId,
          { $addToSet: { readBy: socket.user.id }, status: "read" },
          { new: true }
        );

        if (!message) {
          return socket.emit("ERROR", { message: "Message not found" });
        }

        // Broadcast the read status to all participants in the chat
        io.to(message.chat.toString()).emit("MESSAGE_READ", {
          messageId: message._id,
          status: "read",
        });
      } catch (error) {
        console.error("🔥 Error marking message as read:", error.message);
        socket.emit("ERROR", { message: "Failed to mark message as read" });
      }
    });



    // socket/socketServer.js
socket.on("DELETE_CHAT", async ({ chatId }) => {
  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return socket.emit("ERROR", { message: "Chat not found" });
    }

    // Notify all participants in the chat
    io.to(chatId).emit("CHAT_DELETED", { chatId });

    // Delete the chat and its messages
    await Message.deleteMany({ chat: chatId });
    await Chat.findByIdAndDelete(chatId);

    console.log(`✅ Chat ${chatId} deleted`);
  } catch (error) {
    console.error("🔥 Error deleting chat via WebSocket:", error);
    socket.emit("ERROR", { message: "Failed to delete chat" });
  }
});

    // Handle disconnection
    socket.on("disconnect", () => {
      const userSockets = connectedUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);

        // If no sockets remain for this user, mark them offline
        if (userSockets.size === 0) {
          connectedUsers.delete(userId);
        }
      }

      // 🔥 Broadcast updated list of online users after disconnection
      const updatedOnlineUsers = Array.from(connectedUsers.keys());
      io.emit("ONLINE_STATUS", { onlineUsers: updatedOnlineUsers });

      console.log(`❌ User disconnected: ${userId}`);
    });
  });
};