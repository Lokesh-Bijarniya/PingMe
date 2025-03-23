import Message from "../models/messageModel.js";
import Community from "../models/communityModel.js";

export const createSystemMessage = async (communityId, content) => {
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
    console.error("🔥 Error creating system message:", error);
  }
};


export const processLastMessage = (lastMessage) => {
    if (!lastMessage) return null;
  
    return {
      content: lastMessage.attachment ? "📎 Attachment" : lastMessage.content,
      sender: lastMessage.sender?.name || "System",
      timestamp: lastMessage.timestamp,
      attachment: lastMessage.attachment || null,
      fileType: lastMessage.fileType || null,
      isSystem: lastMessage.isSystemMessage || false
    };
  };
  
  