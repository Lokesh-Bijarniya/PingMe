// controllers/communityController.js
import Community from "../models/communityModel.js";
import Chat from "../models/chatModel.js";
import Message from "../models/messageModel.js";
import User from "../models/userModel.js";

// ✅ Create new community with linked chat
export const createCommunity = async (req, res) => {
  try {
    console.log(req.body);

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

// ✅ Get community details
export const getCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("members", "name email avatar online")
      .populate("admins", "name email avatar")
      .populate({
        path: "chat",
        populate: {
          path: "lastMessage",
          populate: { path: "sender", select: "name avatar" }
        }
      });

    if (!community) return res.status(404).json({ message: "Community not found" });
    
    res.json(community);
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

    console.log(communityId);

    // 1. Find the community and its associated chat
    const community = await Community.findById(communityId)
      .populate('chat')
      .populate('members');

      console.log(community);

    if (!community) {
      return res.status(404).json({ message: "Community not found" });
    }

    // 2. Verify user is community member
    const isMember = community.members.some(member => 
      member._id.toString() === userId.toString()
    );
    
    if (!isMember) {
      return res.status(403).json({ message: "Access denied" });
    }

    // 3. Get messages for the community's chat
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ chat: community.chat._id })
      .sort({ timestamp: 1 })
      .skip(skip)
      .limit(limit)
      .populate('sender', 'name avatar')
      .lean();

    res.json({
      messages,
      page,
      totalPages: Math.ceil(
        await Message.countDocuments({ chat: community.chat._id }) / limit
      )
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// ✅ Update community (Admin only)
export const updateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const userId = req.user.id;

    const community = await Community.findById(id);
    if (!community.admins.includes(userId)) {
      return res.status(403).json({ message: "Admin privileges required" });
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      { name, description },
      { new: true }
    );

    await createSystemMessage(id, "Community details updated");

    res.json(updatedCommunity);
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

    community.members = community.members.filter(m => !m.equals(req.user.id));
    await community.save();

    // Remove from chat participants
    await Chat.findByIdAndUpdate(community.chat, {
      $pull: { participants: req.user.id }
    });

    res.json({ message: "Successfully left community" });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Add member to community (Admin only)
export const addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;
    const requesterId = req.user.id;

    const community = await Community.findById(id);
    const userToAdd = await User.findOne({ email });

    if (!community.admins.includes(requesterId)) {
      return res.status(403).json({ message: "Admin privileges required" });
    }
    if (!userToAdd) return res.status(404).json({ message: "User not found" });
    if (community.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: "User already in community" });
    }

    community.members.push(userToAdd._id);
    await community.save();

    // Add to community chat
    await Chat.findByIdAndUpdate(
      community.chat,
      { $addToSet: { participants: userToAdd._id } }
    );

    // Create system message
    await createSystemMessage(id, `${userToAdd.name} joined the community`);

    res.json({ message: "Member added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Remove member from community (Admin only)
export const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const requesterId = req.user.id;

    const community = await Community.findById(id);
    const userToRemove = await User.findById(userId);

    if (!community.admins.includes(requesterId)) {
      return res.status(403).json({ message: "Admin privileges required" });
    }
    if (!userToRemove) return res.status(404).json({ message: "User not found" });

    community.members = community.members.filter(m => m.toString() !== userId);
    await community.save();

    // Remove from community chat
    await Chat.findByIdAndUpdate(
      community.chat,
      { $pull: { participants: userId } }
    );

    // Create system message
    await createSystemMessage(id, `${userToRemove.name} left the community`);

    res.json({ message: "Member removed successfully" });
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



// ✅ Create system message in community chat
const createSystemMessage = async (communityId, content) => {
  try {
    const community = await Community.findById(communityId).populate("chat");
    if (!community) return;

    const message = new Message({
      chat: community.chat._id,
      content,
      isSystemMessage: true,
      timestamp: new Date()
    });

    await message.save();

    community.chat.lastMessage = message._id;
    await community.chat.save();

    return message;
  } catch (error) {
    console.error("Error creating system message:", error);
  }
};