import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Phone, Video, MoreVertical, Trash2 } from "lucide-react";

const ChatWindowNavbar = ({ chat, onDeleteChat }) => {
  const {user} = useSelector((state)=>state.auth);
  const { onlineStatus } = useSelector((state) => state.chat);
  const typingStatus = useSelector((state) => state.chat.typingStatus);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  

  // console.log("nav-chat",chat)

  // ✅ Always define these variables before returning
  const friend = chat?.friend || {};
  const isOnline = onlineStatus?.[friend?.id] || false;
  const isTyping = typingStatus?.[chat?.chatId] || false;
  const lastActive = user?.lastActive || null


  //  console.log("online status", onlineStatus);

  // ✅ Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // ✅ Move return statement AFTER hooks are defined
  if (!chat || !chat.friend) {
    return (
      <div className="bg-gray-100 p-4 border-b text-gray-500 text-center">
        No chat selected
      </div>
    );
  }
  

  return (
    <div className="flex items-center justify-between border-b border-b-gray-300 p-4 bg-gray-100 not-lg:relative top-10">
      {/* 🔹 Left Side: User Info */}
      <div className="flex items-center gap-3">
        <img
          src={friend.avatar || "https://via.placeholder.com/50"}
          alt="User Avatar"
          className="w-10 h-10 rounded-full border object-cover"
        />
        <div>
          <p className="font-semibold">{friend.name || "Unknown User"}</p>
          <p className="text-sm text-gray-500">
            {isTyping ? "Typing..." : isOnline ? "🟢 Online" : formatLastSeen(lastActive)}
          </p>
        </div>
      </div>

      {/* 🔹 Right Side: Call & More Actions */}
      <div className="flex items-center gap-4 relative">
        {/* 📞 Call Button */}
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-not-allowed"
          disabled 
        >
          <Phone className={`w-5 h-5 text-gray-400`} />
        </button>

        {/* 🎥 Video Call Button */}
        <button
          className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition cursor-not-allowed"
          disabled
        >
          <Video className={`w-5 h-5 text-gray-400`} />
        </button>

        {/* 🔹 More Actions Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {/* 🔥 Dropdown Menu */}
          {isMenuOpen && (
            <div className="absolute top-12 right-0 bg-white shadow-lg rounded-md overflow-hidden z-10 transition-all transform scale-95 animate-fadeIn">
              <button
                className="flex items-center gap-2 w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100"
                onClick={() => {
                  setIsMenuOpen(false);
                  onDeleteChat(chat.chatId);
                }}
              >
                <Trash2 className="w-4 h-4" />
                Delete Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatWindowNavbar;





  // Function to format last seen time
  const formatLastSeen = (timestamp) => {
    if (!timestamp) return "Last seen recently"; 

    const lastActiveDate = new Date(timestamp);
    const now = new Date();

    const diffInSeconds = Math.floor((now - lastActiveDate) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInSeconds < 60) return "Last seen just now";
    if (diffInMinutes < 60) return `Last seen ${diffInMinutes} minutes ago`;
    if (diffInHours < 24 && lastActiveDate.getDate() === now.getDate()) {
      return `Last seen today at ${lastActiveDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    if (diffInDays === 1) {
      return `Last seen yesterday at ${lastActiveDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
    
    return `Last seen on ${lastActiveDate.toLocaleDateString([], { month: "short", day: "numeric" })} at ${lastActiveDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  };