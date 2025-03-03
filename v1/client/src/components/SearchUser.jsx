import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers, clearSearchedUsers } from "../redux/features/chat/chatSlice";
import { Video, PhoneCall, X, Search } from "lucide-react";

const SearchUsers = ({ onCall, onClose }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState("");

  // Get search results from Redux
  const searchedUsers = useSelector((state) => state.chat.searchedUsers);
  const loading = useSelector((state) => state.chat.loadingChats); // Use correct loading state

  // Fetch users when typing
  useEffect(() => {
    if (query.length > 2) {
      dispatch(searchUsers(query));
    } else {
      dispatch(clearSearchedUsers()); // Clear results if query is short
    }
  }, [query, dispatch]);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md relative h-96 overflow-y-auto">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={() => {
            dispatch(clearSearchedUsers());
            onClose();
          }}
          className="absolute top-3 right-3 p-2 text-gray-600 hover:text-red-500 transition"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Search Input */}
      <div className="flex items-center border rounded-md overflow-hidden px-2 py-1">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter name or email to start call... "
          className="w-full p-2 outline-none border-none bg-transparent"
        />
        {query.trim() && (
          <button
            onClick={() => setQuery("")}
            className="px-2 text-gray-400 hover:text-red-500 transition"
          >
            ✖
          </button>
        )}
      </div>

      {/* User List */}
      <div className="mt-4">
        {loading ? (
          <p className="text-center text-gray-500">Searching...</p>
        ) : searchedUsers.length > 0 ? (
          searchedUsers.map((user) => (
            <div
              key={user._id}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg shadow-sm hover:bg-gray-100 transition"
            >
              <img
                src={user.avatar || "https://via.placeholder.com/50"}
                alt={user.name}
                className="w-12 h-12 rounded-full border"
              />
              <div className="flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <div className="flex gap-2">
                {/* Start Audio Call */}
                <button
                  onClick={() => onCall(user, "audio")}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"
                  title="Start Audio Call"
                >
                  <PhoneCall className="w-5 h-5" />
                </button>

                {/* Start Video Call */}
                <button
                  onClick={() => onCall(user, "video")}
                  className="p-2 text-green-600 hover:bg-green-100 rounded-full"
                  title="Start Video Call"
                >
                  <Video className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        ) : query.length > 2 ? (
          <p className="text-gray-500 text-center mt-4">😔 No users found</p>
        ) : (
          <p className="text-gray-500 text-center mt-4">Start typing to search...</p>
        )}
      </div>
    </div>
  );
};

export default SearchUsers;
