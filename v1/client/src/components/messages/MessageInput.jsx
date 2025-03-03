import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Smile, Send } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useDebounce } from "../../hooks/useDebounce"; // Ensure this path is correct
import SocketService from "../../services/socket";
import { useSelector } from "react-redux";

const MessageInput = ({ onSend, onTyping }) => {
  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState(null); // For file upload
  const typingTimeout = useRef(null);

  // Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setInput((prev) => prev + emoji.emoji);
    setShowEmoji(false);
  };

  // Handle message submission
  const handleSubmit = () => {
    if (input.trim() || file) {
      onSend(input, file); // Pass both text and file
      setInput(""); // Clear input
      setFile(null); // Clear file
      onTyping(false); // Stop typing indicator
    }
  };

  // Handle typing status
  const handleTyping = (isTyping) => {
    if (onTyping) {
      onTyping(isTyping);
    }
    SocketService.emit("TYPING", {
      chatId: selectedChat?.chatId,
      isTyping,
    });
  };

  // Use debounce for typing indicator
  const debouncedHandleTyping = useDebounce(handleTyping, 500);

  useEffect(() => {
    if (input) {
      debouncedHandleTyping(true); // Trigger typing indicator
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => debouncedHandleTyping(false), 2000); // Stop after 2 seconds
    } else {
      debouncedHandleTyping(false); // Stop typing if input is empty
    }
  }, [input, debouncedHandleTyping]);

  // Handle file upload
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile); // Store the file in state
    }
  };

  return (
    <div className="flex gap-2 items-center p-2 border-t">
      {/* Emoji Picker */}
      <button onClick={() => setShowEmoji(!showEmoji)} className="text-gray-500 hover:text-blue-500">
        <Smile size={20} />
      </button>
      {showEmoji && (
        <div className="absolute bottom-20">
          <EmojiPicker onEmojiClick={handleEmojiSelect} />
        </div>
      )}


       {/* File Upload */}
       <label htmlFor="file-upload" className="cursor-pointer">
        <Paperclip size={20} className="text-gray-500 hover:text-blue-500 ml-2" />
        <input
          id="file-upload"
          type="file"
          accept="image/*, .pdf, .docx"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
      </label>

      {/* Input Field */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
        placeholder="Type a message..."
        className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
      />

     

      {/* Send Button */}
      <button onClick={handleSubmit} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">
        <Send size={20} />
      </button>
    </div>
  );
};

export default MessageInput;