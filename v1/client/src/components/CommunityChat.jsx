import React, { useState } from "react";

const CommunityChat = ({ selectedCommunity }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "John", text: "Anyone working on React 19?" },
    { id: 2, sender: "Amy", text: "Tailwind CSS just got an update!" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    setMessages([...messages, { id: messages.length + 1, sender: "You", text: newMessage }]);
    setNewMessage("");
  };

  return (
    <div className="w-2/3 p-6 flex flex-col">
      {selectedCommunity ? (
        <>
          <h2 className="text-xl font-semibold mb-4">{selectedCommunity.name} Chat</h2>

          <div className="flex-1 overflow-y-auto bg-gray-100 p-4 rounded-lg space-y-2">
            {messages.map((msg) => (
              <div key={msg.id} className={`p-2 rounded-md ${msg.sender === "You" ? "bg-blue-200 self-end" : "bg-gray-200"}`}>
                <p><strong>{msg.sender}:</strong> {msg.text}</p>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div className="mt-4 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-l-md focus:ring focus:ring-blue-200"
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600">
              Send
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-600 text-center mt-20">Select a community to start chatting.</p>
      )}
    </div>
  );
};

export default CommunityChat;
