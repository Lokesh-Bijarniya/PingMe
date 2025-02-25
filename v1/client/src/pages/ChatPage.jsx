import React from "react";
import { useSelector } from "react-redux";
import ChatList from "../components/Chat/ChatList";
import ChatWindow from "../components/Chat/ChatWindow";

const ChatPage = () => {
  const selectedChat = useSelector((state) => state.chat.selectedChat);

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
