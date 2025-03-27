import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChats,
  startChatByEmail,
  setSelectedChat,
  searchUsers,
  clearSearchedUsers,
  addChat,
} from "../../redux/features/chat/chatSlice";
import { toast } from "react-toastify";
import {
  Search,
  XCircle,
  UserPlus,
  CheckCircle,
  MinusCircle,
} from "lucide-react";

const ChatList = () => {
  const dispatch = useDispatch();
  const {
    chats = [],
    loading,
    searchedUsers,
    typingStatus,
    unreadCount
  } = useSelector((state) => state.chat);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if search was executed

  // console.log("search-users",searchUsers);

  // console.log(chats);

  // console.log("unread",unreadCount);
  useEffect(() => {
    if (!chats.length && !loading) {
      dispatch(fetchChats());
    }
  }, [dispatch, chats.length, loading]); // Only re-run if `chats.length` or `loading` changes

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      dispatch(clearSearchedUsers());
      return;
    }

    setIsSearching(true);
    setHasSearched(false); // Reset before search
    try {
      await dispatch(searchUsers(searchQuery));
      setHasSearched(true); // Mark search as executed
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("❌ Failed to search users. Please try again.");
    }
    setIsSearching(false);
  };

  const handleStartChat = async (email) => {
    try {
      const response = await dispatch(startChatByEmail(email)).unwrap(); // ✅ Ensure rejection throws an error

      // console.log("selected-chat", response);

      const newChat = {
        chatId: response.chatId,
        friend: response.friend || {
          id: "unknown",
          name: "Unknown User",
          email: email,
          avatar: "/default-avatar.png",
        },
      };

      dispatch(setSelectedChat(newChat));

      dispatch(addChat(newChat));
      dispatch(fetchChats());

      setSearchQuery("");
      dispatch(clearSearchedUsers());
      toast.success("✅ Chat started successfully!");
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.warn(
        `⚠️ ${error.message || "Unable to start chat. Please try again later."}`
      );
    }
  };

  return (
    <div className="lg:w-2/5 flex-1 lg:min-h-screen bg-gray-100 border-r p-4 flex flex-col">
      {/* 🔹 Add New Chat Input */}
      <div className="mb-4 relative">
        <div className="flex items-center border border-gray-300 rounded-md overflow-hidden bg-white shadow-sm">
          {/* ✉️ Input Field */}
          <input
            type="email"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setHasSearched(false); // Reset search state when typing
              dispatch(clearSearchedUsers());
            }}
            placeholder="Enter name or email to start chat..."
            className="w-full p-3 focus:outline-none text-gray-800"
          />

          {/* ❌ Clear Button (Shows only when input is not empty) */}
          {searchQuery.trim() && (
            <button
              onClick={() => {
                setSearchQuery(""); // Clear input
                setHasSearched(false);
                dispatch(clearSearchedUsers()); // Clear search state
              }}
              className="px-3 text-gray-400 hover:text-red-500 transition"
            >
              <XCircle className="w-5 h-5" />
            </button>
          )}

          {/* ➕💬 Start Chat Button */}
          <button
            onClick={handleSearchUsers}
            className="p-2  bg-blue-500 text-white flex items-center gap-1 hover:bg-blue-600 transition active:scale-95"
          >
            <UserPlus className="w-7 h-8" />{" "}
            {/* ✅ Changed Icon to UserPlus (Lucide-React) */}
          </button>
        </div>
      </div>

      {/* 🔹 Search Results Section */}
      {(isSearching ||
        searchedUsers.length > 0 ||
        (searchQuery.trim() && hasSearched)) && (
        <div className="mb-4 bg-white p-4 rounded-lg shadow-lg relative">
          {/* 🔹 Header */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Search Results</h3>
            <button
              onClick={() => {
                setSearchQuery(""); // Clear search query
                dispatch(clearSearchedUsers()); // Clear searched users
                setHasSearched(false); // Reset search state
              }}
              className="text-gray-500 hover:text-red-500 transition"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          {/* 🔍 Loading Indicator */}
          {isSearching ? (
            <p className="text-center text-gray-500 animate-pulse">
              🔍 Searching...
            </p>
          ) : searchedUsers.length === 0 && hasSearched ? (
            // ✅ Show "No users found" ONLY IF search was executed and no results were found
            <p className="text-center text-gray-500">❌ No users found</p>
          ) : (
            // ✅ Display user search results
            <div className="max-h-60 overflow-y-auto space-y-2">
              {searchedUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all border border-gray-200 shadow-sm"
                  onClick={() => handleStartChat(user.email)}
                >
                  {/* Avatar */}
                  <img
                    src={user.avatar || "https://via.placeholder.com/50"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border"
                  />

                  {/* User Info */}
                  <div className="flex-1">
                    <p className="font-bold text-gray-800">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>

                  {/* Online/Offline Status */}
                  <div>
                    {user.online ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <MinusCircle className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <h3 className="font-semibold text-gray-500 mb-2">Chats</h3>

      {/* 🔹 Chat List */}
      <div className="flex-grow overflow-y-auto">
        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : Array.isArray(chats) && chats.length > 0 ? (
          chats.map((chat) => (
            <div
              key={chat.chatId}
              onClick={() => dispatch(setSelectedChat(chat))}
              className="flex items-center gap-3 p-3 rounded-lg bg-white shadow-md hover:bg-gray-200 cursor-pointer transition-all my-2"
            >
              {/* Avatar */}
              {chat.friend ? (
                <img
                  src={chat.friend.avatar || "https://via.placeholder.com/50"}
                  alt={chat.friend.name || "UNKNOWN"}
                  className="w-12 h-12 rounded-full object-cover border"
                />
              ) : (
                <p className="text-gray-500">Loading...</p>
              )}

              {/* Chat Details */}
              <div className="flex-1">
                <div className="flex justify-between">
                  {/* Friend's Name */}
                  <p className="font-semibold text-gray-800">
                    {chat.friend.name}
                  </p>

                  {/* Last Updated Time */}
                  <p
                    className={`text-xs ${
                      chat?.unreadCount > 0
                        ? "font-semibold text-rose-400"
                        : "text-gray-500"
                    }`}
                  >
                    {new Date(chat.updatedAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </p>
                </div>

                <div className="flex justify-between">
                  {/* Last Message or Typing Status */}
                  <p className="text-sm text-gray-500 truncate">
                    {typingStatus[chat.chatId] ? (
                      <span className="text-blue-500 font-semibold">
                        Typing...
                      </span>
                    ) : chat.lastMessage ? (
                      chat.lastMessage
                    ) : (
                      "No messages yet"
                    )}
                  </p>

                  {/* Unread Message Count */}
                  {chat?.unreadCount > 0 && (
                    <span className="text-xs font-semibold text-white bg-rose-500 px-2 py-1 rounded-full">
                      {chat?.unreadCount}
                    </span>
                  )}

                  {/* Unread Indicator */}
                  {chat.unread > 0 && (
                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No chats available</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
