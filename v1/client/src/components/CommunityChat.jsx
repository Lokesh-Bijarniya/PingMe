import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { Send, Smile, LogOut, UsersRound, Trash2 } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import { format, isToday, isYesterday } from "date-fns";
import SocketService from "../services/socket";
import {
  fetchCommunityMembers,
  fetchCommunityMessages,
  leaveCommunity,
} from "../redux/features/chat/communitySlice";

const CommunityChat = ({ community }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const messagesEndRef = useRef(null);
  
  const { members } = useSelector((state) => state.community);
  const { user } = useSelector((state) => state.auth);
  const messages = useSelector((state) => 
    state.community.communities[community?._id]?.messages || []
  );

  console.log("community",community);

  // WebSocket and data synchronization
  useEffect(() => {
    if (!community?._id) return;

    const handleNewMessage = (data) => {
      if (data.communityId === community._id) {
        // Automatic scroll will be handled by the messages effect
      }
    };

    // Join community room and setup listeners
    SocketService.emit("JOIN_COMMUNITY_ROOM", community._id);
    SocketService.on("NEW_COMMUNITY_MESSAGE", handleNewMessage);

    // Initial data fetch
    dispatch(fetchCommunityMembers(community._id));
    dispatch(fetchCommunityMessages(community._id));

    return () => {
      SocketService.off("NEW_COMMUNITY_MESSAGE", handleNewMessage);
      SocketService.emit("LEAVE_COMMUNITY_ROOM", community._id);
    };
  }, [community?._id, dispatch]);

  // Message synchronization and scroll management
  useEffect(() => {
    // Smooth scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    
    // Periodic sync to catch any missed messages
    const syncInterval = setInterval(() => {
      dispatch(fetchCommunityMessages(community._id));
    }, 30000);

    return () => clearInterval(syncInterval);
  }, [messages.length, community?._id, dispatch]);

  const handleSendMessage = () => {
    if (message.trim()) {
      SocketService.emit("SEND_MESSAGE", {
        chatId: community.chat._id,
        content: message,
        sender: user._id,
        chatType: "community"
      });
      setMessage("");
    }
  };

  const handleLeaveCommunity = () => {
    if (window.confirm("Are you sure you want to leave this community?")) {
      dispatch(leaveCommunity(community._id));
      SocketService.emit("LEAVE_COMMUNITY", {
        communityId: community._id,
        userId: user._id
      });
      navigate('/communities');
    }
  };


   // Add delete community handler
   const handleDeleteCommunity = () => {
    if (window.confirm("Are you sure you want to delete this community? This action cannot be undone!")) {
      dispatch(deleteCommunity(community._id));
      navigate('/communities');
    }
  };

  // Message rendering helpers
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    if (isToday(date)) return format(date, "h:mm a");
    if (isYesterday(date)) return `Yesterday ${format(date, "h:mm a")}`;
    return format(date, "MMM d, yyyy h:mm a");
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white rounded-lg shadow-sm">
      {/* Chat Header */}
      <div className="flex justify-between border-b border-b-gray-200 p-4 bg-gray-100 rounded-t-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <UsersRound className="text-blue-600 text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{community?.name}</h1>
            <p className="text-sm text-gray-500">{members.length} members</p>
          </div>
        </div>
        

        {community?.admin[0] === user._id ? (
      <button
        className="flex items-center gap-2 px-4 text-red-500 bg-gray-200 hover:bg-gray-300 rounded-full"
        onClick={handleDeleteCommunity}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    ) : (
      <button
        className="flex items-center gap-2 px-4 text-red-500 bg-gray-200 hover:bg-gray-300 rounded-full"
        onClick={handleLeaveCommunity}
      >
        <LogOut className="w-4 h-4" />
        Exit
      </button>
    )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <MessageItem 
            key={msg._id}
            msg={msg}
            user={user}
            formatTimestamp={formatTimestamp}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4 bg-white rounded-b-lg">
        <div className="flex items-center gap-2">
          <EmojiPickerTrigger 
            showEmoji={showEmoji}
            setShowEmoji={setShowEmoji}
            handleEmojiSelect={(e) => setMessage(m => m + e.emoji)}
          />
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Type your message..."
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Sub-components for better readability
const MessageItem = ({ msg, user, formatTimestamp }) => {
  console.log(msg);
  // Handle system messages
  if (msg.isSystemMessage) {
    return (
      <div className="text-center py-2">
        <span className="text-sm text-gray-500 italic">
          {msg.content}
        </span>
      </div>
    );
  }

  // Regular user messages
  const senderId = msg.sender?._id || msg.sender?.id;
  const isCurrentUser = senderId === user._id;

  return (
    <div className={`flex items-end gap-3 mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      {!isCurrentUser && (
        <img
          src={msg.sender?.avatar || "/default-avatar.png"}
          alt={`${msg.sender?.name}'s avatar`}
          className="w-10 h-10 rounded-full border border-gray-200 shadow-sm object-cover"
        />
      )}
      <div className={`max-w-[70%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
        {!isCurrentUser && (
          <span className="text-xs font-medium text-gray-700 mb-1.5 block">
            {msg.sender?.name}
          </span>
        )}
        <div className={`p-3.5 text-sm rounded-3xl shadow-sm ${
          isCurrentUser
            ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white"
            : "bg-white border border-gray-100 text-gray-900"
        }`}>
          <p className="break-words">{msg.content}</p>
          <span className={`text-[11px] ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {formatTimestamp(msg.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
};

const EmojiPickerTrigger = ({ showEmoji, setShowEmoji, handleEmojiSelect }) => (
  <div className="relative">
    <button
      onClick={() => setShowEmoji(!showEmoji)}
      className="text-gray-500 hover:text-blue-500"
    >
      <Smile size={20} />
    </button>
    {showEmoji && (
      <div className="absolute bottom-10 left-0 z-10">
        <EmojiPicker
          onEmojiClick={(emoji) => {
            handleEmojiSelect(emoji);
            setShowEmoji(false);
          }}
        />
      </div>
    )}
  </div>
);

export default CommunityChat;