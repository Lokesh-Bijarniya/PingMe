import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import handleFileUpload from "../utils/fileUploadHandler.js";

export const setupChatEvents = (io, connectedUsers) => {
  const chatNamespace = io.of("/chat");

  chatNamespace.on("connection", (socket) => {
    const userId = socket.user?.id;
    if (!userId) return;
    console.log(`✅ [Chat] User connected: ${userId}`);

    // Track connected users
    if (userId) {
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId).add(socket.id);
      User.findByIdAndUpdate(userId, {
        lastActive: new Date(),
        isActive: true,
      });
    }

    // Emit online status for chat participants
    if (connectedUsers.get(userId).size === 1) {
      chatNamespace.emit("ONLINE_STATUS", { userId, isOnline: true });
    }

    // Join a private chat room
    socket.on("JOIN_CHAT", ({ chatId }) => {
      if (!chatId) return socket.emit("ERROR", { message: "Invalid chatId" });

      socket.join(chatId);
      console.log(`💬 [Chat] User ${userId} joined room ${chatId}`);
    });

    // Leave a private chat room
    socket.on("LEAVE_CHAT", ({ chatId }) => {
      if (!chatId) return socket.emit("ERROR", { message: "Invalid chatId" });

      socket.leave(chatId);
      console.log(`🚪 [Chat] User ${userId} left room ${chatId}`);
    });

    // Send a message
    socket.on("SEND_MESSAGE", async ({ chatId, content }) => {
      try {
        const chat = await Chat.findById(chatId).populate("participants");
        if (!chat) return socket.emit("ERROR", { message: "Chat not found" });

        // Check if user is part of the chat
        if (!chat.participants.some((p) => p.equals(userId))) {
          return socket.emit("ERROR", { message: "Not part of this chat" });
        }

        // Create & save message
        const message = new Message({
          chat: chatId,
          sender: userId,
          content,
          timestamp: new Date(),
          status: "sent",
        });

        await message.save();

        // Update chat last message
        chat.lastMessage = message._id;
        chat.updatedAt = new Date();

        // Ensure `unreadCount` is initialized
        if (!chat.unreadCount) {
          chat.unreadCount = new Map();
        }

        // Increment unread count for the user
        chat.unreadCount.set(
          userId.toString(),
          (chat.unreadCount.get(userId.toString()) || 0) + 1
        );

        // Mark field as modified before saving
        chat.markModified("unreadCount");

        await chat.save();

        // Fetch sender info
        const sender = await User.findById(userId, "name avatar");

        const response = {
          messageId: message._id,
          content: message.content,
          sender: { id: userId, name: sender.name, avatar: sender.avatar },
          timestamp: message.timestamp,
          status: "sent",
          chatId,
        };

        // Emit the new message to all participants in the chat room
        chatNamespace.to(chatId).emit("NEW_MESSAGE", response);
      } catch (error) {
        console.error("Message error:", error);
        socket.emit("ERROR", { message: error.message });
      }
    });

    // Handle file uploads in chat
    socket.on("UPLOAD_FILE", (data) => {
      handleFileUpload({
        socket,
        io: chatNamespace,
        type: "chat",
        id: data.chatId,
        userId,
        ...data,
      });
    });

    // Typing status notification
    socket.on("TYPING", ({ chatId, isTyping }) => {
      if (!chatId) return;
      socket.to(chatId).emit("TYPING_STATUS", { userId, chatId, isTyping });
    });

    // Mark messages as read
    socket.on("MARK_AS_READ", async ({ chatId, userId }) => {
      try {
        const chat = await Chat.findById(chatId);
        if (!chat) return socket.emit("ERROR", { message: "Chat not found" });

        // ✅ Ensure the user is part of the chat
        if (!chat.participants.includes(userId)) {
          return socket.emit("ERROR", { message: "Not part of this chat" });
        }

        // ✅ Reset unread count for this user
        if (chat.unreadCounts.has(userId.toString())) {
          chat.unreadCounts.set(userId.toString(), 0);
        }

        await chat.save();

        // ✅ Update message statuses in DB
        await Message.updateMany(
          { chat: chatId, sender: { $ne: userId } },
          { status: "read" }
        );

        // ✅ Notify all participants that messages were read
        chatNamespace.to(chatId).emit("MESSAGES_READ", { chatId, userId });
      } catch (error) {
        console.error("Mark as read error:", error);
        socket.emit("ERROR", { message: "Failed to mark messages as read" });
      }
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`❌ [Chat] User disconnected from /chat: ${userId}`);

      if (connectedUsers.has(userId)) {
        const sockets = connectedUsers.get(userId);
        sockets.delete(socket.id);
        User.findByIdAndUpdate(userId, {
          lastActive: new Date(),
          isActive: false,
        });

        if (sockets.size === 0) {
          connectedUsers.delete(userId);
          console.log(`🚫 [Chat] User ${userId} is now fully offline.`);
          io.emit("ONLINE_STATUS", { userId, isOnline: false });
        }
      }
    });
  });
};
