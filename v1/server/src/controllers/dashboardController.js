import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

// controllers/dashboardController.js
export const getDashboardStats = async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments(); // Count all messages
    const activeUsers = await User.countDocuments({ isActive: true }); // Count active users
    const filesShared = await Message.countDocuments({ attachment: { $exists: true, $ne: null } });// Count shared files
   // const callsMade = await Call.countDocuments(); // Count calls

    res.json([
      { title: "Total Messages", value: totalMessages, icon: "MessageCircle" },
      { title: "Active Users", value: activeUsers, icon: "Users" },
      { title: "Files Shared", value: filesShared, icon: "FileText" },
     // { title: "Calls Made", value: callsMade, icon: "PhoneCall" },
    ]);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};
