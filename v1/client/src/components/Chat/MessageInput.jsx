import React, { useState } from "react";
import { Paperclip, Mic, Smile, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react"; 

const MessageInput = ({ onSendMessage }) => {
  const [input, setInput] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      onSendMessage(input);
      setInput("");
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  return (
    <div className="p-4 border-t flex items-center gap-2 relative bg-white">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-2 bg-white shadow-md rounded-lg p-2">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Emoji Button */}
      <button
        onClick={() => setShowEmojiPicker((prev) => !prev)}
        className="p-2 text-gray-500 hover:text-blue-500"
      >
        <Smile size={22} />
      </button>

      {/* Message Input */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />

      {/* File Attachment */}
      <button className="p-2 text-gray-500 hover:text-blue-500">
        <Paperclip size={22} />
      </button>

      {/* Voice Message (Future Feature) */}
      <button className="p-2 text-gray-500 hover:text-blue-500">
        <Mic size={22} />
      </button>

      {/* Send Button */}
      <button
        onClick={handleSend}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-1"
      >
        Send <Send size={18} />
      </button>
    </div>
  );
};

export default MessageInput;
