import Chat from "../models/chatModel.js";
import { processLastMessage } from "./messageHandler.js";

export const fetchChats = async (userId) => {
  const chats = await Chat.find({
    $or: [
      { participants: userId, chatType: "direct" },
      { chatType: "community", "community.members": userId }
    ]
  })
  .populate({
    path: "participants",
    select: "name email avatar online",
    match: { _id: { $ne: userId } }
  })
  .populate({
    path: "community",
    select: "name description avatar members admins"
  })
  .populate({
    path: "lastMessage",
    populate: { path: "sender", select: "name" }
  })
  .sort({ updatedAt: -1 });

  return chats.map(chat => {
    if (chat.chatType === "community") {
      return {
        chatId: chat._id,
        type: "community",
        community: {
          id: chat.community._id,
          name: chat.community.name,
          avatar: chat.community.avatar,
          description: chat.community.description,
          membersCount: chat.community.members.length
        },
        lastMessage: processLastMessage(chat.lastMessage),
        updatedAt: chat.updatedAt
      };
    } else {
      const friend = chat.participants[0];
      return {
        chatId: chat._id,
        type: "direct",
        friend: {
          id: friend._id,
          name: friend.name,
          email: friend.email,
          avatar: friend.avatar,
          online: friend.online
        },
        lastMessage: processLastMessage(chat.lastMessage),
        updatedAt: chat.updatedAt
      };
    }
  });
};
