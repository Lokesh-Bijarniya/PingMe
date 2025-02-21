import React, { useState } from "react";
import ChatWindowNavbar from "../chatWindow-bar";

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { sender: "Mas Happy", text: "Hey! How are you?", time: "05:00 PM" },
    { sender: "You", text: "I'm good, thank you!", time: "05:02 PM" },
  ]);

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      setMessages((prev) => [
        ...prev,
        { sender: "You", text: input, time: "Just now" },
      ]);
      setInput("");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-white border border-gray-300">
      <ChatWindowNavbar/>
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
      <div className="p-4 border-t flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
