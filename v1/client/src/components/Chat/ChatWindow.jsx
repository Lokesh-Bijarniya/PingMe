import React, { useState } from "react";
import { useSelector } from "react-redux";
import ChatWindowNavbar from "../chatWindow-bar";
import MessageInput from "./MessageInput"; // Import input component

const ChatWindow = () => {
  const selectedChat = useSelector((state) => state.chat.selectedChat);

  // Initialize messages state
  const [messages, setMessages] = useState([
    { sender: selectedChat?.name || "User", text: "Hey! How are you?", time: "05:00 PM" },
    { sender: "You", text: "I'm good, thank you!", time: "05:02 PM" },
  ]);

  // Function to send a new message
  const handleSendMessage = (text) => {
    if (text.trim()) {
      setMessages((prev) => [
        ...prev,
        { sender: "You", text, time: "Just now" },
      ]);
    }
  };

  // Show a message if no chat is selected
  if (!selectedChat) {
    return (
      <div className="flex-1 flex justify-center items-center text-gray-500">
        Select a chat to start messaging
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-white border border-gray-300">
      <ChatWindowNavbar chat={selectedChat} />
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex mb-4 ${msg.sender === "You" ? "justify-end" : ""}`}
          >
            <div
              className={`p-3 rounded-lg ${
                msg.sender === "You" ? "bg-blue-500 text-white" : "bg-gray-100"
              } max-w-[80%]`}
            >
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs mt-1 text-gray-400">{msg.time}</p>
            </div>
          </div>
        ))}
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
