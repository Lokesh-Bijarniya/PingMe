import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import SocketService from "../services/socket";
import ChatList from "../components/messages/ChatList";
import ChatWindow from "../components/messages/ChatWindow";
import { deleteChat } from "../redux/features/chat/chatSlice";

const ChatPage = () => {
  const dispatch = useDispatch();
  const selectedChat = useSelector((state) => state.chat.selectedChat);

  // Listen for chat deletion events via WebSocket
  useEffect(() => {
    const handleChatDeleted = (data) => {
      const { chatId } = data;
      dispatch(deleteChat(chatId)); // Dispatch an action to remove the chat from state
    };

    SocketService.on("CHAT_DELETED", handleChatDeleted);
    return () => SocketService.off("CHAT_DELETED", handleChatDeleted);
  }, [dispatch]);

  return (
    <div className="flex h-screen">
      <ChatList />
      <div className="flex-1">
        {selectedChat ? (
          <ChatWindow selectedChat={selectedChat} />
        ) : (
          <div className="flex justify-center items-center h-full text-gray-400">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;