import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
// import File from "../models/fileModel";
import Call from "../models/callModel.js";
import Chat from "../models/chatModel.js";

// controllers/dashboardController.js
export const getDashboardStats = async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments(); // Count all messages
    const activeUsers = await User.countDocuments({ isActive: true }); // Count active users
    const filesShared = await Message.countDocuments({ attachment: { $exists: true, $ne: null } });// Count shared files
    const callsMade = await Call.countDocuments(); // Count calls

    res.json([
      { title: "Total Messages", value: totalMessages, icon: "MessageCircle" },
      { title: "Active Users", value: activeUsers, icon: "Users" },
      { title: "Files Shared", value: filesShared, icon: "FileText" },
      { title: "Calls Made", value: callsMade, icon: "PhoneCall" },
    ]);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/dashboardController.js
export const getRecentChats = async (req, res) => {
  try {
      const userId = req.user.id; // Get logged-in user's ID

      const recentChats = await Chat.find({ participants: userId }) // Only fetch chats where user is a participant
          .sort({ updatedAt: -1 }) // Sort by latest update
          .limit(5)
          .populate("participants", "name") // Populate participant details
          .populate("lastMessage", "message createdAt") // Populate last message

      const formattedChats = recentChats.map(chat => {
          // Get the other participant (not the logged-in user)
          const otherParticipant = chat.participants.find(user => user._id.toString() !== userId);

          return {
              id: chat._id,
              name: otherParticipant ? otherParticipant.name : "Group Chat",
              lastMessage: chat.lastMessage?.message || "No messages yet",
              time: formatTimeAgo(chat.lastMessage?.createdAt || chat.updatedAt),
          };
      });

      // console.log("Recent Chats:", formattedChats);

      res.json(formattedChats);
  } catch (error) {
      console.error("Error fetching recent chats:", error);
      res.status(500).json({ message: "Server error" });
  }
};


// Helper function to format time as "X ago"
function formatTimeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
