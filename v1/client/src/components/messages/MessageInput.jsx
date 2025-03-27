import React, { useState, useEffect, useRef } from "react";
import { Paperclip, Smile, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { useDebounce } from "../../hooks/useDebounce"; // Ensure correct path
import SocketService from "../../services/socket";
import { useSelector } from "react-redux";

const MessageInput = ({ onSend, onTyping }) => {
  const selectedChat = useSelector((state) => state.chat.selectedChat);
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [file, setFile] = useState(null);
  const typingTimeout = useRef(null);

  // ✅ Handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setInput((prev) => prev + emoji.emoji);
    setShowEmoji(false);
  };

  // ✅ Handle message submission (Text & File)
  const handleSubmit = async () => {
    if (input.trim() || file) {
      await onSend(input, file);
      setInput(""); 
      setFile(null); 
  
      if (onTyping) {
        onTyping(false);  // ✅ Ensure this is only called if onTyping exists
      }
    }
  };

  // ✅ Handle typing status (Optimized with debounce)
  const handleTyping = (isTyping) => {
    if (onTyping) onTyping(isTyping);
    SocketService.chatSocket?.emit("TYPING", { chatId: selectedChat?.chatId, isTyping });
  };

  const debouncedHandleTyping = useDebounce(handleTyping, 500);

  useEffect(() => {
    if (input) {
      debouncedHandleTyping(true);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => debouncedHandleTyping(false), 2000);
    } else {
      debouncedHandleTyping(false);
    }
  }, [input, debouncedHandleTyping]);

  // ✅ Handle file upload (Preview & Send)
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile) setFile(uploadedFile);
  };

  // ✅ Remove file preview
  const handleRemoveFile = () => setFile(null);

  return (
    <div className="flex gap-2 items-center p-2 border-t not-md:mb-16">
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

      {/* File Preview (Before Sending) */}
      {file && (
        <div className="flex items-center gap-2 bg-gray-200 px-2 py-1 rounded-md">
          <p className="text-sm text-gray-700">{file.name}</p>
          <button onClick={handleRemoveFile} className="text-red-500 hover:text-red-700">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Field */}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
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
