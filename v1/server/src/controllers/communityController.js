// controllers/communityController.js
import Community from "../models/communityModel.js";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";
import { createSystemMessage } from "../utils/messageHandler.js";


// ✅ Create new community with linked chat
export const createCommunity = async (req, res) => {
  try {
    // console.log(req.body);

      // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ message: 'Community name is required' });
    }
    const { name, description } = req.body;
    const userId = req.user.id;

    // Create community chat
    const communityChat = new Chat({
      participants: [userId],
      chatType: "community",
    });
    await communityChat.save();

    // Create community
    const community = new Community({
      name,
      description,
      members: [userId],
      admins: [userId],
      chat: communityChat._id
    });
    await community.save();

    // Link chat to community
    communityChat.community = community._id;
    await communityChat.save();

    // Create system message
    await createSystemMessage(community._id, "Community created");

    res.status(201).json(community);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get all communities
export const getCommunities = async (req, res) => {
  try {
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

    res.json(formattedCommunities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get community members
export const getCommunityMembers = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("members", "name email avatar online");
    res.json(community.members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Get community chat messages
export const getCommunityMessages = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId).populate('chat').populate('members');
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (!community.members.some(member => member._id.toString() === userId.toString())) {
      return res.status(403).json({ message: "Access denied" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chat: community.chat._id })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar');

    res.json({
      messages,
      page,
      totalPages: Math.ceil(await Message.countDocuments({ chat: community.chat._id }) / limit)
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Delete community (Admin only)
export const deleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community.admins.includes(userId)) {
      return res.status(403).json({ message: "Admin privileges required" });
    }


    // Delete related data
    await Chat.findByIdAndDelete(community.chat);
    await Message.deleteMany({ chat: community.chat });
    await Community.findByIdAndDelete(id);


    // Notify community members
    const io = req.app.locals.io;
    if (io) io.to(chatId).emit("CHAT_DELETED", { chatId });

    res.json({ message: "Community deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const leaveCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);
    if (!community.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Not a member" });
    }

    // Remove user from community members
    community.members = community.members.filter(m => !m.equals(req.user.id));
    await community.save();

    // Remove from chat participants
    await Chat.findByIdAndUpdate(community.chat, {
      $pull: { participants: req.user.id }
    });

    // Notify other members via WebSocket
    const io = req.app.locals.io;  // Access WebSocket instance
    if (io) io.of("/community").to(req.params.id).emit("MEMBER_LEFT", { userId: req.user.id, communityId: req.params.id });

    res.json({ message: "Successfully left community" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ✅ Join community (Public join)
export const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community) return res.status(404).json({ message: "Community not found" });

    if (community.members.includes(userId)) {
      return res.status(400).json({ message: "Already a member" });
    }

    community.members.push(userId);
    await community.save();

    // Add to community chat
    await Chat.findByIdAndUpdate(
      community.chat,
      { $addToSet: { participants: userId } }
    );

    // Create system message
    const user = await User.findById(userId);
    await createSystemMessage(id, `${user.name} joined the community`);

    res.json({message: "Joined community successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
