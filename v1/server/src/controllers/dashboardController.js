import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import Community from "../models/communityModel.js"; 
import redis from "../config/redis.js"; 

// controllers/dashboardController.js
export const getDashboardStats = async (req, res) => {
  try {
    // 🔥 Check Redis Cache
    const cachedStats = await redis.get("dashboard:stats");
    if (cachedStats) {
      console.log("✅ Dashboard Stats from Redis");
      return res.json(JSON.parse(cachedStats));
    }

    // Fetch data from MongoDB
    const totalMessages = await Message.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const filesShared = await Message.countDocuments({ attachment: { $exists: true, $ne: null } });

    const stats = [
      { title: "Total Messages", value: totalMessages, icon: "MessageCircle" },
      { title: "Active Users", value: activeUsers, icon: "Users" },
      { title: "Files Shared", value: filesShared, icon: "FileText" },
    ];

    // 🔹 Store result in Redis with expiration (e.g., 10 minutes)
    await redis.setEx("dashboard:stats", 600, JSON.stringify(stats));

    res.json(stats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCommunities = async (req, res) => {
  try {
    // 🔥 Check Redis Cache
    const cachedCommunities = await redisClient.get("communities:list");
    if (cachedCommunities) {
      console.log("✅ Communities Data from Redis");
      return res.json(JSON.parse(cachedCommunities));
    }

    // Fetch data from MongoDB
    const communities = await Community.find()
      .populate({
        path: "members",
        select: "_id name avatar online",
      })
      .populate({
        path: "chat",
        select: "lastMessage participants",
        populate: [{
          path: "lastMessage",
          populate: {
            path: "sender",
            select: "name avatar _id"
          }
        }]
      })
      .sort({ createdAt: -1 });

    const formattedCommunities = communities.map(community => ({
      _id: community._id,
      name: community.name,
      description: community.description,
      avatar: community.avatar,
      admin: community.admins,
      members: community.members?.map(member => ({
        _id: member?._id,
        name: member?.name,
        avatar: member?.avatar,
        online: member?.online
      })) || [],
      chat: {
        _id: community.chat?._id,
        lastMessage: community.chat?.lastMessage ? {
          _id: community.chat.lastMessage?._id,
          content: community.chat.lastMessage?.content,
          sender: community.chat.lastMessage?.sender ? {
            _id: community.chat.lastMessage.sender._id,
            name: community.chat.lastMessage.sender.name,
            avatar: community.chat.lastMessage.sender.avatar
          } : null,
          timestamp: community.chat.lastMessage?.timestamp
        } : null
      },
      createdAt: community.createdAt
    }));

    // 🔹 Store result in Redis with expiration (e.g., 10 minutes)
    await redisClient.setEx("communities:list", 600, JSON.stringify(formattedCommunities));

    res.json(formattedCommunities);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ message: "Server error" });
  }
};
