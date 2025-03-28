import Community from "../models/communityModel.js";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import handleFileUpload from "../utils/fileUploadHandler.js";

export const setupCommunityEvents = (io, connectedUsers) => {
  const communityNamespace = io.of("/community");

  communityNamespace.on("connection", (socket) => {
    const userId = socket.user?.id;
    console.log(`✅ User connected to /community: ${userId}`);

    // 🟢 **Join a Community Chat Room**
    socket.on("JOIN_COMMUNITY_ROOM", async (communityId) => {
      try {
        const chat = await Chat.findOne({ community: communityId });
        if (!chat) throw new Error("Community chat not found");

        // Fetch Last 50 Messages
        const initialMessages = await Message.find({ chat: chat._id })
          .sort({ timestamp: -1 })
          .limit(50)
          .lean();

        // Send to user
        socket.emit("COMMUNITY_HISTORY", initialMessages.reverse());
        socket.join(communityId);
      } catch (error) {
        socket.emit("ERROR", { message: error.message });
      }
    });

    // 🔴 **Leave Community Room**
    socket.on("LEAVE_COMMUNITY_ROOM", (communityId) => {
      socket.leave(communityId);
    });

    // 💬 **Send Message in Community**
    socket.on("SEND_COMMUNITY_MESSAGE", async ({ senderId, communityId, content }) => {
      try {
        // Find the chat associated with this community
        let chat = await Chat.findOne({ community: communityId });
        // console.log(chat);
  
        if (!chat) {
          return socket.emit("error", { message: "Community chat not found" });
        }
  
        // Save message in DB
        const newMessage = new Message({
          chat: chat._id,
          sender: senderId,
          content: content,
          chatType:"community"
        });
  
        await newMessage.save();

        // console.log("newMsg",newMessage);

        // Ensure unreadCounts is initialized
if (!chat.unreadCounts) {
  chat.unreadCounts = new Map();
}

        // ✅ Update unread counts for all members (except sender)
    chat.participants.forEach((participant) => {
      if (!participant.equals(senderId)) {
        chat.unreadCounts.set(participant.toString(), (chat.unreadCounts.get(participant.toString()) || 0) + 1);
      }
    });

         // Update lastMessage in Chat
         chat.lastMessage = newMessage._id;
         console.log(chat.lastMessage);
  
        await chat.save();


        // console.log(`📤 Emitting message to communityId: ${communityId}`, newMessage);
  
        // ✅ Broadcast message to the community room
        communityNamespace.to(communityId).emit("NEW_COMMUNITY_MESSAGE", { 
          communityId, 
          message: newMessage 
        });

        console.log("newMsg sent to the community");
        
      } catch (error) {
        console.error("Message error:", error);
        socket.emit("error", { message: "Message sending failed" });
      }
    });

    // 📂 **Handle File Uploads**
    socket.on("UPLOAD_COMMUNITY_FILE", (data) => {
      handleFileUpload({ socket, io: communityNamespace, type: "community", id: data.communityId, userId, ...data });
    });


    socket.on("MARK_COMMUNITY_AS_READ", async ({ communityId, userId }) => {
      try {
        const chat = await Chat.findOne({ community: communityId });
        if (!chat) return socket.emit("ERROR", { message: "Community chat not found" });
    
        // ✅ Ensure user is part of the chat
        if (!chat.participants.includes(userId)) {
          return socket.emit("ERROR", { message: "Not part of this community chat" });
        }
    
        // ✅ Reset unread count for this user
        if (chat.unreadCounts.has(userId.toString())) {
          chat.unreadCounts.set(userId.toString(), 0);
        }
    
        await chat.save();
    
        // ✅ Update message statuses in DB
        await Message.updateMany({ chat: chat._id, sender: { $ne: userId } }, { status: "read" });
    
        // ✅ Notify all participants in the community
        communityNamespace.to(communityId).emit("COMMUNITY_MESSAGES_READ", { communityId, userId });
    
      } catch (error) {
        console.error("Mark as read error:", error);
        socket.emit("ERROR", { message: "Failed to mark messages as read" });
      }
    });
  

    // 🔴 **Handle Disconnection**
    socket.on("disconnect",async () => {
      await User.findByIdAndUpdate(userId, { lastActive: new Date() });
      console.log(`❌ User disconnected from /community: ${userId}`);
    });
  });
};
