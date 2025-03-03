import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";

export const setupChatEvents = (io, connectedUsers) => {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.id}`);

    // Track online users
    connectedUsers.set(socket.user.id, socket.id);
    io.emit("ONLINE_STATUS", { userId: socket.user.id, isOnline: true });

    // Join user-specific room
    socket.join(socket.user.id);

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
          status: "sent", // Initial status
        });

        // Update the chat's last message
        await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

        // Broadcast the new message to all participants in the chat
        io.to(chatId).emit("NEW_MESSAGE", {
          messageId: message._id,
          content: message.content,
          sender: socket.user.id,
          timestamp: message.timestamp,
        });
      } catch (error) {
        console.error("🔥 Error sending message:", error.message);
        socket.emit("ERROR", { message: "Failed to send message" });
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
      connectedUsers.delete(socket.user.id);
      io.emit("ONLINE_STATUS", { userId: socket.user.id, isOnline: false });
      console.log(`❌ User disconnected: ${socket.user.id}`);
    });
  });
};